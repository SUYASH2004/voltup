// components/ProtectedComponent.js - Component for conditional rendering based on permissions

'use client';

import usePermission from '@/hooks/usePermission';

/**
 * ProtectedComponent - Conditionally renders children based on user permissions
 *
 * @param {string|string[]} permission - Single permission or array of permissions
 * @param {React.ReactNode} children - Content to render if user has permission
 * @param {React.ReactNode} fallback - Content to render if user doesn't have permission
 * @param {boolean} requireAll - If true, require all permissions; if false, require any (default: false)
 * @param {Object} user - Optional user object to override session user
 *
 * @example
 * // Single permission
 * <ProtectedComponent permission="vehicle:edit">
 *   <button>Edit Vehicle</button>
 * </ProtectedComponent>
 *
 * // Multiple permissions (requires any)
 * <ProtectedComponent permission={["vehicle:edit", "vehicle:create"]}>
 *   <button>Create or Edit</button>
 * </ProtectedComponent>
 *
 * // With fallback
 * <ProtectedComponent
 *   permission="vehicle:delete"
 *   fallback={<p>You don't have permission</p>}
 * >
 *   <button>Delete</button>
 * </ProtectedComponent>
 */
export function ProtectedComponent({
  permission,
  children,
  fallback = null,
  requireAll = false,
  user = null,
}) {
  const { can, canAny, canAll, user: sessionUser } = usePermission();
  const currentUser = user || sessionUser;

  if (!currentUser) {
    return fallback;
  }

  let hasAccess = false;

  if (typeof permission === 'string') {
    hasAccess = can(permission);
  } else if (Array.isArray(permission)) {
    hasAccess = requireAll ? canAll(permission) : canAny(permission);
  }

  return hasAccess ? children : fallback;
}

export default ProtectedComponent;
