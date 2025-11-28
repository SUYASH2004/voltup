// hooks/usePermission.js - Custom hook for permission checking

'use client';

import { useSession } from 'next-auth/react';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/utils/rbac';

/**
 * Custom hook for permission checking
 * Returns a permission API that can be used in components
 */
export function usePermission() {
  const { data: session } = useSession();

  return {
    /**
     * Check if user has a specific permission
     */
    can: (permission) => {
      return hasPermission(session?.user, permission);
    },

    /**
     * Check if user has any of the given permissions
     */
    canAny: (permissions) => {
      return hasAnyPermission(session?.user, permissions);
    },

    /**
     * Check if user has all of the given permissions
     */
    canAll: (permissions) => {
      return hasAllPermissions(session?.user, permissions);
    },

    /**
     * Get the user object
     */
    user: session?.user || null,

    /**
     * Check if user is authenticated
     */
    isAuthenticated: !!session?.user,

    /**
     * Get user's role
     */
    role: session?.user?.role || null,
  };
}

export default usePermission;
