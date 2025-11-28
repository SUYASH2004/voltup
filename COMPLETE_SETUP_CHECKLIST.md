// COMPLETE_SETUP_CHECKLIST.md

# Complete Protected Components Setup Checklist

Step-by-step guide to integrate the complete authentication and component library system.

---

## ✅ Phase 1: Core Authentication Files

All these files are required and must be created in this order.

### Step 1.1: TypeScript Types
**File: `types/auth.js`** (or `types/auth.d.ts` for type definitions)

- [ ] UserRole enum (ADMIN, REGIONAL_HEAD, CIRCLE_HEAD, AREA_HEAD)
- [ ] Permission enum (all resource.action pairs)
- [ ] JWTPayload interface
- [ ] AuthUser interface
- [ ] LoginRequest/Response
- [ ] RefreshTokenRequest/Response
- [ ] AuthState interface

**Status**: ✅ CREATED

---

### Step 1.2: Cookie Management
**File: `lib/auth/cookies.js`**

- [ ] setAuthCookies(accessToken, refreshToken, user)
- [ ] clearAuthCookies()
- [ ] getAccessToken()
- [ ] getRefreshToken()
- [ ] getUserDataFromCookies()
- [ ] getTokenExpiresAt()
- [ ] shouldRefreshToken()
- [ ] verifyAuthCookies()

**Cookie Config**:
- [ ] httpOnly: true
- [ ] secure: true (in production)
- [ ] sameSite: 'Lax'
- [ ] path: '/'
- [ ] maxAge: set appropriately

**Status**: ✅ CREATED

---

### Step 1.3: JWT Utilities
**File: `lib/auth/jwt.js`**

- [ ] decodeJWT(token)
- [ ] isTokenExpired(token)
- [ ] extractUserFromToken(token)
- [ ] getTokenExpiresIn(token)
- [ ] verifyJWTSignature(token, publicKey) - backend use

**Status**: ✅ CREATED

---

### Step 1.4: Permission Logic
**File: `lib/auth/permissions.js`**

- [ ] hasPermission(user, permission)
- [ ] hasAnyPermission(user, permissions)
- [ ] hasAllPermissions(user, permissions)
- [ ] hasRole(user, role)
- [ ] hasAnyRole(user, roles)
- [ ] canAccessScope(user, region, circle, area)
- [ ] getUserScope(user)
- [ ] filterByUserScope(user, items)
- [ ] isValidPermission(permission)

**Status**: ✅ CREATED

---

### Step 1.5: Client Auth Helpers
**File: `lib/auth/client.js`**

- [ ] refreshAccessToken()
- [ ] getCurrentUser()
- [ ] initializeAuth()
- [ ] apiRequest<T>(url, options)

**Status**: ✅ CREATED

---

### Step 1.6: Route Protection
**File: `lib/auth/proxy.js`**

- [ ] PROTECTED_ROUTES map
- [ ] protectRoute(pathname, cookies)
- [ ] Dynamic route matching
- [ ] Redirect logic (/login, /forbidden)

**File: `middleware.js`**

- [ ] Calls protectRoute on every request
- [ ] Configured for all routes except static assets

**Status**: ✅ CREATED

---

## ✅ Phase 2: API Routes

All API routes follow Next.js App Router conventions.

### Step 2.1: Login Endpoint
**File: `app/api/auth/login/route.js`**

- [ ] POST /api/auth/login
- [ ] Receives { email, password }
- [ ] Forwards to FastAPI /api/auth/login
- [ ] Sets HTTP-only cookies with tokens
- [ ] Returns user data (NOT tokens)

```javascript
export async function POST(request) {
  const body = await request.json();
  // Forward to backend...
  // Set cookies...
  // Return user data
}
```

**Status**: ✅ CREATED

---

### Step 2.2: Logout Endpoint
**File: `app/api/auth/logout/route.js`**

- [ ] POST /api/auth/logout
- [ ] Clears all auth cookies
- [ ] Notifies backend to revoke token

```javascript
export async function POST(request) {
  // Clear cookies
  // Notify backend
  // Return success
}
```

**Status**: ✅ CREATED

---

