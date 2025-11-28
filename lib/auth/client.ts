// lib/auth/client.ts - Client-side auth helper functions

'use client';

import { decodeJWT, extractUserFromToken, isTokenExpired } from './jwt';
import { getAccessToken, getRefreshToken, shouldRefreshToken } from './clientCookies';
import { AuthUser } from '@/types/auth';

/**
 * Refresh access token using refresh token
 * Called when access token is about to expire
 *
 * @returns new access token or null if refresh failed
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    // Call our API route which handles calling FastAPI
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.accessToken || null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

/**
 * Get current user from access token
 * Used to populate auth context
 *
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return null;
    }

    // Check if token is expired
    if (isTokenExpired(accessToken)) {
      // Try to refresh
      const newToken = await refreshAccessToken();

      if (!newToken) {
        return null;
      }

      // Extract user from new token
      return extractUserFromToken(newToken);
    }

    // Extract user from current token
    return extractUserFromToken(accessToken);
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Initialize auth on app startup
 * Checks if user is still authenticated, refreshes if needed
 *
 * @returns User object if authenticated, null otherwise
 */
export async function initializeAuth(): Promise<AuthUser | null> {
  try {
    // Check if token needs refresh
    const needsRefresh = await shouldRefreshToken();

    if (needsRefresh) {
      const newToken = await refreshAccessToken();

      if (!newToken) {
        // Refresh failed, user needs to login again
        return null;
      }
    }

    return getCurrentUser();
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    return null;
  }
}

/**
 * Make authenticated API request to FastAPI backend
 * Automatically handles token refresh
 *
 * @param endpoint - API endpoint (e.g., '/api/vehicles')
 * @param options - Fetch options
 * @returns Response from backend
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Check if token needs refresh
    const needsRefresh = await shouldRefreshToken();

    if (needsRefresh) {
      const newToken = await refreshAccessToken();

      if (!newToken) {
        throw new Error('Token refresh failed');
      }
    }

    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Make request with Authorization header
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    });

    // Handle 401 - token might be invalid despite our checks
    if (response.status === 401) {
      // Try one more refresh
      const newToken = await refreshAccessToken();

      if (newToken) {
        // Retry request with new token
        return apiRequest(endpoint, options);
      }

      // Refresh failed, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      throw new Error('Unauthorized - please login again');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
