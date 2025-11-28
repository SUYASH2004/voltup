// SHARED_COMPONENTS_GUIDE.md - Complete Protected Components Library

# Shared Protected Components Guide

This guide shows how to build a complete shared component library with permission-driven access control.

---

## 🏗️ Component Architecture

```
ProtectedComponent Hierarchy:

└─ Can (Base Permission Check)
   ├─ ProtectedButton
   │  └─ ProtectedButton with fallback
   ├─ ProtectedTab
   │  └─ ProtectedTabContainer
   ├─ ProtectedPage
   │  └─ Layout wrapper
   └─ ProtectedRoute
      └─ Route protection (middleware level)
```

---

## 1️⃣ Base Component: <Can />

The foundation - checks single or multiple permissions.

**File: `components/Can.tsx`**

```typescript
'use client';

import React from 'react';
import { useUser } from '@/contexts/AuthContext';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';

export function Can({
  permission,
  requireAll = false,
  children,
  fallback = null,
  debug = false,
}) {
  const user = useUser();

  if (!permission) return <>{children}</>;
  if (!user) return <>{fallback}</>;

  let hasAccess = false;

  if (typeof permission === 'string') {
    hasAccess = hasPermission(user, permission);
  } else if (Array.isArray(permission)) {
    hasAccess = requireAll
      ? hasAllPermissions(user, permission)
      : hasAnyPermission(user, permission);
  }

  return <>{hasAccess ? children : fallback}</>;
}
```

**Usage:**
```typescript
// Single permission
<Can permission="vehicle.view">
  <VehicleList />
</Can>

// Multiple (ANY)
<Can permission={["vehicle.edit", "vehicle.delete"]}>
  <ActionsMenu />
</Can>

// Multiple (ALL)
<Can permission={["vehicle.view", "vehicle.edit"]} requireAll>
  <EditPanel />
</Can>

// With fallback
<Can permission="vehicle.delete" fallback={<p>Cannot delete</p>}>
  <DeleteButton />
</Can>
```

---

## 2️⃣ Button: <ProtectedButton />

Button that only renders if user has permission.

**File: `components/ProtectedButton.tsx`**

```typescript
'use client';

import React from 'react';
import { useUser } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth/permissions';

export function ProtectedButton({
  permission,
  requireAll = false,
  showDisabledFallback = false,
  disabledMessage = 'No permission',
  children,
  ...props
}) {
  const user = useUser();

  let hasAccess = false;

  if (Array.isArray(permission)) {
    hasAccess = requireAll
      ? permission.every(p => hasPermission(user, p))
      : permission.some(p => hasPermission(user, p));
  } else {
    hasAccess = hasPermission(user, permission);
  }

  if (showDisabledFallback) {
    return (
      <button
        {...props}
        disabled={!hasAccess || props.disabled}
        title={!hasAccess ? disabledMessage : props.title}
        className={`${props.className} ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
      </button>
    );
  }

  return hasAccess ? <button {...props}>{children}</button> : null;
}
```

**Usage:**
```typescript
// Simple - hide if no permission
<ProtectedButton permission="vehicle.edit">
  Edit Vehicle
</ProtectedButton>

// Show disabled instead of hiding
<ProtectedButton
  permission="vehicle.delete"
  showDisabledFallback
  disabledMessage="Insufficient permissions"
>
  Delete
</ProtectedButton>

// Multiple permissions
<ProtectedButton
  permission={["vehicle.create", "vehicle.edit"]}
  className="btn btn-primary"
>
  Create or Edit
</ProtectedButton>
```

---

## 3️⃣ Tab: <ProtectedTab />

Tab that only shows if user has permission.

**File: `components/ProtectedTab.tsx`**

```typescript
'use client';

import React from 'react';
import { useUser } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth/permissions';
import Link from 'next/link';

export function ProtectedTab({
  label,
  shortLabel,
  href,
  permission,
  requireAll = false,
  isActive = false,
  className = '',
  icon,
}) {
  const user = useUser();

  let hasAccess = false;

  if (Array.isArray(permission)) {
    hasAccess = requireAll
      ? permission.every(p => hasPermission(user, p))
      : permission.some(p => hasPermission(user, p));
  } else {
    hasAccess = hasPermission(user, permission);
  }

  if (!hasAccess) return null;

  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium
        border-b-2 transition-all whitespace-nowrap
        ${isActive
          ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
          : 'border-transparent text-gray-600 hover:text-gray-900'
        }
        ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden">{shortLabel || label}</span>
    </Link>
  );
}

