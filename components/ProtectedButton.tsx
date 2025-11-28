// components/ProtectedButton.tsx - Button with built-in permission check

'use client';

import React from 'react';
import { useUser } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';

interface ProtectedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Permission required to show button
   */
  permission: Permission | Permission[];

  /**
   * If true, require ALL permissions; if false, require ANY
   */
  requireAll?: boolean;

  /**
   * Show button but disabled instead of hiding
   */
  showDisabledFallback?: boolean;

  /**
   * Custom disabled message
   */
  disabledMessage?: string;
}

/**
 * ProtectedButton - Button that only renders if user has permission
 *
 * Examples:
 *
 * Single permission:
 * <ProtectedButton permission={Permission.VEHICLE_EDIT}>
 *   Edit Vehicle
 * </ProtectedButton>
 *
 * Show disabled if no permission:
 * <ProtectedButton
 *   permission={Permission.VEHICLE_DELETE}
 *   showDisabledFallback
 *   disabledMessage="You don't have permission"
 * >
 *   Delete
 * </ProtectedButton>
 *
 * Multiple permissions (require all):
 * <ProtectedButton
 *   permission={[Permission.VEHICLE_VIEW, Permission.VEHICLE_EDIT]}
 *   requireAll
 * >
 *   Edit
 * </ProtectedButton>
 */
export function ProtectedButton({
  permission,
  requireAll = false,
  showDisabledFallback = false,
  disabledMessage = 'You do not have permission',
  children,
  ...props
}: ProtectedButtonProps) {
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

  if (showDisabledFallback) {
    return (
      <button
        {...props}
        disabled={!hasAccess || props.disabled}
        title={!hasAccess ? disabledMessage : props.title}
        className={`
          ${props.className}
          ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {children}
      </button>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <button {...props}>{children}</button>;
}

export default ProtectedButton;
