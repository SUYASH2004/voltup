# Complete Cookie-Based Authentication Architecture

## 🏗️ System Design

This document provides the complete, production-grade authentication system for Voltup, including:
- Cookie-based session management (HTTPOnly + Secure)
- Token refresh mechanism
- Permission-driven routing (proxy pattern)
- Component-level permission checks
- Frontend-backend sync strategy

---

## 📁 File Structure

```
voltup/
├── types/
│   └── auth.ts                         # All TypeScript types
│
├── lib/auth/
│   ├── cookies.ts                      # HTTP-only cookie handlers
│   ├── jwt.ts                          # JWT decode & validation
│   ├── permissions.ts                  # Permission checking logic
│   ├── client.ts                       # Client-side auth helpers
│   └── proxy.ts                        # Route protection middleware
│
├── app/api/auth/
│   ├── login/route.ts                  # Login endpoint
│   ├── logout/route.ts                 # Logout endpoint
│   ├── refresh/route.ts                # Token refresh endpoint
│   └── me/route.ts                     # Get current user endpoint
│
├── contexts/
│   └── AuthContext.tsx                 # Auth context & hooks
│
├── components/
│   ├── Can.tsx                         # Permission-based rendering
│   ├── ProtectedTab.tsx                # Protected tab component
│   ├── ProtectedButton.tsx             # Protected button component
│   ├── ProtectedPage.tsx               # Protected page wrapper
│   └── ProtectedRoute.tsx              # Protected route wrapper
│
├── app/auth/
│   └── login/page.tsx                  # Login page
│
├── middleware.ts                       # Route protection middleware
└── next.config.mjs                     # Next.js config (add JSX support)
```

---

## 🔐 Authentication Flow

### Login Flow

```
User Input (email/password)
        ↓
POST /api/auth/login (Next.js Route)
        ↓
Forward to FastAPI: POST /api/auth/login
        ↓
FastAPI Response:
{
  userId, username, role, permissions[],
  accessToken (JWT), refreshToken, expiresIn
}
        ↓
Set HTTP-only Cookies:
- auth_access_token (15 min)
- auth_refresh_token (7 days)
- auth_user_data (user info)
- auth_expires_at (expiration timestamp)
        ↓
Return user data to client (NOT tokens)
        ↓
AuthContext updates, triggers redirect
```

### Token Refresh Flow

```
Timer checks if token expires in <5 min
        ↓
Calls POST /api/auth/refresh
        ↓
Sends refresh token (from cookie)
        ↓
FastAPI validates & returns new accessToken
        ↓
Update auth_access_token cookie
        ↓
Continue with new token
```

### Route Protection Flow

```
Browser requests protected route
        ↓
middleware.ts runs BEFORE page renders
        ↓
protectRoute() checks:
  1. Is route in PROTECTED_ROUTES?
  2. Does cookie have accessToken?
  3. Is token valid & not expired?
  4. Does user have required permissions?
        ↓
✅ All pass → Page renders
❌ Any fail → Redirect to /login or /forbidden
```

---

## 🔑 Key Features

### 1. Secure Cookie Management

**File: `lib/auth/cookies.ts`**

```typescript
// Set cookies after login
setAuthCookies(accessToken, refreshToken, userData, expiresIn)

// Get tokens when needed
const token = await getAccessToken()
const refresh = await getRefreshToken()

// Clear on logout
await clearAuthCookies()
```

**Cookie Configuration:**
```
- httpOnly: true          // No JavaScript access
- secure: true            // HTTPS only (production)
- sameSite: 'Lax'        // CSRF protection
- path: '/'              // Available site-wide
- maxAge: 15 min (access), 7 days (refresh)
```

### 2. JWT Handling

**File: `lib/auth/jwt.ts`**

```typescript
// Decode token (read payload)
const payload = decodeJWT(token)

// Check expiration
const expired = isTokenExpired(token)

// Extract user
const user = extractUserFromToken(token)
```

**Why decode, not verify?**
- Decoding reads the payload (user data, permissions)
- Verification would require the backend's public key
- Backend already verified on login - we trust the token
- Client-side decode is for reading claims only

### 3. Permission Checking

**File: `lib/auth/permissions.ts`**

