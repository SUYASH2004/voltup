// Role-based access control utilities

export const ROLES = {
  REGIONAL_HEAD: 'regional_head',
  CIRCLE_HEAD: 'circle_head',
  AREA_HEAD: 'area_head',
};

export const REGIONS = {
  WEST: 'west',
  EAST: 'east',
  NORTH: 'north',
  SOUTH: 'south',
};

/**
 * Check if user has access to a specific region
 */
export function hasRegionAccess(user, region) {
  if (!user || !user.role) return false;

  // Regional head can only see their region
  if (user.role === ROLES.REGIONAL_HEAD) {
    return user.region === region;
  }

  // Circle head can see their region
  if (user.role === ROLES.CIRCLE_HEAD) {
    return user.region === region;
  }

  // Area head can see their region
  if (user.role === ROLES.AREA_HEAD) {
    return user.region === region;
  }

  return false;
}

/**
 * Check if user has access to a specific circle
 */
export function hasCircleAccess(user, circle) {
  if (!user || !user.role) return false;

  // Regional head can see all circles in their region
  if (user.role === ROLES.REGIONAL_HEAD) {
    return true; // They can see all circles in their region
  }

  // Circle head can only see their circle
  if (user.role === ROLES.CIRCLE_HEAD) {
    return user.circle === circle;
  }

  // Area head can see their circle
  if (user.role === ROLES.AREA_HEAD) {
    return user.circle === circle;
  }

  return false;
}

/**
 * Check if user has access to a specific area
 */
export function hasAreaAccess(user, area) {
  if (!user || !user.role) return false;

  // Regional head can see all areas in their region
  if (user.role === ROLES.REGIONAL_HEAD) {
    return true;
  }

  // Circle head can see all areas in their circle
  if (user.role === ROLES.CIRCLE_HEAD) {
    return true;
  }

  // Area head can only see their area
  if (user.role === ROLES.AREA_HEAD) {
    return user.area === area;
  }

  return false;
}

/**
 * Get user's accessible scope description
 */
export function getUserScope(user) {
  if (!user || !user.role) return 'No access';

  switch (user.role) {
    case ROLES.REGIONAL_HEAD:
      return `Region: ${user.region?.toUpperCase() || 'N/A'}`;
    case ROLES.CIRCLE_HEAD:
      return `Circle: ${user.circle || 'N/A'} (${user.region?.toUpperCase() || 'N/A'})`;
    case ROLES.AREA_HEAD:
      return `Area: ${user.area || 'N/A'} (${user.circle || 'N/A'}, ${user.region?.toUpperCase() || 'N/A'})`;
    default:
      return 'Unknown role';
  }
}

/**
 * Filter data based on user's role and scope
 */
export function filterDataByUserAccess(data, user) {
  if (!user || !user.role) return [];

  switch (user.role) {
    case ROLES.REGIONAL_HEAD:
      // Regional head sees all data in their region
      return data.filter((item) => item.region === user.region);
    
    case ROLES.CIRCLE_HEAD:
      // Circle head sees all data in their circle
      return data.filter(
        (item) => item.region === user.region && item.circle === user.circle
      );
    
    case ROLES.AREA_HEAD:
      // Area head sees only their area data
      return data.filter(
        (item) =>
          item.region === user.region &&
          item.circle === user.circle &&
          item.area === user.area
      );
    
    default:
      return [];
  }
}

