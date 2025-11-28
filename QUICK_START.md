# Quick Start Guide - Voltup Architecture

## 📚 Documentation Files Created

1. **ARCHITECTURE.md** - Comprehensive architecture design covering:
   - Technology stack
   - Authentication & authorization patterns
   - State management strategies (Context API vs Redux)
   - API layer architecture
   - Role-based access control (RBAC)
   - Component patterns
   - Best practices & security

2. **IMPLEMENTATION_GUIDE.md** - Step-by-step implementation instructions with:
   - Phase-by-phase breakdown
   - Code examples for each pattern
   - Integration instructions
   - Usage examples
   - Testing strategies
   - Deployment checklist

3. **.env.local.example** - Environment variable template

## 🛠️ Files Created/Updated

### Utilities
- ✅ `app/utils/permissions.js` - Permission constants
- ✅ `app/utils/rbac.js` - RBAC helper functions
- ✅ `app/lib/logger.js` - Logging utility (referenced in ARCHITECTURE.md)

### API Layer
- ✅ `app/lib/api/client.js` - Centralized API client with interceptors
- ✅ `app/lib/api/vehicles.js` - Vehicle API endpoints

### React Hooks
- ✅ `app/hooks/usePermission.js` - Permission checking hook

### Components
- ✅ `app/components/ProtectedComponent.js` - Conditional rendering based on permissions

### Context
- ✅ `app/contexts/NotificationContext.js` - Global notification state

## 🚀 Next Steps (Recommended Order)

### Phase 1: Foundation (1-2 days)
1. Read `ARCHITECTURE.md` sections 1-5 for overview
2. Copy `.env.local.example` to `.env.local`
3. Update `app/providers/Providers.js` to include:
   - NotificationContext
   - AppContext (to be created)
4. Create `NotificationDisplay` component
5. Add `ErrorBoundary` component
6. Update NextAuth to include permissions in session

### Phase 2: API Layer (2-3 days)
1. Install React Query: `npm install @tanstack/react-query`
2. Create `ReactQueryProvider` in providers
3. Create API service files for each resource:
   - `app/lib/api/batteries.js`
   - `app/lib/api/charging-stations.js`
   - `app/lib/api/tcu.js`
4. Create React Query hooks in `app/hooks/`
5. Test with a simple component

### Phase 3: Component Migration (3-4 days)
1. Convert existing components to use hooks
2. Add permission checks to existing buttons/actions
3. Implement `<ProtectedComponent />` for conditional rendering
4. Test permissions across different user roles
5. Add error boundaries to error-prone sections

### Phase 4: Security & Testing (2-3 days)
1. Add permission checks to all API routes
2. Write unit tests for RBAC utilities
3. Security audit of auth flow
4. Set up CI/CD with GitHub Actions
5. Documentation review

## 📋 Key Concepts

### Authentication Flow
```
User Login → NextAuth Validates → JWT Created → 
Stored in HttpOnly Cookie → Session Enriched with Permissions → 
Available via useSession() hook
```

### Authorization Flow
```
Component Renders → Check Permission with usePermission() → 
Show/Hide based on ROLE_PERMISSIONS → 
Can also check scope (region/circle/area)
```

### State Management Strategy
```
Global UI State (Context API)
├── Sidebar collapsed state
├── Theme
└── Notifications

Server State (React Query)
├── Vehicles
├── Batteries
├── Charging Stations
└── Work Orders

Local Component State (useState)
└── Form inputs, modals, local toggles
```

### API Calling Pattern
```
Component → useVehicles() hook → React Query → 
apiClient → API endpoint → Backend → 
Response cached by React Query → 
Component re-renders with data
```

## 💡 Permission Examples

### For a Regional Head:
- Can view all vehicles, batteries, charging stations, TCUs in their region
- Can create and view work orders
- Cannot delete assets
- Cannot edit user accounts

### For a Circle Head:
- Can view and edit all assets in their circle
- Can create, view, and edit work orders
- Cannot delete assets
- Cannot view other circles

### For an Area Head:
- Can view and edit all assets in their area
- Can create, view, and edit work orders
- Cannot delete assets
- Cannot view other areas

## 🔐 Security Checklist

