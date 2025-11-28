# Role-Based Tabs Implementation Guide

## Overview
This guide shows how to implement role-based visibility for tabs and components in your application. Using the Assets tabs as an example, we'll demonstrate how to:

1. Define which roles can access which tabs
2. Load permissions from backend at login time
3. Hide/show tabs based on role and permissions
4. Maintain server-side security enforcement

---

## Step 1: Define Backend Response Structure

When user logs in, backend returns permissions and role:

```typescript
// Response from POST /api/auth/login (from FastAPI backend)
{
  "userId": "user123",
  "username": "john_doe",
  "role": "tenant_manager",          // ← User's role
  "permissions": [                    // ← Permissions from backend
    "tenant.view",
    "tenant.edit",
    "vehicle.view",
    "battery.view",
    "workorder.view"
  ],
  "accessToken": "eyJhbGc...",
  "refreshToken": "refresh_token",
  "expiresIn": 900
}
```

---

## Step 2: Define Tab Configuration

Create a configuration that maps tabs to permissions:

```typescript
// app/assets/config/tabs.ts

import { Permission } from '@/types/auth';
import { Bike, Battery, Zap, Cpu } from 'lucide-react';

export interface TabConfig {
  href: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  permission?: Permission;  // ← Optional: required permission
  roles?: string[];          // ← Optional: required roles
}

export const ASSET_TABS: TabConfig[] = [
  {
    href: '/assets/vehicles',
    label: 'Vehicles',
    shortLabel: 'Vehicles',
    icon: <Bike className="w-4 h-4 sm:w-5 sm:h-5" />,
    permission: Permission.VEHICLE_VIEW,  // ← Required permission
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
  // New tab: Only for tenant_manager role
  {
    href: '/assets/tenant-config',
    label: 'Tenant Configuration',
    shortLabel: 'Config',
    icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" />,
    roles: ['tenant_manager'],  // ← Only this role can see it
  },
];
```

---

## Step 3: Update AssetTabs Component

The component now filters tabs based on permissions:

```typescript
// app/assets/components/AssetTabs.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';  // ← Use the hook
import { ASSET_TABS } from '../config/tabs';

export default function AssetTabs() {
  const pathname = usePathname();
  const { user, can, hasRole, isLoading } = useAuth();  // ← Get auth info

  // Show nothing while loading to prevent hydration mismatch
  if (isLoading) {
    return (
      <div className="border-b border-gray-200 bg-white h-12" />
    );
  }

  // Filter tabs based on permissions
  const visibleTabs = ASSET_TABS.filter((tab) => {
    // Check permission if defined
    if (tab.permission && !can(tab.permission)) {
      return false;
    }
    
    // Check role if defined
    if (tab.roles && !hasRole(tab.roles[0])) {
      return false;
    }
    
    return true;
  });

  // If no tabs visible, show message
  if (visibleTabs.length === 0) {
    return (
      <div className="border-b border-gray-200 bg-white p-4 text-gray-500">
        No asset tabs available for your role
      </div>
    );
  }

  const isActive = (href: string) => {
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
```

---

## Step 4: Route Protection (Server-Side)

Update proxy.ts to protect the new tenant-config route:

```typescript
// lib/auth/proxy.ts - Add to PROTECTED_ROUTES

const PROTECTED_ROUTES = new Map<string, ProtectedRoute>([
  // ... existing routes ...
  
  // Tenant Configuration - Only for tenant_manager role
  [
    '/assets/tenant-config',
    {
      path: '/assets/tenant-config',
      requiredPermissions: [Permission.TENANT_VIEW],
      roles: ['tenant_manager'],  // ← Restrict by role too
    },
  ],
]);
```

---

## Step 5: Create Dummy Login Data

Until your backend is ready, use dummy data:

```typescript
// app/api/auth/login/route.ts - Dummy data for development

// DUMMY: Remove when backend is ready
const DUMMY_USERS: Record<string, any> = {
  'manager@test.com': {
    userId: '1',
    username: 'john_manager',
    email: 'manager@test.com',
    role: 'tenant_manager',
    permissions: ['tenant.view', 'tenant.edit', 'vehicle.view', 'battery.view', 'workorder.view'],
    region: 'North',
  },
  'admin@test.com': {
    userId: '2',
    username: 'admin_user',
    email: 'admin@test.com',
    role: 'admin',
    permissions: [
      'tenant.view', 'tenant.edit', 'tenant.create',
      'vehicle.view', 'vehicle.create', 'vehicle.edit', 'vehicle.delete',
      'battery.view', 'battery.create', 'battery.edit', 'battery.delete',
      'station.view', 'station.create', 'station.edit', 'station.delete',
      'tcu.view', 'tcu.create', 'tcu.edit', 'tcu.delete',
      'workorder.view', 'workorder.create', 'workorder.edit', 'workorder.complete',
      'report.view', 'report.create', 'report.export',
      'system.settings', 'system.audit',
    ],
  },
  'regional@test.com': {
    userId: '3',
    username: 'regional_head',
    email: 'regional@test.com',
    role: 'regional_head',
    permissions: [
      'vehicle.view', 'vehicle.edit',
      'battery.view',
      'station.view', 'station.edit',
      'workorder.view', 'workorder.create', 'workorder.edit',
      'report.view', 'report.export',
    ],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // DUMMY: Check email/password
    const dummyUser = DUMMY_USERS[email];
    
    if (!dummyUser || password !== 'password123') {  // Dummy password
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // DUMMY: Generate tokens
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 900; // 15 minutes
    
    const accessToken = jwt.sign(
      {
        userId: dummyUser.userId,
        username: dummyUser.username,
        role: dummyUser.role,
        permissions: dummyUser.permissions,
        iat: now,
        exp: now + expiresIn,
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    const refreshToken = jwt.sign(
      { userId: dummyUser.userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Rest of login logic...
  } catch (error) {
    // ...
  }
}
```

---

## How to Test

### Test Case 1: Tenant Manager
```
Email: manager@test.com
Password: password123

Result:
- Sees: Vehicles, Batteries, Charging Stations, TCU, Tenant Configuration
- Cannot access: System settings, user management
```

### Test Case 2: Admin
```
Email: admin@test.com
Password: password123

Result:
- Sees: All tabs + Admin features
- Can access: Everything
```

### Test Case 3: Regional Head
```
Email: regional@test.com
Password: password123

Result:
- Sees: Vehicles, Batteries, Stations, Work Orders, Reports
- Cannot see: Tenant Configuration
```

---

## Security Layers

| Layer | Check | Enforcement |
|-------|-------|------------|
| **Proxy (Server)** | Route access check | Returns 403 if unauthorized |
| **Component (Client)** | Permission check | Hides tab from UI |
| **Backend** | Data access check | Returns 403/401 if unauthorized |

**Key**: Even if user manipulates client code to show hidden tabs, proxy enforces access server-side.

---

## Best Practices

1. **Always define permissions**: Every protected resource needs a permission
2. **Server-side is truth**: Never trust client-side checks for security
3. **Use the hook**: `useAuth()` for permission checks in components
4. **Handle loading state**: Prevent hydration mismatch with loading state
5. **Test both roles**: Test with multiple roles to ensure correct filtering
6. **Log permission denials**: Log when users try to access unauthorized resources

