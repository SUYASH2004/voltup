// QUICK_REFERENCE_CARD.md

# 🎯 Protected Components - Quick Reference Card

Print this! Keep it handy while developing.

---

## 🔐 Authentication Hooks

```javascript
// Import
import { 
  useAuth, 
  useUser, 
  useIsAuthenticated, 
  useAuthLoading 
} from '@/contexts/AuthContext';

// useAuth() - Full auth state + actions
const { user, isAuthenticated, loading, login, logout, refreshToken } = useAuth();

// useUser() - Just user data
const user = useUser();

// useIsAuthenticated() - Boolean
const isAuth = useIsAuthenticated();

// useAuthLoading() - Loading state
const loading = useAuthLoading();
```

---

## 📦 Permission Components

### <Can /> - Base Component
```javascript
import { Can } from '@/components/Can';

// Single permission
<Can permission="vehicle.view">
  <VehicleList />
</Can>

// Multiple (ANY)
<Can permission={["vehicle.edit", "vehicle.delete"]}>
  <Actions />
</Can>

// Multiple (ALL)
<Can permission={["vehicle.view", "vehicle.edit"]} requireAll>
  <EditPanel />
</Can>

// With fallback
<Can permission="vehicle.delete" fallback={<p>Denied</p>}>
  <DeleteBtn />
</Can>
```

### <ProtectedButton /> - Button
```javascript
import { ProtectedButton } from '@/components/ProtectedButton';

// Hide if no permission
<ProtectedButton permission="vehicle.edit">
  Edit
</ProtectedButton>

// Show disabled instead
<ProtectedButton
  permission="vehicle.delete"
  showDisabledFallback
  disabledMessage="No permission"
>
  Delete
</ProtectedButton>

// Multiple permissions
<ProtectedButton permission={["vehicle.view", "report.view"]}>
  View Report
</ProtectedButton>
```

### <ProtectedTab /> - Tab Navigation
```javascript
import { ProtectedTab, ProtectedTabContainer } from '@/components/ProtectedTab';

<ProtectedTabContainer>
  <ProtectedTab
    label="Vehicles"
    href="/assets/vehicles"
    permission="vehicle.view"
    isActive={pathname.includes('/vehicles')}
    icon={<VehicleIcon />}
  />
  
  <ProtectedTab
    label="Batteries"
    href="/assets/batteries"
    permission="battery.view"
    isActive={pathname.includes('/batteries')}
    shortLabel="Batt"  // For mobile
  />
</ProtectedTabContainer>
```

### <ProtectedPage /> - Page Wrapper
```javascript
import { ProtectedPage } from '@/components/ProtectedPage';

<ProtectedPage 
  permission="vehicle.view" 
  title="Vehicles"
>
  <VehicleList />
</ProtectedPage>

// With custom fallback
<ProtectedPage
  permission="admin.access"
  fallback={<AdminDenied />}
>
  <AdminDashboard />
</ProtectedPage>
```

---

## 🔑 Permission Functions

```javascript
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  hasRole,
  canAccessScope,
  getUserScope,
  filterByUserScope 
} from '@/lib/auth/permissions';

// Check single permission
hasPermission(user, 'vehicle.view') // true/false

// Check ANY of multiple
hasAnyPermission(user, ['vehicle.edit', 'vehicle.delete']) // true if has any

// Check ALL of multiple
hasAllPermissions(user, ['vehicle.view', 'vehicle.edit']) // true if has all

// Check role
hasRole(user, 'admin') // true/false

// Check scope access (hierarchical)
canAccessScope(user, 'west', '1', null) // Can user access west region, circle 1?
canAccessScope(user, 'west', null, null) // Can user access west region?

// Get user's scope
const scope = getUserScope(user); // { region: 'west', circle: '1', area: null }

// Filter items by user scope
const vehicles = filterByUserScope(user, allVehicles);
```

---

## 🌐 API Requests

```javascript
// Always include credentials
const response = await fetch('/api/vehicles', {
  credentials: 'include',  // IMPORTANT!
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});

// POST example
await fetch('/api/vehicles', {
  credentials: 'include',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Vehicle 1' })
});

// DELETE example
await fetch(`/api/vehicles/${id}`, {
  credentials: 'include',
  method: 'DELETE'
});
```

---

## 📝 Common Patterns

### Pattern 1: Conditional CRUD
```javascript
<div>
  <Can permission="vehicle.view">
    <VehicleList />
  </Can>

  <ProtectedButton permission="vehicle.create">
    + Create
  </ProtectedButton>

  {vehicles.map(v => (
    <div key={v.id}>
      <span>{v.name}</span>
      
      <ProtectedButton permission="vehicle.edit">
        Edit
      </ProtectedButton>

      <ProtectedButton permission="vehicle.delete">
        Delete
      </ProtectedButton>
    </div>
  ))}
</div>
```