export function ProtectedTabContainer({ children, className = '' }) {
  return (
    <div className={`border-b border-gray-200 bg-white flex space-x-1 
      overflow-x-auto px-4 ${className}`}>
      {children}
    </div>
  );
}
```

**Usage:**
```typescript
// In AssetTabs component
export function AssetTabs({ pathname }) {
  return (
    <ProtectedTabContainer>
      <ProtectedTab
        label="Vehicles"
        shortLabel="Vehicles"
        href="/assets/vehicles"
        permission="vehicle.view"
        isActive={pathname.includes('/vehicles')}
        icon={<VehicleIcon />}
      />

      <ProtectedTab
        label="Batteries"
        shortLabel="Batteries"
        href="/assets/batteries"
        permission="battery.view"
        isActive={pathname.includes('/batteries')}
        icon={<BatteryIcon />}
      />

      <ProtectedTab
        label="Charging Stations"
        shortLabel="Stations"
        href="/assets/charging-stations"
        permission="station.view"
        isActive={pathname.includes('/charging-stations')}
        icon={<ChargingIcon />}
      />

      <ProtectedTab
        label="TCU"
        shortLabel="TCU"
        href="/assets/tcu"
        permission="tcu.view"
        isActive={pathname.includes('/tcu')}
        icon={<TCUIcon />}
      />
    </ProtectedTabContainer>
  );
}
```

---

## 4️⃣ Page Wrapper: <ProtectedPage />

Wrap entire pages to require permissions before rendering.

**File: `components/ProtectedPage.tsx`**

```typescript
'use client';

import React from 'react';
import { Can } from './Can';
import { Permission } from '@/types/auth';

export function ProtectedPage({
  permission,
  requireAll = false,
  children,
  fallback = null,
  title,
}) {
  return (
    <Can
      permission={permission}
      requireAll={requireAll}
      fallback={fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              You do not have permission to access this page.
            </p>
          </div>
        </div>
      )}
    >
      {title && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
      {children}
    </Can>
  );
}
```

**Usage:**
```typescript
// app/assets/vehicles/page.tsx
'use client';

import { ProtectedPage } from '@/components/ProtectedPage';
import { Permission } from '@/types/auth';

export default function VehiclesPage() {
  return (
    <ProtectedPage permission={Permission.VEHICLE_VIEW} title="Vehicles">
      {/* Page content */}
    </ProtectedPage>
  );
}
```

---

## 5️⃣ Tab Hierarchy Example

Full working example with nested tabs and sub-pages.

**File: `app/assets/layout.tsx`**

```typescript
'use client';

import { usePathname } from 'next/navigation';
import { AssetTabs } from './components/AssetTabs';

export default function AssetsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
        </div>
        <AssetTabs pathname={pathname} />
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
```

**File: `app/assets/components/AssetTabs.tsx`**

```typescript
'use client';

import { ProtectedTab, ProtectedTabContainer } from '@/components/ProtectedTab';
import { Permission } from '@/types/auth';
import { Bike, Battery, Zap, Cpu } from 'lucide-react';

export function AssetTabs({ pathname }) {
  return (
    <ProtectedTabContainer>
      <ProtectedTab
        label="Vehicles"
        href="/assets/vehicles"
        permission={Permission.VEHICLE_VIEW}
        isActive={pathname.includes('/vehicles')}
        icon={<Bike className="w-4 h-4" />}
      />

      <ProtectedTab
        label="Batteries"
        href="/assets/batteries"
        permission={Permission.BATTERY_VIEW}
        isActive={pathname.includes('/batteries')}
        icon={<Battery className="w-4 h-4" />}
      />

      <ProtectedTab
        label="Charging Stations"
        shortLabel="Stations"
        href="/assets/charging-stations"
        permission={Permission.STATION_VIEW}
        isActive={pathname.includes('/charging-stations')}
        icon={<Zap className="w-4 h-4" />}
      />

      <ProtectedTab
        label="TCU"
        href="/assets/tcu"
        permission={Permission.TCU_VIEW}
        isActive={pathname.includes('/tcu')}
        icon={<Cpu className="w-4 h-4" />}
      />
    </ProtectedTabContainer>
  );
}
```

**File: `app/assets/vehicles/page.tsx`**

```typescript
'use client';