### Step 2.3: Refresh Endpoint
**File: `app/api/auth/refresh/route.js`**

- [ ] POST /api/auth/refresh
- [ ] Gets refresh token from cookie
- [ ] Calls FastAPI /api/auth/refresh
- [ ] Updates access token cookie
- [ ] Returns new expiration

```javascript
export async function POST(request) {
  // Get refresh token from cookies
  // Call backend refresh endpoint
  // Update access token cookie
  // Return new expiration
}
```

**Status**: ✅ CREATED

---

### Step 2.4: Current User Endpoint
**File: `app/api/auth/me/route.js`**

- [ ] GET /api/auth/me
- [ ] Reads access token from cookie
- [ ] Extracts and returns user data

```javascript
export async function GET(request) {
  // Get access token from cookies
  // Decode JWT
  // Return user data
}
```

**Status**: ✅ CREATED

---

## ✅ Phase 3: Context & Hooks

React Context for global auth state.

### Step 3.1: AuthContext
**File: `contexts/AuthContext.js`**

- [ ] AuthProvider component
- [ ] authReducer with INIT, LOGIN, LOGOUT, REFRESH actions
- [ ] Auto-initialization on mount
- [ ] Token refresh timer (5 min before expiry)
- [ ] login(email, password) function
- [ ] logout() function
- [ ] refreshToken() function

**Hooks**:
- [ ] useAuth() - full auth state and actions
- [ ] useUser() - just the user data
- [ ] useIsAuthenticated() - boolean
- [ ] useAuthLoading() - loading state

**Status**: ✅ CREATED

---

### Step 3.2: Session Provider
**File: `providers/SessionProvider.js`**

- [ ] Wraps AuthContext provider
- [ ] Can add additional providers here

```javascript
export function SessionProvider({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

**Status**: ✅ CREATED

---

### Step 3.3: Root Layout Integration
**File: `app/layout.js`**

- [ ] Import SessionProvider
- [ ] Wrap app with `<SessionProvider>`

```javascript
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

**Status**: ✅ CREATED

---

## ✅ Phase 4: Protected Components

Reusable components for permission-driven UI.

### Step 4.1: Can Component
**File: `components/Can.js`**

```javascript
<Can permission="vehicle.view">
  <VehicleList />
</Can>
```

- [ ] Single permission string
- [ ] Array of permissions (ANY)
- [ ] Array of permissions with requireAll (ALL)
- [ ] Optional fallback content

**Helper Components**:
- [ ] CanView
- [ ] CanCreate
- [ ] CanEdit
- [ ] CanDelete

**Status**: ✅ CREATED

---

### Step 4.2: ProtectedButton
**File: `components/ProtectedButton.js`**

```javascript
<ProtectedButton
  permission="vehicle.edit"
  showDisabledFallback
  disabledMessage="No permission"
>
  Edit
</ProtectedButton>
```

- [ ] Hide button if no permission
- [ ] OR show disabled button with message
- [ ] Support multiple permissions
- [ ] Support requireAll flag

**Status**: ✅ CREATED

---

### Step 4.3: ProtectedTab
**File: `components/ProtectedTab.js`**

```javascript
<ProtectedTabContainer>
  <ProtectedTab
    label="Vehicles"
    href="/assets/vehicles"
    permission="vehicle.view"
    isActive={true}
  />
</ProtectedTabContainer>
```

- [ ] Hide tab if no permission
- [ ] Support multiple permissions
- [ ] Active state styling
- [ ] Short label for mobile
- [ ] Icon support

**Status**: ✅ CREATED

---

### Step 4.4: ProtectedPage
**File: `components/ProtectedPage.js`**

```javascript
<ProtectedPage permission="vehicle.view" title="Vehicles">
  <VehicleList />
</ProtectedPage>
```

- [ ] Wrapper for entire pages
- [ ] Show access denied message if no permission
- [ ] Support custom fallback
- [ ] Optional title

**Status**: ✅ CREATED

---

## ✅ Phase 5: Pages

### Step 5.1: Login Page
**File: `app/auth/login/page.js`**

- [ ] Email input
- [ ] Password input
- [ ] Submit button
- [ ] Call AuthContext.login()
- [ ] Redirect to dashboard on success
- [ ] Show error messages

