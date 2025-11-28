// utils/permissions.js - Permission constants for RBAC

export const PERMISSIONS = {
  // Vehicles
  VEHICLE_VIEW: 'vehicle:view',
  VEHICLE_CREATE: 'vehicle:create',
  VEHICLE_EDIT: 'vehicle:edit',
  VEHICLE_DELETE: 'vehicle:delete',
  VEHICLE_EXPORT: 'vehicle:export',

  // Batteries
  BATTERY_VIEW: 'battery:view',
  BATTERY_CREATE: 'battery:create',
  BATTERY_EDIT: 'battery:edit',
  BATTERY_DELETE: 'battery:delete',
  BATTERY_EXPORT: 'battery:export',

  // Charging Stations
  STATION_VIEW: 'station:view',
  STATION_CREATE: 'station:create',
  STATION_EDIT: 'station:edit',
  STATION_DELETE: 'station:delete',
  STATION_EXPORT: 'station:export',

  // TCU (Telematics Control Unit)
  TCU_VIEW: 'tcu:view',
  TCU_CREATE: 'tcu:create',
  TCU_EDIT: 'tcu:edit',
  TCU_DELETE: 'tcu:delete',
  TCU_EXPORT: 'tcu:export',

  // Work Orders
  WORKORDER_VIEW: 'workorder:view',
  WORKORDER_CREATE: 'workorder:create',
  WORKORDER_EDIT: 'workorder:edit',
  WORKORDER_DELETE: 'workorder:delete',
  WORKORDER_COMPLETE: 'workorder:complete',
  WORKORDER_EXPORT: 'workorder:export',

  // Reports
  REPORT_VIEW: 'report:view',
  REPORT_CREATE: 'report:create',
  REPORT_EXPORT: 'report:export',

  // User Management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',

  // System
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_AUDIT: 'system:audit',
};

/**
 * Role to Permissions mapping
 * Define what each role can do
 */
export const ROLE_PERMISSIONS = {
  regional_head: [
    // View all assets in their region
    PERMISSIONS.VEHICLE_VIEW,
    PERMISSIONS.BATTERY_VIEW,
    PERMISSIONS.STATION_VIEW,
    PERMISSIONS.TCU_VIEW,

    // Work orders
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_CREATE,

    // Reports
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.REPORT_EXPORT,

    // Can see users in their region
    PERMISSIONS.USER_VIEW,
  ],

  circle_head: [
    // View and edit assets in their circle
    PERMISSIONS.VEHICLE_VIEW,
    PERMISSIONS.VEHICLE_EDIT,
    PERMISSIONS.BATTERY_VIEW,
    PERMISSIONS.BATTERY_EDIT,
    PERMISSIONS.STATION_VIEW,
    PERMISSIONS.STATION_EDIT,
    PERMISSIONS.TCU_VIEW,
    PERMISSIONS.TCU_EDIT,

    // Work orders
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_CREATE,
    PERMISSIONS.WORKORDER_EDIT,
    PERMISSIONS.WORKORDER_COMPLETE,

    // Reports
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.REPORT_EXPORT,

    // Can see users in their circle
    PERMISSIONS.USER_VIEW,
  ],

  area_head: [
    // View and edit assets in their area
    PERMISSIONS.VEHICLE_VIEW,
    PERMISSIONS.VEHICLE_EDIT,
    PERMISSIONS.BATTERY_VIEW,
    PERMISSIONS.BATTERY_EDIT,
    PERMISSIONS.STATION_VIEW,
    PERMISSIONS.STATION_EDIT,
    PERMISSIONS.TCU_VIEW,
    PERMISSIONS.TCU_EDIT,

    // Work orders
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_CREATE,
    PERMISSIONS.WORKORDER_EDIT,
    PERMISSIONS.WORKORDER_COMPLETE,

    // Reports
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.REPORT_EXPORT,

    // Can see users in their area
    PERMISSIONS.USER_VIEW,
  ],

  admin: [
    // Full access
    ...Object.values(PERMISSIONS),
  ],
};