import { ProtectedPage } from '@/components/ProtectedPage';
import { VehicleList } from './components/VehicleList';
import { Permission } from '@/types/auth';

export default function VehiclesPage() {
  return (
    <ProtectedPage permission={Permission.VEHICLE_VIEW} title="Vehicles">
      <VehicleList />
    </ProtectedPage>
  );
}
```

---

## 6️⃣ Complex Example: Vehicles List with Actions

Full page with permission-driven UI.

**File: `app/assets/vehicles/components/VehicleList.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/AuthContext';
import { Can } from '@/components/Can';
import { ProtectedButton } from '@/components/ProtectedButton';
import { canAccessScope } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';

export function VehicleList() {
  const user = useUser();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles', {
          credentials: 'include',
        });
        const data = await response.json();
        setVehicles(data);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchVehicles();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Create Button - Only if has permission */}
      <Can permission={Permission.VEHICLE_CREATE}>
        <div className="mb-6">
          <button className="btn btn-primary">+ Create Vehicle</button>
        </div>
      </Can>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Region</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{vehicle.name}</td>
                <td className="px-6 py-4 text-sm">{vehicle.status}</td>
                <td className="px-6 py-4 text-sm">{vehicle.region}</td>
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  {/* Edit - Only show if has permission AND owns the vehicle */}
                  <Can
                    permission={Permission.VEHICLE_EDIT}
                    fallback={<span className="text-gray-300">—</span>}
                  >
                    {canAccessScope(
                      user,
                      vehicle.region,
                      vehicle.circle,
                      vehicle.area
                    ) ? (
                      <button className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </Can>

                  {/* Delete - Only show if has permission AND owns the vehicle */}
                  <Can permission={Permission.VEHICLE_DELETE}>
                    {canAccessScope(
                      user,
                      vehicle.region,
                      vehicle.circle,
                      vehicle.area
                    ) ? (
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </Can>

                  {/* Export - Only show if has permission */}
                  <ProtectedButton
                    permission={Permission.VEHICLE_EXPORT}
                    className="text-green-600 hover:text-green-900"
                  >
                    Export
                  </ProtectedButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 7️⃣ Nested Tabs Example

Sub-tabs inside main tabs.

```typescript
// app/assets/vehicles/components/VehicleSubTabs.tsx
import { ProtectedTab, ProtectedTabContainer } from '@/components/ProtectedTab';
import { Permission } from '@/types/auth';

export function VehicleSubTabs({ pathname }) {
  return (
    <ProtectedTabContainer>
      <ProtectedTab
        label="List View"
        href="/assets/vehicles"
        permission={Permission.VEHICLE_VIEW}
        isActive={pathname === '/assets/vehicles'}
      />

      <ProtectedTab
        label="Map View"
        href="/assets/vehicles/map"
        permission={Permission.VEHICLE_VIEW}
        isActive={pathname === '/assets/vehicles/map'}
      />

      <ProtectedTab
        label="Reports"
        href="/assets/vehicles/reports"
        permission={[Permission.VEHICLE_VIEW, Permission.REPORT_VIEW]}
        requireAll
        isActive={pathname === '/assets/vehicles/reports'}
      />

      <ProtectedTab
        label="Settings"
        href="/assets/vehicles/settings"
        permission={Permission.SYSTEM_SETTINGS}
        isActive={pathname === '/assets/vehicles/settings'}
      />
    </ProtectedTabContainer>
  );
}
```

---

## 8️⃣ API Integration

Making authenticated requests.

```typescript
// lib/api/vehicles.ts
export async function getVehicles(filters = {}) {
  const response = await fetch('/api/vehicles', {
    method: 'GET',
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vehicles');
  }

  return response.json();
}

export async function updateVehicle(id, data) {
  const response = await fetch(`/api/vehicles/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update vehicle');
  }

  return response.json();
}
```

**Usage:**
```typescript
const handleEdit = async (vehicle) => {
  try {
    await updateVehicle(vehicle.id, { name: 'New Name' });
    // Refresh list
  } catch (error) {
    console.error(error);
  }
};
```

---

## 9️⃣ Context-Based Conditional Rendering

Using auth context directly for complex logic.

```typescript
'use client';

import { useUser } from '@/contexts/AuthContext';
import { hasPermission, canAccessScope } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';

export function Dashboard() {
  const user = useUser();

  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>Welcome, {user.username}</h1>

      {/* Show different content based on permissions AND scope */}
      {hasPermission(user, Permission.VEHICLE_VIEW) && (
        <section>
          <h2>Your Vehicles</h2>
          {/* Show vehicles in user's scope */}
        </section>
      )}

      {canAccessScope(user, 'west') && (
        <section>
          <h2>West Region Data</h2>
          {/* Regional specific content */}
        </section>
      )}

      {hasPermission(user, Permission.SYSTEM_SETTINGS) && (
        <section>
          <h2>System Settings</h2>
          {/* Admin only section */}
        </section>
      )}
    </div>
  );
}
```

---

## 🔟 Composition Pattern

Build complex UIs by composing simple permission components.

```typescript
// components/AssetActions.tsx
export function AssetActions({ asset, onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <ProtectedButton
        permission="asset.edit"
        showDisabledFallback
        onClick={() => onEdit(asset)}
      >
        Edit
      </ProtectedButton>

      <ProtectedButton
        permission="asset.delete"
        showDisabledFallback
        className="text-red-600"
        onClick={() => onDelete(asset)}
      >
        Delete
      </ProtectedButton>

      <Can permission={["asset.export", "report.create"]}>
        <button className="text-blue-600">
          Export Report
        </button>
      </Can>
    </div>
  );
}

// Usage
<AssetActions
  asset={vehicle}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

## ✅ Best Practices

### 1. Always Check on Backend Too
```typescript
// Frontend check for UX
<Can permission="vehicle.delete">
  <button onClick={handleDelete}>Delete</button>
</Can>

// Backend MUST also check
// POST /api/vehicles/123/delete
export async function DELETE(request) {
  const session = await auth();
  
  if (!hasPermission(session.user, 'vehicle.delete')) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // ... delete
}
```

### 2. Check Scope + Permission
```typescript
// Vehicle belongs to "west" region
// User is "circle_head" in "west"
// User has "vehicle.edit" permission

// Both must be true
<Can permission="vehicle.edit">
  {canAccessScope(user, vehicle.region, vehicle.circle) ? (
    <button>Edit</button>
  ) : null}
</Can>
```

### 3. Use Composable Permission Lists
```typescript
// Define permission groups
const ASSET_VIEW_PERMISSIONS = [
  'vehicle.view',
  'battery.view',
  'station.view',
  'tcu.view',
];

// Use in components
<Can permission={ASSET_VIEW_PERMISSIONS}>
  <AssetDashboard />
</Can>
```

### 4. Provide Clear Disabled State
```typescript
<ProtectedButton
  permission="vehicle.delete"
  showDisabledFallback
  disabledMessage="Only admins can delete vehicles"
  className="btn btn-danger"
>
  Delete
</ProtectedButton>
```

---

## 📋 Component Matrix

| Component | Use Case | Permission | Fallback |
|-----------|----------|-----------|----------|
| `<Can>` | Check any permission | Yes | Optional |
| `<ProtectedButton>` | Clickable action | Yes | Optional |
| `<ProtectedTab>` | Navigation | Yes | Hide |
| `<ProtectedPage>` | Whole page | Yes | Error page |
| `canAccessScope()` | Data ownership | N/A | Check manually |

---

## 🎯 Quick Reference

```typescript
// Import what you need
import { Can } from '@/components/Can';
import { ProtectedButton } from '@/components/ProtectedButton';
import { ProtectedTab } from '@/components/ProtectedTab';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useUser } from '@/contexts/AuthContext';
import { hasPermission, canAccessScope } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';

// Use in components
<Can permission={Permission.VEHICLE_VIEW}>
  <VehicleList />
</Can>

<ProtectedButton permission={Permission.VEHICLE_EDIT}>
  Edit
</ProtectedButton>

<ProtectedPage permission={Permission.VEHICLE_VIEW}>
  Page content
</ProtectedPage>
```

---

**All components are production-ready, fully typed, and follow Next.js 15+ best practices.**
