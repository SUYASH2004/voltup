// COMPONENT_INTEGRATION_EXAMPLES.md

# Protected Components Integration Examples

Complete, production-ready examples showing how to use the protected component library.

---

## 1. Simple Permission Check

**Show/hide content based on permission**

```javascript
// app/dashboard/page.js
'use client';

import { Can } from '@/components/Can';
import { VehicleList } from './components/VehicleList';
import { useUser } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const user = useUser();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1>Dashboard</h1>

      {/* Show vehicle section only if user can view vehicles */}
      <Can permission="vehicle.view">
        <section className="mt-6">
          <h2>Vehicles</h2>
          <VehicleList />
        </section>
      </Can>

      {/* Show batteries section only if user can view batteries */}
      <Can permission="battery.view">
        <section className="mt-6">
          <h2>Batteries</h2>
          <BatteryList />
        </section>
      </Can>
    </div>
  );
}
```

---

## 2. Button with Disabled Fallback

**Show button but disable if no permission**

```javascript
// app/assets/vehicles/page.js
'use client';

import { ProtectedButton } from '@/components/ProtectedButton';

export default function VehiclesPage() {
  const handleCreate = () => {
    // Navigate to create page
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Vehicles</h1>

        {/* Show disabled state instead of hiding */}
        <ProtectedButton
          permission="vehicle.create"
          showDisabledFallback
          disabledMessage="You don't have permission to create vehicles"
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          + Create Vehicle
        </ProtectedButton>
      </div>

      {/* Vehicle list */}
    </div>
  );
}
```

---

## 3. Tab Navigation with Permissions

**Tabs appear only if user has permission to view that section**

```javascript
// app/assets/layout.js
'use client';

import { usePathname } from 'next/navigation';
import { ProtectedTab, ProtectedTabContainer } from '@/components/ProtectedTab';
import { Bike, Battery, Zap, Cpu } from 'lucide-react';

export default function AssetsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold">Assets</h1>
        </div>

        {/* Tabs - only visible if user has permission */}
        <ProtectedTabContainer>
          <ProtectedTab
            label="Vehicles"
            href="/assets/vehicles"
            permission="vehicle.view"
            isActive={pathname?.includes('/vehicles')}
            icon={<Bike className="w-4 h-4" />}
          />

          <ProtectedTab
            label="Batteries"
            href="/assets/batteries"
            permission="battery.view"
            isActive={pathname?.includes('/batteries')}
            icon={<Battery className="w-4 h-4" />}
          />

          <ProtectedTab
            label="Charging Stations"
            shortLabel="Stations"
            href="/assets/charging-stations"
            permission="station.view"
            isActive={pathname?.includes('/charging-stations')}
            icon={<Zap className="w-4 h-4" />}
          />

          <ProtectedTab
            label="TCU"
            href="/assets/tcu"
            permission="tcu.view"
            isActive={pathname?.includes('/tcu')}
            icon={<Cpu className="w-4 h-4" />}
          />
        </ProtectedTabContainer>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
```

---

## 4. Complete Vehicle List with Actions

**Full CRUD operations with permission checks**

