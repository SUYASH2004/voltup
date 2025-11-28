'use client';

import React, { ReactNode } from 'react';
import { Can } from './Can';
import { Permission } from '@/types/auth';

interface ProtectedPageProps {
  permission?: Permission | Permission[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
}

/**
 * Page wrapper that requires permissions before rendering content
 * Useful for protecting entire pages from unauthorized access
 */
export function ProtectedPage({
  permission,
  requireAll = false,
  children,
  fallback = null,
  title,
}: ProtectedPageProps) {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-lg text-gray-600">
            You do not have permission to access this page.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            If you believe this is a mistake, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Can
      permission={permission}
      requireAll={requireAll}
      fallback={fallback || defaultFallback}
    >
      <div>
        {title && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </Can>
  );
}
