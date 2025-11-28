// components/ProtectedTab.tsx - Tab component with permission control

'use client';

import React from 'react';
import { useUser } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';
import Link from 'next/link';

interface ProtectedTabProps {
  /**
   * Tab label/display text
   */
  label: string;

  /**
   * Short label for mobile
   */
  shortLabel?: string;

  /**
   * href to navigate to
   */
  href: string;

  /**
   * Permission required to show tab
   */
  permission: Permission | Permission[];

  /**
   * If true, require ALL permissions
   */
  requireAll?: boolean;

  /**
   * Whether this tab is currently active
   */
  isActive?: boolean;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Icon component
   */
  icon?: React.ReactNode;
}

/**
 * ProtectedTab - Tab that only renders if user has permission
 *
 * Usage in AssetTabs:
 * <ProtectedTab
 *   label="Vehicles"
 *   shortLabel="Vehicles"
 *   href="/assets/vehicles"
 *   permission={Permission.VEHICLE_VIEW}
 *   isActive={pathname.includes('/vehicles')}
 *   icon={<VehicleIcon />}
 * />
 */
export function ProtectedTab({
  label,
  shortLabel,
  href,
  permission,
  requireAll = false,
  isActive = false,
  className = '',
  icon,
}: ProtectedTabProps) {
  const user = useUser();

  let hasAccess = false;

  if (Array.isArray(permission)) {
    if (requireAll) {
      hasAccess = permission.every((p) => hasPermission(user, p));
    } else {
      hasAccess = permission.some((p) => hasPermission(user, p));
    }
  } else {
    hasAccess = hasPermission(user, permission);
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Link
      href={href}
      className={`
        flex items-center space-x-2 px-3 md:px-4 py-2.5 md:py-3
        text-xs sm:text-sm font-medium border-b-2 transition-all
        whitespace-nowrap min-w-fit
        ${
          isActive
            ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="hidden xs:inline sm:hidden md:inline">{label}</span>
      <span className="xs:hidden md:hidden">{shortLabel || label}</span>
    </Link>
  );
}

/**
 * ProtectedTabContainer - Wrapper for tab groups
 */
export function ProtectedTabContainer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        border-b border-gray-200 bg-white
        flex space-x-0.5 sm:space-x-1 overflow-x-auto scrollbar-hide px-2 sm:px-4
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default ProtectedTab;