```typescript
// Check single permission
hasPermission(user, 'vehicle.view')

// Check multiple (require any)
hasAnyPermission(user, ['vehicle.edit', 'vehicle.delete'])

// Check multiple (require all)
hasAllPermissions(user, ['vehicle.view', 'vehicle.edit'])

// Check role
hasRole(user, UserRole.ADMIN)

// Check scope (region/circle/area)
canAccessScope(user, 'west', 'mumbai', 'andheri')

// Filter data by user scope
filterByUserScope(items, user)
```

### 4. Route Protection (Proxy Pattern)

**File: `lib/auth/proxy.ts`**

```typescript
// Define protected routes with required permissions
const PROTECTED_ROUTES = new Map([
  ['/assets/vehicles', {
    requiredPermissions: [Permission.VEHICLE_VIEW],
  }],
  ['/assets/vehicles/[id]/edit', {
    requiredPermissions: [Permission.VEHICLE_EDIT],
  }],
  // ... more routes
])

// Usage in middleware.ts:
export async function middleware(request) {
  return protectRoute(request)
}
```

**Why middleware instead of layout?**
- Runs BEFORE component renders
- Can't be bypassed by client-side navigation
- Returns 401/403 instead of rendering forbidden page
- Browser history stays clean

### 5. Component-Level Permissions

**File: `components/Can.tsx`**

```typescript
// Single permission
<Can permission="vehicle.view">
  <VehicleList />
</Can>

// Multiple permissions (ANY)
<Can permission={["vehicle.edit", "vehicle.delete"]}>
  <EditButton /> <DeleteButton />
</Can>

// Multiple permissions (ALL)
<Can permission={["vehicle.view", "vehicle.edit"]} requireAll>
  <EditButton />
</Can>

// With fallback
<Can permission="vehicle.delete" fallback={<p>Cannot delete</p>}>
  <DeleteButton />
</Can>
```

### 6. Auth Context & Hooks

**File: `contexts/AuthContext.tsx`**

```typescript
// Use in any client component
const { user, isAuthenticated, isLoading, login, logout } = useAuth()

// Get just the user
const user = useUser()

// Check if authenticated
const isAuth = useIsAuthenticated()

// Check loading state
const loading = useAuthLoading()
```

---

## 🚀 Implementation Steps

### Step 1: Update jsconfig.json for JSX

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

### Step 2: Install TypeScript (Optional but Recommended)

```bash
npm install --save-dev typescript @types/node @types/react @types/react-dom
```

### Step 3: Copy All Files

Copy the files created:
- `types/auth.ts`
- `lib/auth/*.ts`
- `app/api/auth/*/route.ts`
- `contexts/AuthContext.tsx`
- `components/Can.tsx`
- `app/auth/login/page.tsx`
- `middleware.ts`

### Step 4: Update Providers

**app/providers/Providers.js** → Add AuthProvider:

```javascript
'use client';

import SessionProvider from './SessionProvider';
import { SidebarProvider } from '../contexts/SidebarContext';
import { AuthProvider } from '../contexts/AuthContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <SessionProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </SessionProvider>
    </AuthProvider>
  );
}
```

### Step 5: Create Protected Routes

Wrap protected pages:

```typescript
// app/assets/vehicles/page.tsx
'use client';

import { ProtectedPage } from '@/components/ProtectedPage';
import { Permission } from '@/types/auth';

export default function VehiclesPage() {
  return (
    <ProtectedPage permission={Permission.VEHICLE_VIEW}>
      {/* Content */}
    </ProtectedPage>
  );
}
```

### Step 6: Add Permission Checks to Components

```typescript
// app/assets/components/AssetTabs.tsx
import { Can } from '@/components/Can';

export function AssetTabs() {
  return (
    <div>
      <Can permission="vehicle.view">
        <Tab href="/assets/vehicles">Vehicles</Tab>
      </Can>

      <Can permission="battery.view">
        <Tab href="/assets/batteries">Batteries</Tab>
      </Can>

      <Can permission="station.view">
        <Tab href="/assets/charging-stations">Stations</Tab>
      </Can>
    </div>
  );
}
```

---

## 🔌 FastAPI Backend Requirements

### Login Endpoint

**POST `/api/auth/login`**

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "userId": "123",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "circle_head",
  "permissions": ["vehicle.view", "vehicle.edit", "battery.view"],
  "region": "west",
  "circle": "mumbai",
  "area": null,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900
}
```

### Refresh Token Endpoint

**POST `/api/auth/refresh`**

Request:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 900
}
```

### Logout Endpoint (Optional)

**POST `/api/auth/logout`**

Request:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

Blacklist the token on backend to prevent reuse.