**Status**: ✅ CREATED

---

### Step 5.2: Dashboard Page
**File: `app/dashboard/page.js`**

- [ ] Protected with AuthContext
- [ ] Show different widgets based on permissions
- [ ] Show user info
- [ ] Show logout button

**Status**: To be created - See examples in COMPONENT_INTEGRATION_EXAMPLES.md

---

### Step 5.3: Assets Pages
**File: `app/assets/layout.js`** and `page.js`

- [ ] Tabs for different asset types
- [ ] Each tab has permission check
- [ ] Sub-layouts for each asset type

**Status**: To be created - See examples in COMPONENT_INTEGRATION_EXAMPLES.md

---

## ✅ Phase 6: Configuration

### Step 6.1: jsconfig.json
**File: `jsconfig.json`**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    },
    "jsx": "react-jsx",
    "target": "ES2020",
    "allowJs": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

- [ ] JSX support configured
- [ ] Path aliases working
- [ ] Target ES2020+

**Status**: ✅ CREATED

---

### Step 6.2: Environment Variables
**File: `.env.local`**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_COOKIE_DOMAIN=localhost
NODE_ENV=development
```

- [ ] Set NEXT_PUBLIC_API_URL to your FastAPI backend
- [ ] COOKIE_DOMAIN matches your domain
- [ ] All env vars prefixed correctly

**Status**: To be configured by user

---

## ✅ Phase 7: Testing

### Step 7.1: Manual Testing Checklist

- [ ] Login works with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] Cookie is set with httpOnly flag
- [ ] Access token is readable in browser (decode)
- [ ] Token refreshes automatically (5 min before expiry)
- [ ] Logout clears cookies
- [ ] Refresh token page properly

**Test as Different Roles**:
- [ ] Admin user sees all tabs/buttons
- [ ] Regional head sees only their region's data
- [ ] Circle head sees only their circle's data
- [ ] Area head sees only their area's data

**Test Permissions**:
- [ ] User without `vehicle.view` can't access vehicles
- [ ] User without `vehicle.edit` can't edit vehicles
- [ ] User without `vehicle.delete` can't delete vehicles
- [ ] Scoped users can't access other scopes

**Test Components**:
- [ ] `<Can>` shows/hides content correctly
- [ ] `<ProtectedButton>` hides or disables correctly
- [ ] `<ProtectedTab>` hides tabs without permission
- [ ] `<ProtectedPage>` shows access denied message
- [ ] Multiple permissions work (ANY/ALL)

---

### Step 7.2: Backend Testing

**FastAPI Requirements**:
- [ ] POST /api/auth/login - Returns access token + refresh token
- [ ] POST /api/auth/refresh - Returns new access token
- [ ] POST /api/auth/logout - Revokes token
- [ ] All API endpoints verify JWT signature
- [ ] All API endpoints check permissions
- [ ] All API endpoints verify scope access

**JWT Payload**:
```json
{
  "sub": "user-id",
  "username": "user@example.com",
  "role": "admin",
  "permissions": ["vehicle.view", "vehicle.edit", ...],
  "scope": { "region": "west", "circle": "1", "area": null },
  "exp": 1234567890,
  "iat": 1234567890
}
```

---

## ✅ Phase 8: Security

### Step 8.1: Cookie Security Checklist

- [ ] HTTPOnly flag enabled (prevents XSS access)
- [ ] Secure flag enabled in production (HTTPS only)
- [ ] SameSite=Lax set (prevents CSRF)
- [ ] Path=/ set
- [ ] Domain not set (browser automatically handles)
- [ ] Token rotation on refresh
- [ ] Token revocation on logout

---

### Step 8.2: OWASP Checklist

- [ ] No sensitive data in localStorage
- [ ] No sensitive data in sessionStorage
- [ ] CSRF tokens for state-changing requests
- [ ] JWT signature verified on backend
- [ ] Permissions verified on backend (not just frontend)
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts
- [ ] Password hashing (bcrypt/scrypt) on backend
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Content Security Policy headers set

---

## ✅ Phase 9: Documentation

- [ ] COOKIE_AUTH_COMPLETE.md - System architecture
- [ ] SHARED_COMPONENTS_GUIDE.md - Component library
- [ ] COMPONENT_INTEGRATION_EXAMPLES.md - Usage examples
- [ ] COMPLETE_SETUP_CHECKLIST.md - This file
- [ ] API documentation (backend endpoints)
- [ ] Permission matrix (what each role can do)

**Status**: ✅ ALL CREATED

---

## 📊 File Structure Summary

```
nextProject/
├── types/
│   └── auth.js                    ✅ TypeScript types + types.d.ts
├── lib/
│   └── auth/
│       ├── cookies.js              ✅ Cookie management
│       ├── jwt.js                  ✅ JWT utilities
│       ├── permissions.js           ✅ Permission logic
│       ├── client.js                ✅ Client helpers
│       └── proxy.js                 ✅ Route protection
├── components/
│   ├── Can.js                      ✅ Base permission component
│   ├── ProtectedButton.js          ✅ Button component
│   ├── ProtectedTab.js             ✅ Tab component
│   ├── ProtectedPage.js            ✅ Page wrapper
│   └── [other existing components]
├── contexts/
│   ├── AuthContext.js              ✅ Auth context + hooks
│   └── SidebarContext.js           (existing)
├── providers/
│   ├── SessionProvider.js          ✅ Session wrapper
│   └── Providers.js                ✅ Root provider
├── app/
│   ├── layout.js                   ✅ Updated with SessionProvider
│   ├── middleware.js               ✅ Route protection
│   ├── auth/
│   │   └── login/
│   │       └── page.js             ✅ Login page
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.js        ✅ Login API
│   │       ├── logout/
│   │       │   └── route.js        ✅ Logout API
│   │       ├── refresh/
│   │       │   └── route.js        ✅ Refresh API
│   │       ├── me/
│   │       │   └── route.js        ✅ Current user API
│   │       └── [...nextauth]/
│   │           └── route.js        (existing - can remove)
│   ├── assets/
│   │   ├── layout.js               🔄 To update with tabs
│   │   ├── page.js                 (existing)
│   │   └── [sections]
│   ├── dashboard/
│   │   └── page.js                 🔄 To create with examples
│   └── login/
│       └── page.js                 (existing)
├── jsconfig.json                   ✅ JSX/TSX configured
├── package.json                    (existing)
├── COOKIE_AUTH_COMPLETE.md         ✅ System documentation
├── SHARED_COMPONENTS_GUIDE.md      ✅ Component library guide
├── COMPONENT_INTEGRATION_EXAMPLES.md ✅ Usage examples
└── COMPLETE_SETUP_CHECKLIST.md    ✅ This file
```

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# http://localhost:3000

# 4. Navigate to login
# http://localhost:3000/auth/login

# 5. Use test credentials
# Email: test@example.com
# Password: password123
```

