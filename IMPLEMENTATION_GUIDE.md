# Implementation Guide - Next Steps

This guide outlines how to start implementing the architecture described in `ARCHITECTURE.md`.

## Phase 1: Foundation (Currently in Progress ✅)

### ✅ Completed
- [x] Created `ARCHITECTURE.md` with complete system design
- [x] Created `.env.local.example` template
- [x] Created `app/utils/permissions.js` - Permission constants
- [x] Created `app/utils/rbac.js` - RBAC utility functions
- [x] Created `app/lib/api/client.js` - Centralized API client
- [x] Created `app/lib/api/vehicles.js` - Vehicle API service
- [x] Created `app/hooks/usePermission.js` - Permission hook
- [x] Created `app/components/ProtectedComponent.js` - Permission-based rendering
- [x] Created `app/contexts/NotificationContext.js` - Global notifications

### 🔄 In Progress
- [ ] Integrate NotificationContext into Providers.js
- [ ] Update NextAuth route to include permissions in session

### 📋 To Do (This Phase)
- [ ] Create NotificationDisplay component
- [ ] Create AppContext for global state
- [ ] Implement error boundaries
- [ ] Set up logging utility

---

## Step-by-Step Implementation

### Step 1: Update Providers to Include NotificationContext

Edit `app/providers/Providers.js`:

```javascript
'use client';

import SessionProvider from './SessionProvider';
import { SidebarProvider } from '../contexts/SidebarContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
```

**Why:** Makes notifications available globally to all components.

---

### Step 2: Update NextAuth to Include Permissions

Edit `app/api/auth/[...nextauth]/route.js` JWT callback:

```javascript
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.region = user.region;
    token.circle = user.circle;
    token.area = user.area;
    
    // NEW: Add permissions from role
    const { ROLE_PERMISSIONS } = await import('@/utils/permissions');
    token.permissions = ROLE_PERMISSIONS[user.role] || [];
  }
  return token;
},
```

**Why:** Makes permissions available in session without recalculating them.

---

### Step 3: Create NotificationDisplay Component

Create `app/components/NotificationDisplay.js`:

```javascript
'use client';

import { useNotification } from '@/contexts/NotificationContext';

export function NotificationDisplay() {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg text-white max-w-sm ${
            notification.type === 'success'
              ? 'bg-green-500'
              : notification.type === 'error'
              ? 'bg-red-500'
              : notification.type === 'warning'
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}
```

Add to `app/layout.js`:

```javascript
import { NotificationDisplay } from './components/NotificationDisplay';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body {...}>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <NotificationDisplay />
        </Providers>
      </body>
    </html>
  );
}
```

---

### Step 4: Create AppContext for Global State

Create `app/contexts/AppContext.js`:

```javascript
'use client';

import { createContext, useContext, useReducer, useMemo } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  filters: {
    region: null,
    circle: null,
    area: null,
    searchQuery: '',
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AppContext.Provider value={value}>
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

Add to `app/providers/Providers.js`:

```javascript
import { AppProvider } from '../contexts/AppContext';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <AppProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </AppProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
```

---

### Step 5: Create Error Boundary

Create `app/components/ErrorBoundary.js`:

```javascript
'use client';

import { useEffect } from 'react';

export function ErrorBoundary({ children, fallback = null }) {
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
      // Send to error tracking service here (Sentry, etc.)
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return children;
}
```

Add to `app/layout.js`:

```javascript
import { ErrorBoundary } from './components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <Providers>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

### Step 6: Create Logger Utility

Create `app/lib/logger.js`:

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  log: (message, data = {}) => {
    if (isDevelopment) {
      console.log(`[LOG] ${message}`, data);
    }
  },

  error: (message, error = {}) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service
    if (isProduction) {
      // sendToSentry(error);
    }
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data);
  },

  info: (message, data = {}) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, data);
    }
  },

  debug: (message, data = {}) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};

export default logger;
```

---

## Phase 2: API Integration

### Install React Query

```bash
npm install @tanstack/react-query
```

### Create React Query Provider

Create `app/providers/ReactQueryProvider.js`:

```javascript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMemo } from 'react';

