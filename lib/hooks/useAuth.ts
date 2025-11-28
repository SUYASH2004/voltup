// lib/hooks/useAuth.ts - NextAuth-based auth hook with permission checking

'use client';

import { useSession } from 'next-auth/react';
import { Permission } from '@/types/auth';

/**
 * useAuth hook - Works with NextAuth
 * 
 * Provides permission and role checking utilities
 * User data comes from NextAuth session
 * 
 * Usage:
 * const { user, can, canAll, hasRole, isLoading } = useAuth();
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const user = session?.user;

  /**
   * Check if user has a specific permission
   * Example: can('vehicle.view')
   */
  const can = (permission: Permission | string): boolean => {
    if (!user?.permissions) return false;
    return (user.permissions as string[]).includes(permission as string);
  };

  /**
   * Check if user has ANY of the given permissions
   */
  const canAny = (permissions: (Permission | string)[]): boolean => {
    if (!user?.permissions) return false;
    const userPerms = user.permissions as string[];
    return permissions.some((p) => userPerms.includes(p as string));
  };

  /**
   * Check if user has ALL of the given permissions
   */
  const canAll = (permissions: (Permission | string)[]): boolean => {
    if (!user?.permissions) return false;
    const userPerms = user.permissions as string[];
    return permissions.every((p) => userPerms.includes(p as string));
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user has ANY of the given roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes((user?.role as string) || '');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    // Permission checks
    can,
    canAny,
    canAll,
    // Role checks
    hasRole,
    hasAnyRole,
  };
}

/**
 * Hook to get only user data
 */
export function useAuthUser() {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check if currently authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to check if auth is loading
 */
export function useIsAuthLoading() {
  const { isLoading } = useAuth();
  return isLoading;
}

