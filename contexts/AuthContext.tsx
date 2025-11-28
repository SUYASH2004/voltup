// contexts/AuthContext.tsx - Authentication context

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AuthState, AuthUser } from '@/types/auth';
import { initializeAuth, getCurrentUser, refreshAccessToken } from '@/lib/auth/client';

/**
 * Auth context actions
 */
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TOKEN_EXPIRES_AT'; payload: number | null }
  | { type: 'LOGOUT' };

/**
 * Auth context value type
 */
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

/**
 * Create auth context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Initial auth state
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading while checking auth status
  error: null,
  tokenExpiresAt: null,
};

/**
 * Auth reducer function
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_TOKEN_EXPIRES_AT':
      return {
        ...state,
        tokenExpiresAt: action.payload,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    default:
      return state;
  }
}

/**
 * AuthProvider component
 * Wrap your app with this at the root level
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Initialize auth on mount
   * Check if user is still logged in
   */
  useEffect(() => {
    const init = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const user = await initializeAuth();

        if (user) {
          dispatch({ type: 'SET_USER', payload: user });
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Auth initialization failed',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    init();
  }, []);

  /**
   * Setup token refresh timer
   * Refresh token 5 minutes before expiry
   */
  useEffect(() => {
    if (!state.tokenExpiresAt) return;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = state.tokenExpiresAt - now;

    // Refresh if less than 5 minutes remaining
    if (timeUntilExpiry < 5 * 60) {
      const refreshTimer = setTimeout(async () => {
        try {
          await refreshAccessToken();
          const user = await getCurrentUser();
          dispatch({ type: 'SET_USER', payload: user });
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      }, Math.max(0, timeUntilExpiry - 60) * 1000);

      return () => clearTimeout(refreshTimer);
    }
  }, [state.tokenExpiresAt]);

  /**
   * Login function
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Call our API route which forwards to FastAPI
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || error.message || 'Login failed'
        );
      }

      const data = await response.json();

      // Get user from token stored in cookie
      const user = await getCurrentUser();

      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Call logout endpoint to clear cookies and notify backend
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if backend call fails
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  /**
   * Refresh token function
   */
  const refreshToken = useCallback(async () => {
    try {
      await refreshAccessToken();
      const user = await getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Token refresh failed',
      });
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * Must be called in a client component within AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook to get current user
 * Returns user object or null
 */
export function useUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to check if auth is still loading
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}
