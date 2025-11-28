// app/assets/config/tabs.ts - Tab configuration with permissions

import { Permission } from '@/types/auth';
import { Bike, Battery, Zap, Cpu, Settings } from 'lucide-react';

/**
 * Tab configuration interface
 * Used to define which tabs are visible and what permissions they require
 */
export interface TabConfig {
  href: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  permission?: Permission;  // Required permission to see tab
  roles?: string[];         // Required roles to see tab (any one of these)
}

/**
 * Asset tabs configuration
 * Each tab can have:
 * - permission: User must have this permission
 * - roles: User must have one of these roles
 * 
 * Tabs are filtered based on both permission AND role checks
 */
export const ASSET_TABS: TabConfig[] = [
  {
    href: '/assets/vehicles',
    label: 'Vehicles',
    shortLabel: 'Vehicles',
    icon: <Bike className="w-4 h-4 sm:w-5 sm:h-5" />,
    permission: Permission.VEHICLE_VIEW,
  },
  {
    href: '/assets/batteries',
    label: 'Batteries',
    shortLabel: 'Batteries',
    icon: <Battery className="w-4 h-4 sm:w-5 sm:h-5" />,
    permission: Permission.BATTERY_VIEW,
  },
  {
    href: '/assets/charging-stations',
    label: 'Charging Stations',
    shortLabel: 'Stations',
    icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
    permission: Permission.STATION_VIEW,
  },
  {
    href: '/assets/tcu',
    label: 'TCU',
    shortLabel: 'TCU',
    icon: <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />,
    permission: Permission.TCU_VIEW,
  },
  {
    href: '/assets/tenant-config',
    label: 'Tenant Configuration',
    shortLabel: 'Config',
    icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" />,
    permission: Permission.TENANT_VIEW,
    roles: ['tenant_manager'],  // Only tenant_manager role can see this
  },
];

/**
 * Get visible tabs for a user based on permissions
 * Used to filter ASSET_TABS to only show what user can access
 */
export function getVisibleTabs(
  user: { role: string; permissions: string[] } | null,
  tabs: TabConfig[] = ASSET_TABS
): TabConfig[] {
  if (!user) return [];

  return tabs.filter((tab) => {
    // Check permission if defined
    if (tab.permission && !user.permissions.includes(tab.permission)) {
      return false;
    }

    // Check role if defined (user must have ONE of the roles)
    if (tab.roles && !tab.roles.includes(user.role)) {
      return false;
    }

    return true;
  });
}
