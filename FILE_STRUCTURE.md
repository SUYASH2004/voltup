# Draive Project File Structure

## 📁 Root Directory

```
draive-1/
├── app/                    # Next.js App Router directory (main application)
├── public/                 # Static assets (images, icons, etc.)
├── node_modules/           # Dependencies (auto-generated)
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Locked dependency versions
├── next.config.mjs         # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration for Tailwind
├── eslint.config.mjs       # ESLint configuration
├── jsconfig.json           # JavaScript/TypeScript configuration
└── README.md               # Project documentation
```

---

## 📂 `/app` Directory (Main Application)

### **Core Files**

#### `layout.js`
- **Purpose**: Root layout component for the entire application
- **Features**: 
  - Wraps all pages with providers (Session, Sidebar)
  - Sets up fonts (Geist Sans & Mono)
  - Defines global metadata
- **Exports**: RootLayout component

#### `page.js`
- **Purpose**: Home/Dashboard page (`/`)
- **Features**:
  - Displays KPI cards (Total Assets, Work Orders, Available Assets)
  - Shows recent work orders
  - Shows asset status overview
  - Displays user role badge

#### `globals.css`
- **Purpose**: Global styles and Tailwind CSS configuration
- **Features**:
  - CSS variables for colors
  - Background styling
  - Safe area support for mobile devices
  - Scrollbar hiding utilities

#### `middleware.js`
- **Purpose**: Route protection and authentication middleware
- **Features**:
  - Protects all routes except `/login` and API routes
  - Redirects unauthenticated users to login
  - Checks session expiration (24 hours)
  - Handles callback URLs after login

---

### **📁 `/app/api` - API Routes**

#### `/api/auth/[...nextauth]/route.js`
- **Purpose**: NextAuth.js authentication API endpoint
- **Features**:
  - Handles login/logout requests
  - Credentials provider for email/password authentication
  - JWT token management
  - Session callbacks (JWT & Session)
  - User role and region data in session
- **Exports**: GET and POST handlers for authentication

---

### **📁 `/app/login` - Login Page**

#### `page.js`
- **Purpose**: User login page (`/login`)
- **Features**:
  - Email and password login form
  - Error handling and display
  - Demo credentials display
  - Responsive design
  - Session expired message handling

#### `layout.js`
- **Purpose**: Layout wrapper for login page
- **Features**: Simple wrapper without sidebar/navbar

---

### **📁 `/app/assets` - Assets Management**

#### `layout.js`
- **Purpose**: Shared layout for all asset pages
- **Features**:
  - Page header ("Assets")
  - Asset tabs navigation
  - Responsive container

#### `page.js`
- **Purpose**: Assets index page (`/assets`)
- **Features**: Redirects to `/assets/vehicles` (default)

#### `/components/AssetTabs.js`
- **Purpose**: Tab navigation for asset types
- **Features**:
  - 4 tabs: Vehicles, Batteries, Charging Stations, TCU
  - Active state highlighting
  - Responsive design (short labels on mobile)
  - Horizontal scrolling on mobile

#### `/vehicles/page.js`
- **Purpose**: Vehicles asset page (`/assets/vehicles`)
- **Status**: Empty placeholder ready for database integration

#### `/batteries/page.js`
- **Purpose**: Batteries asset page (`/assets/batteries`)
- **Status**: Empty placeholder ready for database integration

#### `/charging-stations/page.js`
- **Purpose**: Charging Stations asset page (`/assets/charging-stations`)
- **Status**: Empty placeholder ready for database integration

#### `/tcu/page.js`
- **Purpose**: TCU (Telematics Control Unit) asset page (`/assets/tcu`)
- **Status**: Empty placeholder ready for database integration

---

### **📁 `/app/components` - Reusable Components**

#### `BottomNavbar.js`
- **Purpose**: Mobile bottom navigation bar
- **Features**:
  - Fixed bottom position (mobile only)
  - 4 navigation items: Home, Assets, Orders, Plans
  - Active route highlighting
  - Rounded pill design
  - Touch-friendly icons

#### `KPICard.js`
- **Purpose**: Key Performance Indicator card component
- **Features**:
  - Displays title, value, change percentage
  - Trend indicators (up/down arrows)
  - Icon support
  - Hover effects

#### `LayoutWrapper.js`
- **Purpose**: Main layout wrapper with sidebar and bottom nav
- **Features**:
  - Conditionally shows sidebar (desktop) and bottom nav (mobile)
  - Hides navigation on login page
  - Adjusts margin based on sidebar collapse state
  - Includes SessionTimeout component

#### `RoleBadge.js`
- **Purpose**: Displays user role and scope
- **Features**:
  - Shows role (Regional Head, Circle Head, Area Head)
  - Displays scope (Region/Circle/Area)
  - Green badge styling