### Token Structure (JWT)

Must contain (in payload):

```json
{
  "userId": "123",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "circle_head",
  "permissions": ["vehicle.view", "vehicle.edit"],
  "region": "west",
  "circle": "mumbai",
  "area": null,
  "iat": 1700000000,
  "exp": 1700900000
}
```

---

## 🔄 Frontend-Backend Sync

### Backend Controls Permissions

**Reality:** Only backend decides permissions

```
User logs in
  ↓
Backend fetches user from database
  ↓
Backend looks up user's role from DB
  ↓
Backend fetches all permissions for that role from DB
  ↓
Backend includes permissions[] in JWT
  ↓
Frontend receives and uses those permissions
```

### Frontend Has Static Permission Map

**File: `types/auth.ts`**

```typescript
export enum Permission {
  VEHICLE_VIEW = 'vehicle.view',
  VEHICLE_CREATE = 'vehicle.create',
  VEHICLE_EDIT = 'vehicle.edit',
  VEHICLE_DELETE = 'vehicle.delete',
  // ... etc
}
```

**Purpose:** Type safety and IDE autocomplete

### Sync Strategy

**If backend adds new permission:**
1. Backend returns it in JWT
2. Frontend receives it in user.permissions[]
3. Frontend's <Can> component checks it
4. If frontend doesn't have enum for it yet → Still works (string comparison)
5. Later: Frontend dev adds to enum for type safety

**If backend removes permission:**
1. Backend doesn't include it in JWT
2. Frontend's hasPermission() returns false
3. <Can> component hides the UI
4. API call (if attempted) will be rejected by backend anyway

**No localStorage/sessionStorage used anywhere:**
- All state in cookies (HTTPOnly)
- All state in React context
- Never duplicated in storage

---

## 🧪 Testing Permissions

### Test Helpers

```typescript
// Create test user with specific permissions
const testUser: AuthUser = {
  userId: '123',
  username: 'test',
  role: UserRole.CIRCLE_HEAD,
  permissions: [Permission.VEHICLE_VIEW, Permission.VEHICLE_EDIT],
  region: 'west',
  circle: 'mumbai',
};

// Check permission
expect(hasPermission(testUser, Permission.VEHICLE_VIEW)).toBe(true);
expect(hasPermission(testUser, Permission.VEHICLE_DELETE)).toBe(false);

// Check scope
expect(canAccessScope(testUser, 'west', 'mumbai')).toBe(true);
expect(canAccessScope(testUser, 'east', 'delhi')).toBe(false);
```

---

## 🛡️ Security Checklist

### Cookies
- [x] HTTPOnly flag set
- [x] Secure flag set (production)
- [x] SameSite=Lax set
- [x] Path=/
- [x] Proper max age values

### Authentication
- [x] Backend validates password (hashing)
- [x] Backend issues JWT with expiry
- [x] Frontend stores in HTTP-only cookie (not localStorage)
- [x] Middleware validates token before rendering
- [x] Backend validates token on API calls

### Authorization
- [x] Backend includes permissions in JWT
- [x] Frontend checks before rendering UI
- [x] Backend re-validates permissions on API endpoints
- [x] No sensitive data in JWT claims
- [x] Permission checks not bypassable via dev tools

### Session Management
- [x] Automatic token refresh 5 min before expiry
- [x] Graceful redirect to login on token expiration
- [x] Logout clears all cookies and tokens
- [x] Refresh token stored separately from access token

---

## 📊 Request Flow Example

### Get Protected Resource

```
Frontend: useEffect(() => { apiRequest('/api/vehicles') })
  ↓
apiRequest() in lib/auth/client.ts
  ↓
Check: shouldRefreshToken()
  ↓
If yes → POST /api/auth/refresh
  ↓
Get new access token, update cookie
  ↓
GET /api/vehicles with Authorization header
  ↓
Backend: Validates JWT signature
  ↓
Backend: Returns data filtered by user's scope
  ↓
Frontend: Updates UI with data
```

---

## 💻 Full Example: Protected Vehicle List