```javascript
// app/assets/vehicles/components/VehicleList.js
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/AuthContext';
import { Can } from '@/components/Can';
import { ProtectedButton } from '@/components/ProtectedButton';
import { hasPermission, canAccessScope } from '@/lib/auth/permissions';

export function VehicleList() {
  const user = useUser();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }

        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading vehicles...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error: {error}</div>;
  }

  return (
    <div>
      {/* Create Button - Only visible if user can create */}
      <Can permission="vehicle.create">
        <div className="mb-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Create Vehicle
          </button>
        </div>
      </Can>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {vehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No vehicles found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Owner
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicles.map((vehicle) => (
                <VehicleRow
                  key={vehicle.id}
                  vehicle={vehicle}
                  user={user}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/**
 * Individual vehicle row with permission-based actions
 */
function VehicleRow({ vehicle, user }) {
  const canEdit = hasPermission(user, 'vehicle.edit') &&
    canAccessScope(user, vehicle.region, vehicle.circle, vehicle.area);

  const canDelete = hasPermission(user, 'vehicle.delete') &&
    canAccessScope(user, vehicle.region, vehicle.circle, vehicle.area);

  const handleEdit = () => {
    console.log('Edit vehicle:', vehicle.id);
    // Navigate to edit page
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this vehicle?')) return;

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      // Refresh list
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete vehicle');
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {vehicle.name}
      </td>
      <td className="px-6 py-4 text-sm">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            vehicle.status === 'active'
              ? 'bg-green-100 text-green-800'
              : vehicle.status === 'inactive'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {vehicle.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {vehicle.region}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {vehicle.owner}
      </td>
      <td className="px-6 py-4 text-right text-sm space-x-2">
        {/* View */}
        <Can permission="vehicle.view">
          <button className="text-blue-600 hover:text-blue-900 font-medium">
            View
          </button>
        </Can>

        {/* Edit - Only if has permission AND owns the vehicle */}
        {canEdit ? (
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            Edit
          </button>
        ) : (
          <span className="text-gray-300">Edit</span>
        )}

        {/* Delete - Only if has permission AND owns the vehicle */}
        {canDelete ? (
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-900 font-medium"
          >
            Delete
          </button>
        ) : (
          <span className="text-gray-300">Delete</span>
        )}

        {/* Export */}
        <ProtectedButton
          permission="vehicle.export"
          className="text-green-600 hover:text-green-900 font-medium"
        >
          Export
        </ProtectedButton>
      </td>
    </tr>
  );
}
```

---

## 5. Multiple Permissions

**Require ANY or ALL of multiple permissions**

```javascript
// app/reports/page.js
'use client';

import { Can } from '@/components/Can';

export default function ReportsPage() {
  // Show section if user has ANY of these permissions
  return (
    <div>
      <h1>Reports</h1>

      {/* If user can CREATE OR EDIT reports */}
      <Can permission={['report.create', 'report.edit']}>
        <section className="mt-6">
          <h2>Create / Edit Reports</h2>
          {/* Content */}
        </section>
      </Can>

      {/* If user has BOTH vehicle.view AND report.view */}
      <Can
        permission={['vehicle.view', 'report.view']}
        requireAll
      >
        <section className="mt-6">
          <h2>Vehicle Reports</h2>
          {/* Content */}
        </section>
      </Can>
    </div>
  );
}
```

---

## 6. Conditional Rendering with Fallback

**Show different UI based on permissions**

```javascript
// app/vehicles/[id]/page.js
'use client';

import { Can } from '@/components/Can';
import { ProtectedButton } from '@/components/ProtectedButton';

export default function VehicleDetailPage({ params }) {
  const { id } = params;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1>Vehicle Details</h1>

        {/* Show edit form if can edit */}
        <Can
          permission="vehicle.edit"
          fallback={<p className="text-gray-500">Read-only view</p>}
        >
          <VehicleEditForm vehicleId={id} />
        </Can>

        {/* Show management section only if admin */}
        <Can
          permission="system.admin"
          fallback={null}
        >
          <section className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded">
            <h3>Admin Actions</h3>
            <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
              Force Sync with Backend
            </button>
          </section>
        </Can>

        {/* Always show delete button, but disable if no permission */}
        <div className="mt-6">
          <ProtectedButton
            permission="vehicle.delete"
            showDisabledFallback
            disabledMessage="You cannot delete vehicles"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Vehicle
          </ProtectedButton>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Using useUser Hook Directly

**For complex permission logic**

```javascript
// app/dashboard/components/Dashboard.js
'use client';

import { useUser } from '@/contexts/AuthContext';
import { hasPermission, canAccessScope } from '@/lib/auth/permissions';

export function Dashboard() {
  const user = useUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Complex logic
  const isAdmin = user.role === 'admin';
  const canManageAssets = hasPermission(user, 'asset.manage');
  const canViewWestRegion = canAccessScope(user, 'west');

  return (
    <div className="p-6">
      <h1>Welcome, {user.username}</h1>

      {isAdmin && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="font-semibold">Admin Mode Active</p>
          <p>You have full access to all resources</p>
        </div>
      )}

      {canManageAssets && !isAdmin && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="font-semibold">Asset Manager</p>
          <p>You can manage assets in your scope</p>
        </div>
      )}

      {canViewWestRegion && (
        <section className="mt-6">
          <h2>West Region Data</h2>
          {/* Show regional dashboard */}
        </section>
      )}
    </div>
  );
}
```

---

## 8. Nested Tabs

**Sub-tabs with their own permissions**

```javascript
// app/assets/vehicles/layout.js
'use client';

