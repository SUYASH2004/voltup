// lib/auth/proxy.ts - Route protection middleware

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAMES } from './serverCookies';
import { extractUserFromToken } from './jwt';
import { Permission, ProtectedRoute } from '@/types/auth';
import { hasPermission, hasAllPermissions } from './permissions';

/**
 * STRATEGY: DENY BY DEFAULT, ALLOW SPECIFIC ROUTES
 * 
 * ANY route not listed here MUST have authentication
 * WHITELIST only public pages (login, register, forgot-password)
 * EVERYTHING else requires valid JWT token
 */

/**
 * Routes that are COMPLETELY PUBLIC - No authentication required
 * These are the ONLY routes accessible without login
 */
const COMPLETELY_PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/register',
  '/api/auth/login', // Login endpoint itself
  '/api/auth/refresh', // Token refresh
];

/**
 * Routes that require authentication but no specific permission
 * These can be accessed by ANY authenticated user
 */
const AUTHENTICATED_ROUTES = [
  '/', // Home/Dashboard
  '/test-backend', // Backend test page (only for authenticated)
];

/**
 * Routes with specific permission requirements
 * Format: path -> required permissions
 * 
 * IMPORTANT: This is DEPRECATED in favor of the new strategy
 * We now protect EVERYTHING by default, these are just for granular control
 */
const PERMISSION_ROUTES = new Map<string, ProtectedRoute>([
  // Assets (protect entire section)
  [
    '/assets',
    {
      path: '/assets',
      requiredPermissions: [Permission.VEHICLE_VIEW],
    },
  ],

  // Vehicles
  [
    '/assets/vehicles',
    {
      path: '/assets/vehicles',
      requiredPermissions: [Permission.VEHICLE_VIEW],
    },
  ],
  [
    '/assets/vehicles/[id]/edit',
    {
      path: '/assets/vehicles/[id]/edit',
      requiredPermissions: [Permission.VEHICLE_EDIT],
    },
  ],

  // Batteries
  [
    '/assets/batteries',
    {
      path: '/assets/batteries',
      requiredPermissions: [Permission.BATTERY_VIEW],
    },
  ],
  [
    '/assets/batteries/[id]/edit',
    {
      path: '/assets/batteries/[id]/edit',
      requiredPermissions: [Permission.BATTERY_EDIT],
    },
  ],

  // Charging Stations
  [
    '/assets/charging-stations',
    {
      path: '/assets/charging-stations',
      requiredPermissions: [Permission.STATION_VIEW],
    },
  ],
  [
    '/assets/charging-stations/[id]/edit',
    {
      path: '/assets/charging-stations/[id]/edit',
      requiredPermissions: [Permission.STATION_EDIT],
    },
  ],

  // TCU
  [
    '/assets/tcu',
    {
      path: '/assets/tcu',
      requiredPermissions: [Permission.TCU_VIEW],
    },
  ],
  [
    '/assets/tcu/[id]/edit',
    {
      path: '/assets/tcu/[id]/edit',
      requiredPermissions: [Permission.TCU_EDIT],
    },
  ],

  // Work Orders
  [
    '/work-orders',
    {
      path: '/work-orders',
      requiredPermissions: [Permission.WORKORDER_VIEW],
    },
  ],

  // Reports
  [
    '/reports',
    {
      path: '/reports',
      requiredPermissions: [Permission.REPORT_VIEW],
    },
  ],

  // Settings (only admin)
  [
    '/settings',
    {
      path: '/settings',
      requiredPermissions: [Permission.SYSTEM_SETTINGS],
    },
  ],
]);

/**
 * Check if a route matches a pattern
 * Handles dynamic routes like /assets/vehicles/[id]/edit
 * Also handles parent route matching (e.g., /assets matches /assets/vehicles)
 */
function routeMatches(pathname: string, pattern: string): boolean {
  // Exact match
  if (pathname === pattern) return true;

  // Parent route match (e.g., /assets matches /assets/vehicles)
  if (pathname.startsWith(pattern + '/')) {
    return true;
  }

  // Dynamic segment match
  const patternSegments = pattern.split('/');
  const pathSegments = pathname.split('/');

  if (patternSegments.length !== pathSegments.length) {
    return false;
  }

  for (let i = 0; i < patternSegments.length; i++) {
    const pattern = patternSegments[i];
    const path = pathSegments[i];

    // Skip dynamic segments like [id]
    if (pattern.startsWith('[') && pattern.endsWith(']')) {
      continue;
    }

    if (pattern !== path) {
      return false;
    }
  }

  return true;
}

/**
 * Get permission route config if pathname matches any permission route
 */
function getPermissionRouteConfig(pathname: string): ProtectedRoute | null {
  for (const [, config] of PERMISSION_ROUTES) {
    if (routeMatches(pathname, config.path)) {
      return config;
    }
  }
  return null;
}

/**
 * Main proxy middleware function - DENY BY DEFAULT STRATEGY
 * 
 * Strategy:
 * 1. Allow COMPLETELY_PUBLIC_ROUTES without authentication
 * 2. Redirect non-public routes to login if no token
 * 3. If token exists, validate it
 * 4. If route has specific permissions, check them
 * 5. Otherwise, allow access if authenticated
 *
 * Result: EVERY route is protected except login/register/forgot-password
 *
 * @param request - Next.js request object
 * @returns NextResponse (redirect to login or proceed)
 */
export async function protectRoute(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // Step 1: Allow completely public routes (login, register, etc.)
  if (COMPLETELY_PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Step 2: Read authentication token
  const accessTokenCookie = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN);
  const accessToken = accessTokenCookie?.value || null;

  // Step 3: If no token, redirect to login for ALL non-public routes
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Step 4: Validate token
  const user = extractUserFromToken(accessToken);

  if (!user) {
    // Token invalid or expired
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Step 5: Check if this route has specific permission requirements
  const permissionRoute = getPermissionRouteConfig(pathname);

  if (permissionRoute) {
    // This route has specific permission requirements
    const hasRequiredPermissions = permissionRoute.requireAll
      ? hasAllPermissions(user, permissionRoute.requiredPermissions)
      : permissionRoute.requiredPermissions.some((permission) =>
          hasPermission(user, permission)
        );

    if (!hasRequiredPermissions) {
      // User lacks required permissions
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }

    // Check roles if specified
    if (
      permissionRoute.roles &&
      !permissionRoute.roles.includes(user.role)
    ) {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }

  // Step 6: User is authenticated (and has required permissions if applicable)
  // ALLOW ACCESS
  return NextResponse.next();
}

/**
 * Check if a route has specific permission requirements
 */
export function hasRoutePermissions(pathname: string): boolean {
  return getPermissionRouteConfig(pathname) !== null;
}

/**
 * Get required permissions for a route
 */
export function getRoutePermissions(pathname: string): Permission[] | null {
  const route = getPermissionRouteConfig(pathname);
  return route?.requiredPermissions || null;
}

/**
 * Add a new permission route dynamically
 */
export function addPermissionRoute(route: ProtectedRoute): void {
  PERMISSION_ROUTES.set(route.path, route);
}

/**
 * Register multiple permission routes
 */
export function registerPermissionRoutes(routes: ProtectedRoute[]): void {
  routes.forEach((route) => {
    PERMISSION_ROUTES.set(route.path, route);
  });
}