export function ReactQueryProvider({ children }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 3,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Add to `app/providers/Providers.js`:

```javascript
import { ReactQueryProvider } from './ReactQueryProvider';

export default function Providers({ children }) {
  return (
    <ReactQueryProvider>
      <SessionProvider>
        {/* ... rest of providers ... */}
      </SessionProvider>
    </ReactQueryProvider>
  );
}
```

### Create React Query Hooks

Already created: `app/lib/api/vehicles.js`

Create similar files for:
- `app/lib/api/batteries.js`
- `app/lib/api/charging-stations.js`
- `app/lib/api/tcu.js`

---

## Usage Examples

### Using Protected Component

```javascript
import { ProtectedComponent } from '@/components/ProtectedComponent';
import { PERMISSIONS } from '@/utils/permissions';

export function VehicleActions() {
  return (
    <div className="flex gap-2">
      <ProtectedComponent permission={PERMISSIONS.VEHICLE_EDIT}>
        <button className="btn btn-primary">Edit</button>
      </ProtectedComponent>

      <ProtectedComponent permission={PERMISSIONS.VEHICLE_DELETE}>
        <button className="btn btn-danger">Delete</button>
      </ProtectedComponent>

      <ProtectedComponent
        permission={[PERMISSIONS.VEHICLE_EXPORT]}
        fallback={<span className="text-gray-400">Export</span>}
      >
        <button className="btn btn-secondary">Export</button>
      </ProtectedComponent>
    </div>
  );
}
```

### Using Permission Hook

```javascript
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/utils/permissions';

export function Dashboard() {
  const { can, user } = usePermission();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      
      {can(PERMISSIONS.VEHICLE_VIEW) && (
        <section>
          <h2>Vehicles</h2>
          {/* Vehicles content */}
        </section>
      )}

      {can(PERMISSIONS.BATTERY_VIEW) && (
        <section>
          <h2>Batteries</h2>
          {/* Batteries content */}
        </section>
      )}
    </div>
  );
}
```

### Using Notifications

```javascript
import { useNotification } from '@/contexts/NotificationContext';
import vehicleAPI from '@/lib/api/vehicles';

export function CreateVehicle() {
  const { success, error } = useNotification();

  const handleSubmit = async (data) => {
    try {
      await vehicleAPI.create(data);
      success('Vehicle created successfully!');
    } catch (err) {
      error(`Failed to create vehicle: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Using React Query

```javascript
import { useVehicles } from '@/hooks/useVehicles';
import { useNotification } from '@/contexts/NotificationContext';

export function VehiclesList() {
  const { data, isLoading, error } = useVehicles();
  const { error: showError } = useNotification();

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    showError(`Failed to load vehicles: ${error.message}`);
    return <div>Error loading vehicles</div>;
  }

  return (
    <div>
      {data.map((vehicle) => (
        <div key={vehicle.id}>{vehicle.name}</div>
      ))}
    </div>
  );
}
```

---

## Checklist for Implementation

- [ ] Update `app/providers/Providers.js` with all contexts
- [ ] Update NextAuth to include permissions
- [ ] Create `NotificationDisplay` component
- [ ] Create `AppContext`
- [ ] Create `ErrorBoundary`
- [ ] Create logger utility
- [ ] Install and setup React Query
- [ ] Create React Query hooks for all API endpoints
- [ ] Convert existing components to use hooks
- [ ] Add permission checks to API routes
- [ ] Create tests for RBAC utilities
- [ ] Document component APIs
- [ ] Add TypeScript types (optional but recommended)

---

## Common Pitfalls to Avoid

1. ❌ Don't put everything in global context → Split by concern (UI, auth, notifications, server state)
2. ❌ Don't trust client-side permissions → Always validate on backend
3. ❌ Don't hardcode API URLs → Use environment variables
4. ❌ Don't expose sensitive data in logs → Filter before logging
5. ❌ Don't forget error handling → Wrap API calls with try-catch
6. ❌ Don't re-fetch same data → Use React Query caching
7. ❌ Don't commit `.env.local` → Add to `.gitignore`
8. ❌ Don't bypass auth middleware → Always validate sessions

---

## Testing

Create `tests/unit/utils/rbac.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { hasPermission, canActionOnItem } from '@/utils/rbac';
import { PERMISSIONS } from '@/utils/permissions';

describe('RBAC', () => {
  const regionalHead = {
    role: 'regional_head',
    region: 'west',
  };

  const circleHead = {
    role: 'circle_head',
    region: 'west',
    circle: 'mumbai',
  };

  it('should allow regional head to view vehicles', () => {
    expect(hasPermission(regionalHead, PERMISSIONS.VEHICLE_VIEW)).toBe(true);
  });

  it('should deny delete permission to circle head', () => {
    expect(hasPermission(circleHead, PERMISSIONS.VEHICLE_DELETE)).toBe(false);
  });

  it('should check scope when performing action', () => {
    const vehicle = { id: 1, region: 'west', circle: 'mumbai' };
    expect(
      canActionOnItem(circleHead, PERMISSIONS.VEHICLE_EDIT, vehicle)
    ).toBe(true);

    const differentVehicle = { id: 2, region: 'east', circle: 'delhi' };
    expect(
      canActionOnItem(circleHead, PERMISSIONS.VEHICLE_EDIT, differentVehicle)
    ).toBe(false);
  });
});
```

Run tests:

```bash
npm run test
```

---

## Deployment Considerations

1. **Environment Variables**
   - Set `NEXTAUTH_SECRET` to a strong random string
   - Set `NEXTAUTH_URL` to your production domain
   - Set `NEXT_PUBLIC_API_URL` to your API endpoint

2. **Security Headers**
   - Add in `next.config.mjs`:
   ```javascript
   async headers() {
     return [
       {
         source: '/(.*)',
         headers: [
           { key: 'X-Content-Type-Options', value: 'nosniff' },
           { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
           { key: 'X-XSS-Protection', value: '1; mode=block' },
         ],
       },
     ];
   }
   ```

3. **CORS Configuration**
   - Only allow requests from your frontend domain
   - Include credentials in requests

4. **Rate Limiting**
   - Implement on API routes to prevent abuse
   - Use headers like `X-RateLimit-Limit`

---

## Support & Questions

For questions or issues, refer to:
- ARCHITECTURE.md - Design documentation
- Next.js docs: https://nextjs.org/docs
- NextAuth.js docs: https://authjs.dev
- React Query docs: https://tanstack.com/query
