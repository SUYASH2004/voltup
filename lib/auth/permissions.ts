// lib/auth/permissions.ts - Permission checking utilities

import { Permission, UserRole, AuthUser } from '@/types/auth';

/**
 * Check if user has a specific permission
 *
 * @param user - User object with permissions array
 * @param permission - Permission to check (e.g., "vehicle.view")
 * @returns true if user has permission
 */
export function hasPermission(
  user: AuthUser | null,
  permission: Permission | string
): boolean {
  if (!user) return false;

  if (!Array.isArray(user.permissions)) {
    console.warn('User permissions is not an array:', user.permissions);
    return false;
  }

  return user.permissions.includes(permission as Permission);
}

/**
 * Check if user has ANY of the given permissions
 *
 * @param user - User object
 * @param permissions - Array of permissions to check
 * @returns true if user has at least one permission
 */
export function hasAnyPermission(
  user: AuthUser | null,
  permissions: (Permission | string)[]
): boolean {
  if (!user || !Array.isArray(permissions)) return false;

  return permissions.some((permission) =>
    hasPermission(user, permission)
  );
}

/**
 * Check if user has ALL of the given permissions
 *
 * @param user - User object
 * @param permissions - Array of permissions to check
 * @returns true if user has all permissions
 */
export function hasAllPermissions(
  user: AuthUser | null,
  permissions: (Permission | string)[]
): boolean {
  if (!user || !Array.isArray(permissions)) return false;

  return permissions.every((permission) =>
    hasPermission(user, permission)
  );
}

/**
 * Check if user has a specific role
 *
 * @param user - User object
 * @param role - Role to check
 * @returns true if user has role
 */
export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if user has any of the given roles
 *
 * @param user - User object
 * @param roles - Array of roles to check
 * @returns true if user has at least one role
 */
export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user || !Array.isArray(roles)) return false;
  return roles.includes(user.role);
}

/**
 * Check if user can access a specific region/circle/area
 * Based on their role and scope
 *
 * @param user - User object
 * @param targetRegion - Region to access
 * @param targetCircle - Circle to access (optional)
 * @param targetArea - Area to access (optional)
 * @returns true if user can access
 */
export function canAccessScope(
  user: AuthUser | null,
  targetRegion: string,
  targetCircle?: string,
  targetArea?: string
): boolean {
  if (!user) return false;

  switch (user.role) {
    case UserRole.ADMIN:
      return true;

    case UserRole.REGIONAL_HEAD:
      // Can access own region
      return user.region === targetRegion;

    case UserRole.CIRCLE_HEAD:
      // Can access own region and circle
      return (
        user.region === targetRegion &&
        (!targetCircle || user.circle === targetCircle)
      );

    case UserRole.AREA_HEAD:
      // Can access own region, circle, and area
      return (
        user.region === targetRegion &&
        (!targetCircle || user.circle === targetCircle) &&
        (!targetArea || user.area === targetArea)
      );

    default:
      return false;
  }
}

/**
 * Get displayable user scope
 * For UI showing what user can access
 *
 * @param user - User object
 * @returns Human-readable scope string
 */
export function getUserScope(user: AuthUser | null): string {
  if (!user) return 'No access';

  switch (user.role) {
    case UserRole.ADMIN:
      return 'System Admin - Full Access';

    case UserRole.REGIONAL_HEAD:
      return `Regional Head - Region: ${user.region?.toUpperCase() || 'N/A'}`;

    case UserRole.CIRCLE_HEAD:
      return `Circle Head - ${user.circle || 'N/A'} (${user.region?.toUpperCase() || 'N/A'})`;

    case UserRole.AREA_HEAD:
      return `Area Head - ${user.area || 'N/A'} (${user.circle || 'N/A'})`;

    default:
      return 'Unknown Role';
  }
}

/**
 * Get permissions that user does NOT have
 * Useful for hiding entire sections if user lacks multiple permissions
 *
 * @param user - User object
 * @param requiredPermissions - Permissions to check
 * @returns Array of missing permissions
 */
export function getMissingPermissions(
  user: AuthUser | null,
  requiredPermissions: (Permission | string)[]
): (Permission | string)[] {
  if (!user) return requiredPermissions;

  return requiredPermissions.filter(
    (permission) => !hasPermission(user, permission)
  );
}

/**
 * Filter array of items by user's accessible scope
 * Used in list pages to show only accessible items
 *
 * @param items - Array of items with region/circle/area properties
 * @param user - User object
 * @returns Filtered array
 */
export function filterByUserScope<
  T extends { region?: string; circle?: string; area?: string }
>(items: T[], user: AuthUser | null): T[] {
  if (!user) return [];

  return items.filter((item) =>
    canAccessScope(user, item.region || '', item.circle, item.area)
  );
}

/**
 * Check if a permission string is valid
 * Used for validation in configuration
 *
 * @param permission - Permission string to check
 * @returns true if valid
 */
export function isValidPermission(permission: string): boolean {
  // Check if permission follows "resource.action" format
  const parts = permission.split('.');
  if (parts.length !== 2) return false;

  const [resource, action] = parts;
  return (
    resource.length > 0 &&
    action.length > 0 &&
    /^[a-z_]+$/.test(resource) &&
    /^[a-z_]+$/.test(action)
  );
}
