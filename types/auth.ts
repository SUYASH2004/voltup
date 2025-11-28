// types/auth.ts - Complete authentication types

/**
 * User role definitions
 */
export enum UserRole {
  TENANT_MANAGER = 'tenant_manager',
  REGIONAL_HEAD = 'regional_head',
  CIRCLE_HEAD = 'circle_head',
  AREA_HEAD = 'area_head',
  ADMIN = 'admin',
}

/**
 * All possible permissions in the system
 * Format: "resource.action"
 */
export enum Permission {
  // Tenant Management (Tenant Manager only)
  TENANT_VIEW = 'tenant.view',
  TENANT_EDIT = 'tenant.edit',
  TENANT_CREATE = 'tenant.create',

  // Vehicles
  VEHICLE_VIEW = 'vehicle.view',
  VEHICLE_CREATE = 'vehicle.create',
  VEHICLE_EDIT = 'vehicle.edit',
  VEHICLE_DELETE = 'vehicle.delete',
  VEHICLE_EXPORT = 'vehicle.export',

  // Batteries
  BATTERY_VIEW = 'battery.view',
  BATTERY_CREATE = 'battery.create',
  BATTERY_EDIT = 'battery.edit',
  BATTERY_DELETE = 'battery.delete',
  BATTERY_EXPORT = 'battery.export',

  // Charging Stations
  STATION_VIEW = 'station.view',
  STATION_CREATE = 'station.create',
  STATION_EDIT = 'station.edit',
  STATION_DELETE = 'station.delete',
  STATION_EXPORT = 'station.export',

  // TCU
  TCU_VIEW = 'tcu.view',
  TCU_CREATE = 'tcu.create',
  TCU_EDIT = 'tcu.edit',
  TCU_DELETE = 'tcu.delete',
  TCU_EXPORT = 'tcu.export',

  // Work Orders
  WORKORDER_VIEW = 'workorder.view',
  WORKORDER_CREATE = 'workorder.create',
  WORKORDER_EDIT = 'workorder.edit',
  WORKORDER_DELETE = 'workorder.delete',
  WORKORDER_COMPLETE = 'workorder.complete',

  // Reports
  REPORT_VIEW = 'report.view',
  REPORT_CREATE = 'report.create',
  REPORT_EXPORT = 'report.export',

  // Users
  USER_VIEW = 'user.view',
  USER_CREATE = 'user.create',
  USER_EDIT = 'user.edit',
  USER_DELETE = 'user.delete',

  // System
  SYSTEM_SETTINGS = 'system.settings',
  SYSTEM_AUDIT = 'system.audit',
}

/**
 * Decoded JWT payload
 * This is what the backend returns and what's decoded from the JWT token
 */
export interface JWTPayload {
  userId: string;
  username: string;
  email?: string;
  role: UserRole;
  permissions: Permission[];
  region?: string;
  circle?: string;
  area?: string;
  iat: number; // issued at
  exp: number; // expiration
  aud?: string; // audience
  iss?: string; // issuer
}

/**
 * User object stored in session/auth context
 * This is what the frontend uses throughout the application
 */
export interface AuthUser {
  userId: string;
  username: string;
  email?: string;
  role: UserRole;
  permissions: Permission[];
  region?: string;
  circle?: string;
  area?: string;
}

/**
 * Login request/response types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  region?: string;
  circle?: string;
  area?: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds, typically 900 (15 minutes)
}

/**
 * Refresh token request/response
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * Token data structure (what's stored in cookies)
 */
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  createdAt: number; // timestamp
}

/**
 * Authentication state in context
 */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiresAt: number | null;
}

/**
 * Cookie options configuration
 */
export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Route configuration with permissions
 */
export interface ProtectedRoute {
  path: string;
  requiredPermissions: Permission[];
  requireAll?: boolean; // if true, user must have ALL permissions; if false, ANY is enough
  roles?: UserRole[]; // optional: also check specific roles
}

/**
 * API error response
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}
