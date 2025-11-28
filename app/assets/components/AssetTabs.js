'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Bike, Battery, Zap, Cpu, Settings } from 'lucide-react';

/**
 * Asset tabs with role-based visibility
 * 
 * Features:
 * - Filters tabs based on user permissions (from backend at login)
 * - Uses useAuth hook to check permissions
 * - Server-side protection via proxy.ts (real enforcement)
 * - Client-side filtering (for better UX)
 * 
 * Security layers:
 * 1. Proxy (server): Blocks unauthorized route access
 * 2. Component (client): Hides unauthorized tabs from UI
 * 3. Backend (server): Validates data access
 * 
 * Even if user manipulates this to show hidden tabs, proxy blocks them.
 */
export default function AssetTabs() {
  const pathname = usePathname();
  const { user, can, hasRole, isLoading } = useAuth();

  // Tab configurations with permissions
  const allTabs = [
    {
      href: '/assets/vehicles',
      label: 'Vehicles',
      shortLabel: 'Vehicles',
      icon: <Bike className="w-4 h-4 sm:w-5 sm:h-5" />,
      permission: 'vehicle.view',
    },
    {
      href: '/assets/batteries',
      label: 'Batteries',
      shortLabel: 'Batteries',
      icon: <Battery className="w-4 h-4 sm:w-5 sm:h-5" />,
      permission: 'battery.view',
    },
    {
      href: '/assets/charging-stations',
      label: 'Charging Stations',
      shortLabel: 'Stations',
      icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
      permission: 'station.view',
    },
    {
      href: '/assets/tcu',
      label: 'TCU',
      shortLabel: 'TCU',
      icon: <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />,
      permission: 'tcu.view',
    },
    {
      href: '/assets/tenant-config',
      label: 'Tenant Config',
      shortLabel: 'Config',
      icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" />,
      permission: 'tenant.view',
      roles: ['tenant_manager'],
    },
  ];

  // Show loading state to prevent hydration mismatch
  if (isLoading) {
    return (
      <div className="border-b border-gray-200 bg-white h-12 animate-pulse" />
    );
  }

  // Filter tabs based on user permissions
  const visibleTabs = allTabs.filter((tab) => {
    // Check permission if defined
    if (tab.permission && !can(tab.permission)) {
      return false;
    }

    // Check role if defined (user must have ONE of the roles)
    if (tab.roles && !tab.roles.includes(user?.role)) {
      return false;
    }

    return true;
  });

  // Show message if no tabs are available
  if (visibleTabs.length === 0) {
    return (
      <div className="border-b border-gray-200 bg-white p-4 text-center text-gray-500">
        <p className="text-sm">No asset tabs available for your role</p>
        <p className="text-xs mt-1 text-gray-400">
          Contact administrator if you believe this is an error
        </p>
      </div>
    );
  }

  const isActive = (href) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex space-x-0.5 sm:space-x-1 overflow-x-auto scrollbar-hide px-2 sm:px-4">
        {visibleTabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap min-w-fit ${
                active
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
              title={`${tab.label} (${tab.permission || 'public'})`}
            >
              <span className={`shrink-0 ${active ? 'text-emerald-600' : 'text-gray-500'}`}>
                {tab.icon}
              </span>
              <span className="hidden xs:inline sm:hidden md:inline">{tab.label}</span>
              <span className="xs:hidden md:hidden">{tab.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