#### `SessionTimeout.js`
- **Purpose**: Monitors session expiration
- **Features**:
  - Checks session expiration every 5 minutes
  - Auto-logout when session expires
  - No aggressive redirects (middleware handles that)

#### `Sidebar.js`
- **Purpose**: Desktop sidebar navigation
- **Features**:
  - Collapsible/expandable (80px ↔ 256px)
  - Navigation items with icons
  - Active route highlighting
  - User profile section
  - Footer with company info
  - State persisted in localStorage

#### `StatusBadge.js`
- **Purpose**: Status indicator badge component
- **Features**:
  - Color-coded statuses (Active, Available, In Use, Maintenance, etc.)
  - Size variants (sm, md, lg)
  - Status dot indicator
  - Border styling

#### `UserProfile.js`
- **Purpose**: User profile display in sidebar
- **Features**:
  - Shows user name, role, and scope
  - Sign out button
  - Only visible when sidebar is expanded

---

### **📁 `/app/contexts` - React Contexts**

#### `SidebarContext.js`
- **Purpose**: Global state for sidebar collapse/expand
- **Features**:
  - `isCollapsed` state
  - `toggleSidebar` function
  - State persisted in localStorage
  - Provider component for app-wide access

---

### **📁 `/app/providers` - Context Providers**

#### `Providers.js`
- **Purpose**: Combines all providers
- **Features**:
  - Wraps SessionProvider and SidebarProvider
  - Single entry point for all providers

#### `SessionProvider.js`
- **Purpose**: NextAuth session provider wrapper
- **Features**:
  - Provides session context to all components
  - Configures refetch interval (5 minutes)
  - Disables refetch on window focus

---

### **📁 `/app/utils` - Utility Functions**

#### `auth.js`
- **Purpose**: Role-based access control utilities
- **Functions**:
  - `hasRegionAccess()` - Check region access
  - `hasCircleAccess()` - Check circle access
  - `hasAreaAccess()` - Check area access
  - `filterDataByUserAccess()` - Filter data by user role
  - `getUserScope()` - Get user's scope description
- **Constants**: ROLES, REGIONS

---

## 📂 `/public` Directory

Contains static assets:
- `favicon.ico` - Site favicon
- SVG icons (file, globe, next, vercel, window) - Default Next.js assets

---

## 🔧 Configuration Files

### `package.json`
- **Dependencies**:
  - `next`: 16.0.3 - Next.js framework
  - `next-auth`: ^5.0.0-beta.30 - Authentication
  - `react`: 19.2.0 - React library
  - `react-dom`: 19.2.0 - React DOM
- **Dev Dependencies**:
  - `tailwindcss`: ^4 - CSS framework
  - `@tailwindcss/postcss`: ^4 - PostCSS plugin
  - `eslint`: ^9 - Linting
  - `eslint-config-next`: 16.0.3 - Next.js ESLint config

### `next.config.mjs`
- Next.js configuration file
- Currently minimal/default configuration

### `postcss.config.mjs`
- PostCSS configuration for Tailwind CSS processing

### `eslint.config.mjs`
- ESLint configuration for code quality

### `jsconfig.json`
- JavaScript/TypeScript path aliases and configuration

---

## 🔐 Authentication Flow

1. **User visits any page** → Middleware checks authentication
2. **Not authenticated** → Redirects to `/login`
3. **User logs in** → NextAuth validates credentials
4. **Success** → Creates JWT token with user data (role, region, circle, area)
5. **Session stored** → Available throughout app via SessionProvider
6. **24-hour expiration** → Auto-logout after 24 hours

---

## 🎨 Design System

- **Primary Color**: Emerald Green (#059669)
- **Accent Color**: Light Green (#10B981)
- **Background**: Light Gray (#f8fafc)
- **Cards**: White with subtle shadows
- **Typography**: Geist Sans (default), Geist Mono (code)

---

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (default)
- **Small**: ≥ 640px (`sm:`)
- **Medium**: ≥ 768px (`md:`)
- **Large**: ≥ 1024px (`lg:`)

---

## 🚀 Key Features

1. **Role-Based Access Control**: Regional Head, Circle Head, Area Head
2. **Session Management**: 24-hour JWT sessions
3. **Responsive Design**: Mobile-first approach
4. **Collapsible Sidebar**: Desktop navigation
5. **Bottom Navigation**: Mobile navigation
6. **Asset Management**: 4 asset types (Vehicles, Batteries, Charging Stations, TCU)
7. **Protected Routes**: All routes require authentication except login

---

## 📝 Notes

- All asset pages are currently empty placeholders ready for database integration
- Authentication uses mock user database (replace with real DB in production)
- Session state is managed via NextAuth.js
- Sidebar state persists in localStorage
- Mobile navigation uses floating bottom navbar design

