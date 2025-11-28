// components/Can.tsx - Permission-based rendering component

'use client';

import React from 'react';
import { useUser } from '@/contexts/AuthContext';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';

interface CanProps {
  /**
   * Single permission or array of permissions to check
   */
  permission?: Permission | Permission[];

  /**
   * If true, user must have ALL permissions
   * If false (default), user must have ANY permission
   */
  requireAll?: boolean;

  /**
   * Content to render if user has permission
   */
  children: React.ReactNode;

  /**
   * Content to render if user doesn't have permission
   * If not provided, nothing is rendered
   */
  fallback?: React.ReactNode;

  /**
   * For debugging: log permission checks
   */
  debug?: boolean;
}

/**
 * Can component - Permission-driven conditional rendering
 *
 * Examples:
 *
 * Single permission:
 * <Can permission={Permission.VEHICLE_VIEW}>
 *   <VehicleList />
 * </Can>
 *
 * Multiple permissions (require any):
 * <Can permission={[Permission.VEHICLE_EDIT, Permission.VEHICLE_DELETE]}>
 *   <EditButton />
 * </Can>
 *
 * Multiple permissions (require all):
 * <Can permission={[Permission.VEHICLE_EDIT, Permission.VEHICLE_DELETE]} requireAll>
 *   <EditAndDeleteButton />
 * </Can>
 *
 * With fallback:
 * <Can permission={Permission.VEHICLE_DELETE} fallback={<p>Cannot delete</p>}>
 *   <DeleteButton />
 * </Can>
 */
export function Can({
  permission,
  requireAll = false,
  children,
  fallback = null,
  debug = false,
}: CanProps) {
  const user = useUser();

  // No permission specified
  if (!permission) {
    if (debug) console.log('Can: No permission specified');
    return <>{children}</>;
  }

  // No user (not authenticated)
  if (!user) {
    if (debug) console.log('Can: No user authenticated');
    return <>{fallback}</>;
  }

  let hasAccess = false;

  if (typeof permission === 'string') {
    // Single permission
    hasAccess = hasPermission(user, permission);
    if (debug) {
      console.log(`Can: Check permission "${permission}":`, hasAccess);
    }
  } else if (Array.isArray(permission)) {
    // Multiple permissions
    if (requireAll) {
      hasAccess = hasAllPermissions(user, permission);
      if (debug) {
        console.log(
          `Can: Check ALL permissions [${permission.join(', ')}]:`,
          hasAccess
        );
      }
    } else {
      hasAccess = hasAnyPermission(user, permission);
      if (debug) {
        console.log(
          `Can: Check ANY permission [${permission.join(', ')}]:`,
          hasAccess
        );
      }
    }
  }

  return <>{hasAccess ? children : fallback}</>;
}

/**
 * CanView - Render only if user can view
 * Shorthand for <Can permission={`${resource}.view`} />
 */
export function CanView({
  resource,
  children,
  fallback = null,
}: {
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const permission = `${resource}.view` as Permission;
  return (
    <Can permission={permission} fallback={fallback}>
      {children}
    </Can>
  );
}

/**
 * CanCreate - Render only if user can create
 */
export function CanCreate({
  resource,
  children,
  fallback = null,
}: {
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const permission = `${resource}.create` as Permission;
  return (
    <Can permission={permission} fallback={fallback}>
      {children}
    </Can>
  );
}

/**
 * CanEdit - Render only if user can edit
 */
export function CanEdit({
  resource,
  children,
  fallback = null,
}: {
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const permission = `${resource}.edit` as Permission;
  return (
    <Can permission={permission} fallback={fallback}>
      {children}
    </Can>
  );
}

/**
 * CanDelete - Render only if user can delete
 */
export function CanDelete({
  resource,
  children,
  fallback = null,
}: {
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const permission = `${resource}.delete` as Permission;
  return (
    <Can permission={permission} fallback={fallback}>
      {children}
    </Can>
  );
}

export default Can;