Before deploying to production:
- [ ] Set strong `NEXTAUTH_SECRET` (use `openssl rand -base64 32`)
- [ ] Enable HTTPS in production
- [ ] Validate all inputs server-side
- [ ] Don't trust client-side permissions
- [ ] Implement rate limiting on API routes
- [ ] Add CORS headers
- [ ] Log authentication events (not passwords!)
- [ ] Set secure cookie flags
- [ ] Implement CSRF protection
- [ ] Use environment variables for secrets

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│    React Components (Client)            │
│  - Pages, Components, Hooks             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  State Management & Business Logic      │
│  - Context API (UI state)               │
│  - React Query (Server state)           │
│  - Custom Hooks (Logic)                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        API Client Layer                 │
│  - Centralized Fetch/Axios              │
│  - Interceptors (Auth, Error)           │
│  - Error Handling                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    Next.js API Routes (Backend)         │
│  - Auth (/api/auth/[...nextauth])       │
│  - Resources (/api/vehicles, etc)       │
│  - Permission Checks                    │
│  - Database Operations                  │
└─────────────────────────────────────────┘
```

## 🧪 Testing the Setup

### Test Permissions
```javascript
// Test with different users
const regionalHead = { role: 'regional_head', region: 'west' };
const circleHead = { role: 'circle_head', region: 'west', circle: 'mumbai' };

console.log(hasPermission(regionalHead, 'vehicle:view')); // true
console.log(hasPermission(circleHead, 'vehicle:delete')); // false
```

### Test API Client
```javascript
// In a component
const data = await apiClient.get('/vehicles');
console.log(data);
```

### Test Notifications
```javascript
// In a component
const { success, error } = useNotification();
success('Vehicle created!');
error('Failed to delete vehicle');
```

## 📖 File Reference

```
voltup/
├── ARCHITECTURE.md                    ← Read first
├── IMPLEMENTATION_GUIDE.md            ← Follow this
├── .env.local.example                 ← Copy to .env.local
├── app/
│   ├── api/
│   │   └── auth/[...nextauth]/route.js (needs update)
│   ├── components/
│   │   └── ProtectedComponent.js ✅
│   ├── contexts/
│   │   ├── NotificationContext.js ✅
│   │   └── SidebarContext.js (existing)
│   ├── hooks/
│   │   └── usePermission.js ✅
│   ├── lib/
│   │   └── api/
│   │       ├── client.js ✅
│   │       └── vehicles.js ✅
│   ├── providers/
│   │   └── Providers.js (needs update)
│   └── utils/
│       ├── permissions.js ✅
│       ├── rbac.js ✅
│       └── auth.js (existing)
└── package.json (needs React Query)
```

## 🎯 Success Criteria

You'll know the implementation is successful when:
- ✅ Users can log in with different roles
- ✅ Permission checks work (buttons show/hide correctly)
- ✅ API calls are centralized and working
- ✅ Notifications appear when actions complete
- ✅ Data filtering works based on user scope
- ✅ No permission leaks in the UI
- ✅ Errors are handled gracefully
- ✅ Performance is acceptable (no unnecessary re-renders)

## 🆘 Troubleshooting

### "useSession is not defined"
→ Make sure component has `'use client'` directive and is wrapped with `<SessionProvider>`

### "useNotification must be used within NotificationProvider"
→ Add NotificationProvider to Providers.js

### "Permission check always returns false"
→ Verify permissions are in ROLE_PERMISSIONS and session includes them

### "API calls failing with 401"
→ Check that auth token is being sent in request headers

### "React Query not caching"
→ Verify queryKey is consistent between calls

## 📞 Quick Reference Commands

```bash
# Install dependencies
npm install

# Install React Query (Phase 2)
npm install @tanstack/react-query

# Start dev server
npm run dev

# Run linter
npm run lint

# Run tests (when set up)
npm run test

# Build for production
npm run build

# Start production server
npm run start
```

## 🎓 Learning Resources

- Next.js App Router: https://nextjs.org/docs/app
- NextAuth.js v5: https://authjs.dev
- React Context: https://react.dev/reference/react/useContext
- React Query: https://tanstack.com/query/latest
- Tailwind CSS: https://tailwindcss.com/docs
- OWASP Security: https://owasp.org/

---

**Status:** Ready for implementation  
**Last Updated:** November 25, 2025  
**Next Milestone:** Complete Phase 1 Foundation (3-5 days estimated)