---

## 🔧 Common Issues & Solutions

### Issue: JSX is not compiled
**Solution**: Ensure `jsconfig.json` has `"jsx": "react-jsx"`

### Issue: Cookies not persisting
**Solution**: 
1. Check credentials: 'include' in fetch calls
2. Verify httpOnly flag is set by backend
3. Check cookie domain/path matches

### Issue: Token not refreshing
**Solution**:
1. Verify refresh endpoint is working
2. Check timer is set (5 min before expiry)
3. Monitor network tab for refresh requests

### Issue: Permission checks not working
**Solution**:
1. Verify permissions in JWT payload
2. Check `lib/auth/permissions.js` logic
3. Ensure `<AuthProvider>` wraps the app
4. Verify backend is issuing permissions correctly

### Issue: Routes not protected
**Solution**:
1. Check `middleware.js` is running
2. Verify `lib/auth/proxy.js` is correct
3. Check PROTECTED_ROUTES map includes your route
4. Look for redirects in network tab

---

## ✨ Next Steps

1. **Complete the setup** following this checklist
2. **Test authentication** with your FastAPI backend
3. **Create example pages** showing full integration
4. **Set up CI/CD** with environment variables
5. **Deploy to production** with secure cookie settings

---

**Status**: ✅ ALL CORE COMPONENTS CREATED - READY FOR INTEGRATION