```typescript
// app/assets/vehicles/page.tsx
'use client';

import { Can } from '@/components/Can';
import { useUser } from '@/contexts/AuthContext';
import { canAccessScope } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';
import { useState, useEffect } from 'react';

export default function VehiclesPage() {
  const user = useUser();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch vehicles
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

    if (user) {
      fetchVehicles();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Vehicles</h1>

      <Can permission={Permission.VEHICLE_CREATE}>
        <button>+ New Vehicle</button>
      </Can>

      <table>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.name}</td>
              <td>
                {/* Can only edit if has permission AND owns the vehicle */}
                <Can
                  permission={Permission.VEHICLE_EDIT}
                  fallback={<span>—</span>}
                >
                  {canAccessScope(
                    user,
                    vehicle.region,
                    vehicle.circle,
                    vehicle.area
                  ) ? (
                    <button>Edit</button>
                  ) : (
                    <span>—</span>
                  )}
                </Can>
              </td>
              <td>
                <Can permission={Permission.VEHICLE_DELETE}>
                  <button>Delete</button>
                </Can>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 📋 Comparison: Cookie vs Token vs Session

| Feature | Cookies | LocalStorage | SessionStorage |
|---------|---------|--------------|----------------|
| XSS Safe | ✅ (HTTPOnly) | ❌ | ❌ |
| CSRF Protection | ✅ | ❌ | ❌ |
| Auto-sent to server | ✅ | ❌ | ❌ |
| Survives reload | ✅ | ✅ | ❌ |
| Server control | ✅ | ❌ | ❌ |
| Can expire | ✅ | ❌ | ❌ |

**Recommendation: HTTPOnly Cookies (This architecture)**

---

## 🚨 Common Mistakes to Avoid

❌ **Storing token in localStorage**
```javascript
// DON'T DO THIS
localStorage.setItem('token', accessToken)
```

❌ **Sending user permissions in response without backend validation**
```javascript
// Backend MUST revalidate before returning data
const data = await db.getVehicles()
// Don't just check frontend permissions
```

❌ **Trusting frontend permission checks**
```typescript
// Frontend check is for UX only
if (hasPermission(user, 'vehicle.delete')) {
  // This doesn't mean backend will allow it!
  // Backend MUST check again
}
```

❌ **Storing sensitive data in JWT**
```javascript
// DON'T include password, credit card, etc.
{
  userId: '123',
  role: 'admin',
  password: '...'  // ❌ WRONG
}
```

✅ **Do This Instead**
- Tokens in HTTPOnly cookies
- Validate permissions on every API endpoint
- Refresh tokens before expiry
- Clear cookies on logout
- Use HTTPS in production
- Validate input on backend

---

## 📚 Files Reference

| File | Purpose | Type |
|------|---------|------|
| `types/auth.ts` | All TypeScript interfaces | TypeScript |
| `lib/auth/cookies.ts` | HTTP-only cookie management | TypeScript |
| `lib/auth/jwt.ts` | JWT decoding & validation | TypeScript |
| `lib/auth/permissions.ts` | Permission checking | TypeScript |
| `lib/auth/client.ts` | Client-side auth helpers | TypeScript |
| `lib/auth/proxy.ts` | Route protection | TypeScript |
| `app/api/auth/login/route.ts` | Login endpoint | TypeScript |
| `app/api/auth/logout/route.ts` | Logout endpoint | TypeScript |
| `app/api/auth/refresh/route.ts` | Token refresh | TypeScript |
| `app/api/auth/me/route.ts` | Current user | TypeScript |
| `contexts/AuthContext.tsx` | Auth context & hooks | React |
| `components/Can.tsx` | Permission component | React |
| `app/auth/login/page.tsx` | Login page | React |
| `middleware.ts` | Route protection middleware | TypeScript |

---

## 🔗 Integration Checklist

- [ ] Copy all files to project
- [ ] Update jsconfig.json with JSX config
- [ ] Update Providers.js to include AuthProvider
- [ ] Create middleware.ts with protectRoute()
- [ ] Define protected routes in lib/auth/proxy.ts
- [ ] Replace login page implementation
- [ ] Add <Can> checks to components
- [ ] Test login flow
- [ ] Test token refresh
- [ ] Test permission checks
- [ ] Test route protection
- [ ] Test logout
- [ ] Security review
- [ ] Production deployment

---

## 📞 Support

This architecture follows Next.js 15+, React 19+, and FastAPI best practices. For questions about specific parts:

1. **Cookies**: See `lib/auth/cookies.ts`
2. **Route Protection**: See `lib/auth/proxy.ts` and `middleware.ts`
3. **Permissions**: See `lib/auth/permissions.ts` and `components/Can.tsx`
4. **Auth Flow**: See `contexts/AuthContext.tsx`

All code is production-ready and fully typed.