### Pattern 2: Scope-Based Filtering
```javascript
{vehicles.map(vehicle => (
  <div key={vehicle.id}>
    <h3>{vehicle.name}</h3>
    
    {canAccessScope(user, vehicle.region, vehicle.circle) ? (
      <ProtectedButton permission="vehicle.edit">
        Edit
      </ProtectedButton>
    ) : (
      <span className="text-gray-400">No access</span>
    )}
  </div>
))}
```

### Pattern 3: Admin-Only Section
```javascript
<Can permission="system.admin">
  <section className="border-2 border-yellow-400 p-4">
    <h2>Admin Only</h2>
    <AdminPanel />
  </section>
</Can>
```

### Pattern 4: Role-Based Sidebar
```javascript
{hasRole(user, 'admin') && (
  <Link href="/admin">Admin Panel</Link>
)}

{hasRole(user, 'regional_head') && (
  <Link href="/regional">Regional Dashboard</Link>
)}
```

### Pattern 5: Multiple Permission Requirements
```javascript
<Can
  permission={['vehicle.view', 'report.create']}
  requireAll
>
  <GenerateReportButton />
</Can>
```

---

## 🔍 Auth State Management

```javascript
'use client';

import { useAuth } from '@/contexts/AuthContext';

export function Component() {
  const { user, isAuthenticated, loading, login, logout } = useAuth();

  // Loading
  if (loading) return <div>Loading...</div>;

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <button onClick={() => login('user@example.com', 'password')}>
        Login
      </button>
    );
  }

  // Authenticated
  return (
    <div>
      <p>Welcome, {user.username}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## ⚙️ Configuration

### Protected Routes
**File**: `lib/auth/proxy.ts`

Add routes that require authentication:
```javascript
const PROTECTED_ROUTES = {
  '/dashboard': { permission: ['dashboard.view'] },
  '/assets': { permission: 'asset.view' },
  '/assets/vehicles': { permission: 'vehicle.view' },
  // Add your routes here
};
```

### Permissions
**File**: `types/auth.js`

Define permission strings:
```javascript
export const Permission = {
  VEHICLE_VIEW: 'vehicle.view',
  VEHICLE_CREATE: 'vehicle.create',
  VEHICLE_EDIT: 'vehicle.edit',
  VEHICLE_DELETE: 'vehicle.delete',
  // Add your permissions here
};
```

---

## 🎯 Layout Setup

```javascript
// app/layout.js
import { SessionProvider } from '@/providers/SessionProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## 🧪 Testing Checklist

- [ ] Login works
- [ ] Logout clears cookies
- [ ] Token refreshes automatically
- [ ] Cookies are HTTPOnly (check DevTools)
- [ ] Permission checks work
- [ ] Tabs hide if no permission
- [ ] Buttons hide/disable correctly
- [ ] Protected pages show access denied
- [ ] Scope filtering works
- [ ] Backend also verifies permissions

---

## 🚨 Remember

✅ **DO**:
- Use `credentials: 'include'` in fetch calls
- Always verify permissions on backend
- Check permissions in components
- Use HTTPOnly cookies
- Keep access tokens short-lived

❌ **DON'T**:
- Store tokens in localStorage
- Store tokens in sessionStorage
- Trust frontend permissions only
- Store sensitive data in cookies
- Hardcode permissions in components

---

## 📞 Key Files

| File | Purpose |
|------|---------|
| `lib/auth/cookies.ts` | Cookie handling |
| `lib/auth/jwt.ts` | JWT decode/verify |
| `lib/auth/permissions.ts` | Permission checking |
| `lib/auth/proxy.ts` | Route protection |
| `contexts/AuthContext.js` | Auth state + hooks |
| `components/Can.js` | Base permission component |
| `components/ProtectedButton.js` | Button component |
| `components/ProtectedTab.js` | Tab component |
| `components/ProtectedPage.js` | Page wrapper |
| `middleware.ts` | Route protection middleware |

---

## 🔗 Documentation

- **COOKIE_AUTH_COMPLETE.md** - Full system documentation
- **SHARED_COMPONENTS_GUIDE.md** - Component library guide
- **COMPONENT_INTEGRATION_EXAMPLES.md** - Real-world examples
- **COMPLETE_SETUP_CHECKLIST.md** - Implementation steps
- **IMPLEMENTATION_COMPLETE_SUMMARY.md** - Project summary

---

**Print this card and keep it handy!**

*Last updated: 2024*