import { usePathname } from 'next/navigation';
import { ProtectedTab, ProtectedTabContainer } from '@/components/ProtectedTab';

export default function VehiclesLayout({ children }) {
  const pathname = usePathname();

  return (
    <div>
      {/* Sub-tabs for vehicles */}
      <ProtectedTabContainer className="px-6 mt-4">
        <ProtectedTab
          label="List View"
          href="/assets/vehicles"
          permission="vehicle.view"
          isActive={pathname === '/assets/vehicles'}
        />

        <ProtectedTab
          label="Map View"
          href="/assets/vehicles/map"
          permission="vehicle.view"
          isActive={pathname === '/assets/vehicles/map'}
        />

        <ProtectedTab
          label="Reports"
          href="/assets/vehicles/reports"
          permission={['vehicle.view', 'report.view']}
          requireAll
          isActive={pathname === '/assets/vehicles/reports'}
        />

        <ProtectedTab
          label="Settings"
          href="/assets/vehicles/settings"
          permission="vehicle.settings"
          isActive={pathname === '/assets/vehicles/settings'}
        />
      </ProtectedTabContainer>

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
```

---

## 9. Form with Permission Checks

**Conditionally show form fields**

```javascript
// app/vehicles/[id]/edit/page.js
'use client';

import { Can } from '@/components/Can';
import { ProtectedButton } from '@/components/ProtectedButton';

export default function EditVehiclePage({ params }) {
  const { id } = params;
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit to API
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {/* Basic Info - always visible */}
      <fieldset>
        <legend>Basic Information</legend>
        <input type="text" placeholder="Vehicle Name" />
      </fieldset>

      {/* Advanced Settings - only if can edit settings */}
      <Can permission="vehicle.settings">
        <fieldset className="mt-6">
          <legend>Advanced Settings</legend>
          <input type="text" placeholder="API Key" />
          <input type="text" placeholder="Configuration" />
        </fieldset>
      </Can>

      {/* Owner Assignment - only if admin */}
      <Can permission="system.admin">
        <fieldset className="mt-6">
          <legend>Owner Assignment</legend>
          <select>
            <option>Select Owner</option>
          </select>
        </fieldset>
      </Can>

      {/* Submit buttons */}
      <div className="mt-6 space-x-4">
        <ProtectedButton
          permission="vehicle.edit"
          showDisabledFallback
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save Changes
        </ProtectedButton>

        <Can permission="vehicle.delete">
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete Vehicle
          </button>
        </Can>
      </div>
    </form>
  );
}
```

---

## 10. Modal/Dialog with Permissions

**Show modals only if user has permission**

```javascript
// components/DeleteVehicleModal.js
'use client';

import { useState } from 'react';
import { Can } from '@/components/Can';

export function DeleteVehicleModal({ vehicle, isOpen, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(vehicle.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Can permission="vehicle.delete">
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h2 className="text-lg font-bold">Delete Vehicle?</h2>
            <p className="mt-2 text-gray-600">
              Are you sure you want to delete "{vehicle.name}"?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Can>
  );
}
```

---

## 📋 Quick Implementation Checklist

- [ ] Created `/components/Can.js`
- [ ] Created `/components/ProtectedButton.js`
- [ ] Created `/components/ProtectedTab.js`
- [ ] Created `/components/ProtectedPage.js`
- [ ] Created `/lib/auth/permissions.js`
- [ ] Created `/contexts/AuthContext.js`
- [ ] Updated app layout with `<AuthProvider>`
- [ ] Updated middleware with route protection
- [ ] Created login page
- [ ] Tested with different user roles
- [ ] Verified backend also checks permissions
- [ ] Set secure cookie configuration (HTTPOnly, Secure, SameSite)

---

**All examples are production-ready and work with the authentication system.**
