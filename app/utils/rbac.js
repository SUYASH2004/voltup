// utils/rbac.js - Role-Based Access Control utilities

import { ROLE_PERMISSIONS, PERMISSIONS } from './permissions';

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with role property
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export function hasPermission(user, permission) {
  if (!user || !user.role) return false;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
}

/**
 * Check if user has any of the given permissions
 * @param {Object} user - User object
 * @param {string[]} permissionList - Array of permissions to check
 * @returns {boolean} True if user has at least one permission
 */
export function hasAnyPermission(user, permissionList) {
  if (!Array.isArray(permissionList)) return false;
  return permissionList.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all of the given permissions
 * @param {Object} user - User object
 * @param {string[]} permissionList - Array of permissions to check
 * @returns {boolean} True if user has all permissions
 */
export function hasAllPermissions(user, permissionList) {
  if (!Array.isArray(permissionList)) return false;
  return permissionList.every(permission => hasPermission(user, permission));
}

/**
 * Get user's data access scope based on their role
 * @param {Object} user - User object with role, region, circle, area
 * @returns {Object|null} User's data scope filter
 */
export function getUserDataScope(user) {
  if (!user || !user.role) return null;

  switch (user.role) {
    case 'regional_head':
      return {
        region: user.region,
      };
    case 'circle_head':
      return {
        region: user.region,
        circle: user.circle,
      };
    case 'area_head':
      return {
        region: user.region,
        circle: user.circle,
        area: user.area,
      };
    case 'admin':
      return {}; // Admin can see all
    default:
      return null;
  }
}

/**
 * Get user's display scope (for UI showing what they can access)
 * @param {Object} user - User object
 * @returns {string} Human-readable scope description
 */
export function getUserScopeDisplay(user) {
  if (!user || !user.role) return 'No access';

  switch (user.role) {
    case 'regional_head':
      return `Region: ${user.region?.toUpperCase() || 'N/A'}`;
    case 'circle_head':
      return `Circle: ${user.circle || 'N/A'} (${user.region?.toUpperCase() || 'N/A'})`;
    case 'area_head':
      return `Area: ${user.area || 'N/A'} (${user.circle || 'N/A'}, ${user.region?.toUpperCase() || 'N/A'})`;
    case 'admin':
      return 'System Admin';
    default:
      return 'Unknown';
  }
}

/**
 * Filter data array based on user's access scope
 * @param {Array} data - Array of items to filter
 * @param {Object} user - User object
 * @param {string} regionField - Field name for region (default: 'region')
 * @param {string} circleField - Field name for circle (default: 'circle')
 * @param {string} areaField - Field name for area (default: 'area')
 * @returns {Array} Filtered data
 */
export function filterDataByUserScope(
  data,
  user,
  regionField = 'region',
  circleField = 'circle',
  areaField = 'area'
) {
  if (!user || !Array.isArray(data)) return [];
  const scope = getUserDataScope(user);
  if (!scope) return [];

  // Admin can see everything
  if (user.role === 'admin') return data;

  return data.filter(item => {
    if (user.role === 'regional_head') {
      return item[regionField] === scope.region;
    }
    if (user.role === 'circle_head') {
      return (
        item[regionField] === scope.region &&
        item[circleField] === scope.circle
      );
    }
    if (user.role === 'area_head') {
      return (
        item[regionField] === scope.region &&
        item[circleField] === scope.circle &&
        item[areaField] === scope.area
      );
    }
    return false;
  });
}

/**
 * Check if user can perform action on a specific item
 * Takes into account both role permissions and data scope
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 * @param {Object} item - Item user is trying to access
 * @param {string} regionField - Field name for region in item
 * @param {string} circleField - Field name for circle in item
 * @param {string} areaField - Field name for area in item
 * @returns {boolean} True if user can perform action on item
 */
export function canActionOnItem(
  user,
  permission,
  item,
  regionField = 'region',
  circleField = 'circle',
  areaField = 'area'
) {
  // First check if user has the permission
  if (!hasPermission(user, permission)) return false;

  // Then check if item is in user's scope
  const scope = getUserDataScope(user);
  if (!scope) return false;

  if (user.role === 'admin') return true;

  if (user.role === 'regional_head') {
    return item[regionField] === scope.region;
  }

  if (user.role === 'circle_head') {
    return (
      item[regionField] === scope.region &&
      item[circleField] === scope.circle
    );
  }

  if (user.role === 'area_head') {
    return (
      item[regionField] === scope.region &&
      item[circleField] === scope.circle &&
      item[areaField] === scope.area
    );
  }

  return false;
}

/**
 * Build query filter based on user's scope
 * Useful for backend queries
 * @param {Object} user - User object
 * @param {string} regionField - Field name for region (default: 'region')
 * @param {string} circleField - Field name for circle (default: 'circle')
 * @param {string} areaField - Field name for area (default: 'area')
 * @returns {Object} Query filter object
 */
export function buildScopeFilter(
  user,
  regionField = 'region',
  circleField = 'circle',
  areaField = 'area'
) {
  if (!user) return null;
  const scope = getUserDataScope(user);
  if (!scope) return null;

  if (user.role === 'admin') return {}; // No filter for admin

  const filter = {};
  if (scope.region) filter[regionField] = scope.region;
  if (scope.circle) filter[circleField] = scope.circle;
  if (scope.area) filter[areaField] = scope.area;

  return filter;
}
