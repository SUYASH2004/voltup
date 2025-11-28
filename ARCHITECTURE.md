# Voltup Enterprise Dashboard - Architecture Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Layers](#architecture-layers)
4. [Authentication & Authorization](#authentication--authorization)
5. [State Management](#state-management)
6. [API Layer](#api-layer)
7. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
8. [Component Patterns](#component-patterns)
9. [Folder Structure](#folder-structure)
10. [Best Practices](#best-practices)

---

## Project Overview

**Voltup** is an enterprise asset management dashboard for managing vehicles, batteries, charging stations, and TCUs (Telematics Control Units). It supports hierarchical role-based access control across regions, circles, and areas.

**Key Features:**
- Multi-tier role-based access (Regional Head → Circle Head → Area Head)
- Session management with 24-hour JWT expiry
- Real-time asset tracking and management
- Responsive mobile-first design with Tailwind CSS

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16+ (App Router)
- **UI Library:** React 19
- **Styling:** TailwindCSS 4 + PostCSS
- **Icons:** Lucide React
- **Authentication:** next-auth v5 (with NextAuth.js)

### State Management
- **Global State:** React Context API + useReducer (for complex state)
- **Form State:** Native React hooks (useState, useCallback)
- **Server State:** React Query / TanStack Query (recommended for data fetching)
- **Optional: Redux Toolkit** (if state complexity exceeds Context API limits)

### API & Data
- **Backend Communication:** Fetch API / Axios
- **Data Caching:** React Query / SWR
- **Error Handling:** Centralized error boundaries

### Development Tools
- **Linting:** ESLint 9
- **Version Control:** Git
- **Package Manager:** npm

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (React Components, Pages, UI)                              │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                     │
│  (Custom Hooks, Context, RBAC, Utilities)                   │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  (API Services, Axios/Fetch, Request/Response Handling)    │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Next.js API Routes)              │
│  (Authentication, Authorization, Database)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization

### Current Setup ✅
- **NextAuth.js v5** with JWT strategy
- **Credentials provider** (email/password)
- **Session callbacks** enrich token with user role, region, circle, area
- **Middleware** protects routes and validates sessions

### Recommended Improvements

#### 1. Secure Session Management
```javascript
// app/api/auth/[...nextauth]/route.js

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [CredentialsProvider({...})],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.region = user.region;
        token.circle = user.circle;
        token.area = user.area;
        token.permissions = user.permissions; // ← NEW: Fine-grained permissions
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.region = token.region;
        session.user.circle = token.circle;
        session.user.area = token.area;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
});
```

#### 2. Cookie Management (Secure by Default)
NextAuth automatically manages secure cookies. For manual cookie management:

```javascript
// utils/cookies.js
export const setCookie = (name, value, options = {}) => {
  const defaultOptions = {
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  };
  // Implementation via document.cookie or use cookies library
};

export const getCookie = (name) => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];
};
```

**Better Alternative: Use `js-cookie` library**
```bash
npm install js-cookie
npm install --save-dev @types/js-cookie
```

#### 3. Middleware for Protected Routes
```javascript
// middleware.js
import { auth } from './app/api/auth/[...nextauth]/route';

export async function middleware(request) {
  const session = await auth();
  const publicRoutes = ['/login', '/forgot-password', '/register'];
  
  if (!session && !publicRoutes.includes(request.nextUrl.pathname)) {
    return Response.redirect(new URL('/login', request.url));
  }
  
  // Check session expiration (24 hours)
  if (session && session.expires) {
    const expiresAt = new Date(session.expires).getTime();
    if (Date.now() > expiresAt) {
      // Session expired
      return Response.redirect(new URL('/login', request.url));
    }
  }
}

export const config = {
  matcher: ['/((?!_next|public|favicon).*)'],
};
```

---

## State Management

### Option 1: React Context API (Recommended for Current Scale) ✅

**Best for:** Small to medium teams, projects < 5 developers, moderate state complexity

**Advantages:**
- No additional dependencies
- Built into React
- Easy to learn and implement
- Perfect for global UI state (sidebar, theme, modals)

**Disadvantages:**
- Can lead to prop drilling without good structure
- Every context change re-renders all consumers
- Harder to debug complex state flows

**Implementation Pattern:**
```javascript
// contexts/AppContext.js
import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  notifications: [],
  sidebarCollapsed: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
```

### Option 2: Redux Toolkit (For Large-Scale Apps)

**Best for:** Large teams (5+ developers), complex state logic, time-travel debugging needed

**Advantages:**
- Scalable for enterprise apps
- Great DevTools for debugging
- Middleware support (redux-thunk, redux-saga)
- Predictable state management
- Large ecosystem

**Disadvantages:**
- Boilerplate code overhead
- Steeper learning curve
- Overkill for simple apps

**Setup (if needed later):**
```bash
npm install @reduxjs/toolkit react-redux
npm install redux-devtools-extension
```

### Option 3: Zustand (Modern Alternative)

**Best for:** Teams that want Redux simplicity without boilerplate

**Advantages:**
- Minimal boilerplate
- Built-in DevTools support
- TypeScript friendly
- Smaller bundle size

**Disadvantages:**
- Smaller ecosystem than Redux
- Less mature tooling

---

## API Layer

### Architecture

```
app/
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   ├── vehicles/
│   │   ├── route.js (GET, POST)
│   │   └── [id]/route.js (GET, PUT, DELETE)
│   ├── batteries/
│   ├── charging-stations/
│   └── tcu/
├── lib/
│   └── api/
│       ├── client.js (Axios instance)
│       ├── auth.js
│       ├── vehicles.js
│       ├── batteries.js
│       └── errorHandler.js
└── hooks/
    ├── useVehicles.js (React Query hook)
    ├── useBatteries.js
    └── useAuth.js
```

### 1. Centralized API Client

```javascript
// lib/api/client.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. API Service Layer

```javascript
// lib/api/vehicles.js
import apiClient from './client';

export const vehicleAPI = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/vehicles', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/vehicles', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/vehicles/${id}`);
    return response.data;
  },
};

export default vehicleAPI;
```

### 3. React Query Hooks (Recommended)

```javascript
// app/hooks/useVehicles.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vehicleAPI from '@/lib/api/vehicles';

export function useVehicles(filters = {}) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => vehicleAPI.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
}

export function useVehicle(id) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehicleAPI.getById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => vehicleAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicle(id) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => vehicleAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useDeleteVehicle(id) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => vehicleAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
```

**Install React Query:**
```bash
npm install @tanstack/react-query
```

### 4. Error Handling

```javascript
// lib/api/errorHandler.js
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    throw new APIError(
      data.message || 'An error occurred',
      status,
      data
    );
  } else if (error.request) {
    // Request made but no response
    throw new APIError('No response from server', 0, {});
  } else {
    // Error in request setup
    throw error;
  }
};
```

---

## Role-Based Access Control (RBAC)

### Permission Model

```javascript
// utils/permissions.js
export const PERMISSIONS = {
  // Vehicles
  VEHICLE_VIEW: 'vehicle:view',
  VEHICLE_CREATE: 'vehicle:create',
  VEHICLE_EDIT: 'vehicle:edit',
  VEHICLE_DELETE: 'vehicle:delete',

  // Batteries
  BATTERY_VIEW: 'battery:view',
  BATTERY_CREATE: 'battery:create',
  BATTERY_EDIT: 'battery:edit',
  BATTERY_DELETE: 'battery:delete',

  // Charging Stations
  STATION_VIEW: 'station:view',
  STATION_CREATE: 'station:create',
  STATION_EDIT: 'station:edit',
  STATION_DELETE: 'station:delete',

  // Work Orders
  WORKORDER_VIEW: 'workorder:view',
  WORKORDER_CREATE: 'workorder:create',
  WORKORDER_EDIT: 'workorder:edit',
  WORKORDER_DELETE: 'workorder:delete',
};

export const ROLE_PERMISSIONS = {
  regional_head: [
    PERMISSIONS.VEHICLE_VIEW,
    PERMISSIONS.BATTERY_VIEW,
    PERMISSIONS.STATION_VIEW,
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_CREATE,
  ],
  circle_head: [
    PERMISSIONS.VEHICLE_VIEW,
    PERMISSIONS.VEHICLE_EDIT,
    PERMISSIONS.BATTERY_VIEW,
    PERMISSIONS.STATION_VIEW,
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_CREATE,
    PERMISSIONS.WORKORDER_EDIT,
  ],
  area_head: [
    PERMISSIONS.VEHICLE_VIEW,
    PERMISSIONS.VEHICLE_EDIT,
    PERMISSIONS.BATTERY_VIEW,
    PERMISSIONS.STATION_VIEW,
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_CREATE,
    PERMISSIONS.WORKORDER_EDIT,
  ],
};
```

### Permission Checking Utilities

```javascript
// utils/rbac.js
import { ROLE_PERMISSIONS, PERMISSIONS } from './permissions';

/**
 * Check if user has specific permission
 */
export function hasPermission(user, permission) {
  if (!user || !user.role) return false;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
}

/**
 * Check if user has any of the given permissions
 */
export function hasAnyPermission(user, permissionList) {
  return permissionList.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all of the given permissions
 */
export function hasAllPermissions(user, permissionList) {
  return permissionList.every(permission => hasPermission(user, permission));
}

/**
 * Get user's accessible data scope
 */
export function getUserDataScope(user) {
  if (!user) return null;

  switch (user.role) {
    case 'regional_head':
      return { region: user.region };
    case 'circle_head':
      return { region: user.region, circle: user.circle };
    case 'area_head':
      return { region: user.region, circle: user.circle, area: user.area };
    default:
      return null;
  }
}

/**
 * Filter data based on user's scope
 */
export function filterDataByUserScope(data, user) {
  if (!user) return [];
  const scope = getUserDataScope(user);
  
  return data.filter(item => {
    if (user.role === 'regional_head') {
      return item.region === scope.region;
    }
    if (user.role === 'circle_head') {
      return item.region === scope.region && item.circle === scope.circle;
    }
    if (user.role === 'area_head') {
      return item.region === scope.region && 
             item.circle === scope.circle && 
             item.area === scope.area;
    }
    return false;
  });
}
```

### Component-Level RBAC

```javascript
// components/ProtectedComponent.js
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/utils/rbac';

export function ProtectedComponent({ permission, children, fallback = null }) {
  const { data: session } = useSession();

  if (!session || !hasPermission(session.user, permission)) {
    return fallback;
  }

  return children;
}

// Usage
<ProtectedComponent permission={PERMISSIONS.VEHICLE_DELETE}>
  <button>Delete Vehicle</button>
</ProtectedComponent>
```

### Protected API Routes

```javascript
// app/api/vehicles/route.js
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission } from '@/utils/rbac';

export async function GET(request) {
  const session = await auth();
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!hasPermission(session.user, 'vehicle:view')) {
    return new Response('Forbidden', { status: 403 });
  }

  // Process request based on user's data scope
  // ...
}

export async function POST(request) {
  const session = await auth();

  if (!hasPermission(session.user, 'vehicle:create')) {
    return new Response('Forbidden', { status: 403 });
  }

  // Create vehicle
  // ...
}
```

---

## Component Patterns

### 1. Conditional Rendering Based on Permissions

```javascript
// components/VehicleActions.js
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/utils/rbac';
import { PERMISSIONS } from '@/utils/permissions';

export function VehicleActions({ vehicleId }) {
  const { data: session } = useSession();

  return (
    <div className="flex gap-2">
      {hasPermission(session?.user, PERMISSIONS.VEHICLE_EDIT) && (
        <button className="btn btn-primary">Edit</button>
      )}
      {hasPermission(session?.user, PERMISSIONS.VEHICLE_DELETE) && (
        <button className="btn btn-danger">Delete</button>
      )}
    </div>
  );
}
```

### 2. Custom Hook for Permissions

```javascript
// hooks/usePermission.js
import { useSession } from 'next-auth/react';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/utils/rbac';

export function usePermission() {
  const { data: session } = useSession();

  return {
    can: (permission) => hasPermission(session?.user, permission),
    canAny: (permissions) => hasAnyPermission(session?.user, permissions),
    canAll: (permissions) => hasAllPermissions(session?.user, permissions),
    user: session?.user,
  };
}

// Usage
function MyComponent() {
  const { can, user } = usePermission();

  return (
    <>
      {can('vehicle:create') && <CreateVehicleButton />}
      {can('vehicle:delete') && <DeleteButton />}
    </>
  );
}
```

### 3. Higher-Order Component for Protected Routes

```javascript
// hoc/withProtectedRoute.js
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/utils/rbac';

export function withProtectedRoute(Component, requiredPermission) {
  return function ProtectedComponent(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading') {
      return <div>Loading...</div>;
    }

    if (!session) {
      router.push('/login');
      return null;
    }

    if (requiredPermission && !hasPermission(session.user, requiredPermission)) {
      return <div>Access Denied</div>;
    }

    return <Component {...props} />;
  };
}

// Usage
export default withProtectedRoute(VehicleManagementPage, 'vehicle:view');
```

---

## Folder Structure

### Recommended Project Organization

```
voltup/
├── public/                          # Static assets
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.js
│   │   ├── vehicles/
│   │   │   ├── route.js            # GET, POST
│   │   │   └── [id]/route.js       # GET, PUT, DELETE
│   │   ├── batteries/
│   │   ├── charging-stations/
│   │   └── tcu/
│   ├── assets/
│   │   ├── page.js
│   │   ├── layout.js
│   │   ├── components/
│   │   │   ├── AssetTabs.js
│   │   │   └── AssetFilter.js
│   │   ├── vehicles/
│   │   ├── batteries/
│   │   ├── charging-stations/
│   │   └── tcu/
│   ├── components/                 # Shared UI components
│   │   ├── ProtectedComponent.js
│   │   ├── Sidebar.js
│   │   ├── BottomNavbar.js
│   │   ├── KPICard.js
│   │   └── ...
│   ├── contexts/                   # React Contexts
│   │   ├── SidebarContext.js
│   │   ├── AppContext.js           # NEW: Global app state
│   │   ├── NotificationContext.js  # NEW: Notifications
│   │   └── AuthContext.js          # NEW: Auth state
│   ├── hooks/                      # Custom React hooks
│   │   ├── usePermission.js        # NEW: Permission checking
│   │   ├── useVehicles.js          # NEW: React Query hooks
│   │   ├── useAuth.js              # NEW: Auth utilities
│   │   ├── useNotification.js      # NEW: Toast/notification
│   │   └── ...
│   ├── hoc/                        # Higher-Order Components
│   │   ├── withProtectedRoute.js   # NEW: Route protection
│   │   └── withRBAC.js             # NEW: Component RBAC
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.js           # NEW: Axios instance
│   │   │   ├── vehicles.js         # NEW: Vehicle API
│   │   │   ├── batteries.js        # NEW: Battery API
│   │   │   ├── errorHandler.js     # NEW: Error handling
│   │   │   └── constants.js        # API endpoints
│   │   └── utils/
│   │       └── cn.js               # Class name utility
│   ├── providers/
│   │   ├── Providers.js
│   │   └── SessionProvider.js
│   ├── utils/
│   │   ├── auth.js                 # Existing auth utilities
│   │   ├── rbac.js                 # NEW: RBAC utilities
│   │   ├── permissions.js          # NEW: Permission constants
│   │   ├── validators.js           # NEW: Form validators
│   │   ├── formatters.js           # NEW: Data formatters
│   │   └── constants.js            # App constants
│   ├── layout.js
│   ├── page.js
│   ├── middleware.js               # Route protection
│   └── globals.css
├── tests/                          # NEW: Unit & integration tests
│   ├── __mocks__/
│   ├── unit/
│   │   └── utils/
│   │       ├── auth.test.js
│   │       └── rbac.test.js
│   └── integration/
├── .env.local.example              # NEW: Environment variables template
├── .env.production                 # NEW: Production env
├── .gitignore
├── ARCHITECTURE.md                 # THIS FILE
├── package.json
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## Best Practices

### 1. Authentication Security
- ✅ Use `NEXTAUTH_SECRET` in production (strong random string)
- ✅ Enable HTTPS in production
- ✅ Set `sameSite: 'strict'` on cookies
- ✅ Implement CSRF protection
- ✅ Use refresh tokens for long-lived sessions
- ❌ Don't store sensitive data in JWT (it's readable)
- ❌ Don't use `httpOnly: false` on auth cookies

### 2. API Security
- ✅ Validate all inputs server-side
- ✅ Use rate limiting on API endpoints
- ✅ Implement CORS properly
- ✅ Use environment variables for secrets
- ✅ Log API errors (but not sensitive data)
- ❌ Don't expose stack traces in production
- ❌ Don't trust client-side permissions validation

### 3. State Management Best Practices
- Split global state from local component state
- Use Context for UI state (sidebar, theme, modal states)
- Use React Query for server state (API data)
- Avoid putting everything in global state
- Memoize context values to prevent unnecessary re-renders
- Use useCallback for dispatch functions

### 4. Component Design
- Keep components small and focused
- Lift state only when necessary
- Use composition over inheritance
- Implement proper error boundaries
- Make components reusable with props
- Use TypeScript for better type safety

### 5. Performance Optimization
- Use React.memo for expensive components
- Implement code splitting with dynamic imports
- Lazy load images and components
- Use next/image for optimized images
- Implement pagination/virtualization for large lists
- Cache API responses appropriately

### 6. Testing Strategy
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

```javascript
// tests/unit/utils/rbac.test.js
import { describe, it, expect } from 'vitest';
import { hasPermission } from '@/utils/rbac';
import { PERMISSIONS } from '@/utils/permissions';

describe('RBAC Utilities', () => {
  it('should allow regional_head to view vehicles', () => {
    const user = { role: 'regional_head', region: 'west' };
    expect(hasPermission(user, PERMISSIONS.VEHICLE_VIEW)).toBe(true);
  });

  it('should deny permissions to users without role', () => {
    const user = {};
    expect(hasPermission(user, PERMISSIONS.VEHICLE_DELETE)).toBe(false);
  });
});
```

### 7. Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/voltup
```

### 8. Error Handling Pattern
```javascript
// Global error boundary
import { useEffect } from 'react';

export function ErrorBoundary({ children }) {
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error:', event.error);
      // Send to error tracking service (Sentry, etc.)
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return children;
}
```

### 9. Logging & Monitoring
```javascript
// lib/logger.js
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (msg, data) => isDevelopment && console.log(msg, data),
  error: (msg, error) => console.error(msg, error),
  warn: (msg, data) => console.warn(msg, data),
  info: (msg, data) => isDevelopment && console.info(msg, data),
};
```

### 10. Code Organization Tips
- Group related utilities together
- Use barrel exports (index.js) for cleaner imports
- Keep business logic separate from UI components
- Use consistent naming conventions
- Document complex functions with JSDoc
- Keep utility functions pure and testable

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up folder structure
- [ ] Implement context providers (AppContext, NotificationContext)
- [ ] Create RBAC utilities and permission system
- [ ] Add custom hooks (usePermission, useAuth)
- [ ] Implement error boundaries

### Phase 2: API Integration (Week 3-4)
- [ ] Set up React Query
- [ ] Create API service layer (client, endpoints)
- [ ] Implement data fetching hooks
- [ ] Add error handling middleware
- [ ] Cache strategy implementation

### Phase 3: Component Enhancement (Week 5-6)
- [ ] Create protected components (ProtectedComponent, ProtectedRoute)
- [ ] Implement RBAC in UI components (buttons, forms)
- [ ] Add permission-based visibility
- [ ] Create permission helper hooks
- [ ] Refactor existing components

### Phase 4: Security & Testing (Week 7-8)
- [ ] Implement comprehensive unit tests
- [ ] Add integration tests
- [ ] Security audit of auth flow
- [ ] Performance profiling and optimization
- [ ] Documentation and code cleanup

---

## Migration Guide (From Current to Recommended)

### Step 1: Install Dependencies
```bash
npm install @tanstack/react-query axios
npm install --save-dev vitest @testing-library/react
```

### Step 2: Create New Folder Structure
```bash
mkdir -p app/lib/api
mkdir -p app/hooks
mkdir -p app/hoc
mkdir -p tests/unit
```

### Step 3: Migrate API Calls
- Move all fetch calls to dedicated service files in `app/lib/api/`
- Create React Query hooks in `app/hooks/`
- Update components to use hooks instead of direct fetch

### Step 4: Implement RBAC
- Add `utils/permissions.js` and `utils/rbac.js`
- Update `app/api/auth/[...nextauth]/route.js` to include permissions
- Add permission checks to API routes

### Step 5: Update Components
- Wrap protected components with `<ProtectedComponent />`
- Use `usePermission()` hook in components
- Add permission checks for buttons/actions

---

## Quick Reference: Common Patterns

### Using Permissions in a Component
```javascript
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/utils/permissions';

export function VehicleCard({ vehicle }) {
  const { can } = usePermission();

  return (
    <div className="card">
      <h3>{vehicle.name}</h3>
      {can(PERMISSIONS.VEHICLE_EDIT) && (
        <button onClick={() => editVehicle(vehicle.id)}>Edit</button>
      )}
      {can(PERMISSIONS.VEHICLE_DELETE) && (
        <button onClick={() => deleteVehicle(vehicle.id)}>Delete</button>
      )}
    </div>
  );
}
```

### Fetching Data with React Query
```javascript
import { useVehicles } from '@/hooks/useVehicles';

export function VehiclesList() {
  const { data, isLoading, error } = useVehicles();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
```

### Protected API Route
```javascript
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission } from '@/utils/rbac';

export async function PUT(request, { params }) {
  const session = await auth();
  
  if (!session?.user || !hasPermission(session.user, 'vehicle:edit')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Update vehicle...
}
```

---

## Troubleshooting

### Session Not Available in Components
- Wrap component with `<SessionProvider>`
- Make sure parent is a client component (`'use client'`)
- Check `refetchInterval` setting

### Context Re-renders Everything
- Memoize context value: `useMemo(() => ({ state, dispatch }), [state])`
- Split contexts by concern (UI state, auth, notifications)
- Consider React Query for server state

### RBAC Not Working
- Ensure permissions are in session via JWT callback
- Check that `ROLE_PERMISSIONS` includes the role
- Verify permission string matches exactly

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js v5 Docs](https://authjs.dev)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Last Updated:** November 25, 2025
**Author:** Voltup Development Team
