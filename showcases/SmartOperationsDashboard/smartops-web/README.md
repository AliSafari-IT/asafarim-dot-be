# SmartOps Web

SmartOps Web is the React 18 + TypeScript frontend for the Smart Operations Dashboard. It provides real-time visibility into IoT device telemetry, role-aware administration panels, and a cohesive user experience integrated with the ASafariM Identity platform for single sign-on (SSO).

## 🌐 Overview

**Technology Stack:**
- **UI Framework:** React 18 with TypeScript (strict mode)
- **Build Tool:** Vite 7 for fast development and optimized production builds
- **State Management:** Zustand for device state, KPIs, and error handling
- **Data Visualization:** Recharts for interactive charts and trend analysis
- **Routing:** React Router 6 for SPA navigation
- **HTTP Client:** Axios with automatic credential handling
- **Shared Libraries:** `@asafarim/shared-ui-react`, `@asafarim/design-tokens`, `@asafarim/shared-i18n`

**Key Features:**
- **Authentication:** SSO via Identity.Api using secure `atk` cookies
- **API Integration:** REST client with automatic JWT token injection
- **Real-time Data:** Device telemetry with configurable auto-refresh (30s default)
- **Role-Based UI:** Conditional rendering based on user permissions (Member, Manager, Admin)
- **Internationalization:** Multi-language support via shared i18n package
- **Responsive Design:** Mobile-friendly UI using shared design tokens

## ✅ Prerequisites

- **Node.js** 20+ (required for Vite 7 compatibility)
- **pnpm** 10+ (recommended) or npm 10+
- **SmartOps.Api** running on `http://localhost:5105`
- **Identity.Api** running on `http://identity.asafarim.local:5101`
- **Local domain setup** (recommended for development):
  ```bash
  # Add to /etc/hosts
  127.0.0.1 smartops.asafarim.local identity.asafarim.local
  ```

## 🚀 Quick Start

```bash
# 1. Install workspace dependencies from monorepo root
pnpm install

# 2. Navigate to smartops-web
cd showcases/SmartOperationsDashboard/smartops-web

# 3. Start development server with local domain
pnpm start

# Alternative: start with default localhost
pnpm dev
```

**Development Server:**
- **URL:** `http://smartops.asafarim.local:5178`
- **API Proxy:** `/api` → `http://localhost:5105`
- **Auth Proxy:** `/auth` → Identity API

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Starts Vite dev server on default host/port (localhost:5173) |
| `pnpm start` | Starts Vite with local domain flags (smartops.asafarim.local:5178) |
| `pnpm build` | Runs TypeScript checks and creates optimized production build in `dist/` |
| `pnpm preview` | Serves production build locally for testing before deployment |
| `pnpm lint` | Runs ESLint to check code quality and enforce conventions |
| `pnpm type-check` | Runs TypeScript compiler in check-only mode (no emit) |

**Script Details:**

- `pnpm dev` - Fast development with hot module replacement (HMR)
- `pnpm start` - Recommended for local development with domain-based testing
- `pnpm build` - Optimizes assets, code-splits bundles, minifies output
- `pnpm preview` - Simulates production environment locally (useful for QA)
- `pnpm lint` - Enforces code style, catches potential bugs

## 🔐 Environment Configuration

The application uses Vite environment variables to configure API endpoints and feature flags. Vite automatically exposes variables prefixed with `VITE_` to the client.

**Development** (`.env`):

```ini
# Identity API for SSO
VITE_IDENTITY_API_URL=http://identity.asafarim.local:5101

# SmartOps backend API
VITE_SMARTOPS_API_URL=http://localhost:5105/api

# Optional: Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_DEBUG_MODE=true
```

**Production** (`.env.production`):

```ini
# Production Identity API
VITE_IDENTITY_API_URL=https://identity.asafarim.be

# Production SmartOps API
VITE_SMARTOPS_API_URL=https://smartops.asafarim.be/api

# Production settings
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false
```

**Developer Overrides** (`.env.local` - not committed):

```ini
# Override specific variables for your local setup
VITE_SMARTOPS_API_URL=http://192.168.1.100:5105/api
VITE_DEBUG_MODE=true
```

**Environment Variable Usage:**

- `.env` - Base configuration for all environments
- `.env.production` - Production-specific overrides (used during `pnpm build`)
- `.env.local` - Developer-specific overrides (git-ignored, never committed)
- `.env.*.local` - Environment-specific developer overrides

**Accessing Variables in Code:**

```typescript
// Access via import.meta.env
const apiUrl = import.meta.env.VITE_SMARTOPS_API_URL;
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Type-safe environment variables (recommended)
import { env } from './config/env';
const apiUrl = env.SMARTOPS_API_URL;
```

## 🗂️ Project Structure

```
smartops-web/
├── src/
│   ├── api/                    # API client configuration
│   │   ├── config.ts           # Axios instance with auth headers
│   │   └── interceptors.ts     # Request/response interceptors
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.tsx          # Navigation bar with user menu
│   │   ├── DeviceCard.tsx      # Device summary card
│   │   ├── ReadingsChart.tsx   # Recharts visualization
│   │   └── ...
│   ├── pages/                  # Route-level screens
│   │   ├── Dashboard.tsx       # Device overview & KPIs
│   │   ├── Devices.tsx         # Device list & CRUD
│   │   ├── DeviceDetail.tsx    # Single device with readings
│   │   └── Admin.tsx           # User management (Admin only)
│   ├── hooks/                  # Custom React hooks & Zustand stores
│   │   ├── useDevicesStore.ts  # Device state management
│   │   ├── useAuthStore.ts     # Authentication state
│   │   └── useReadings.ts      # Reading data fetching
│   ├── services/               # REST API wrappers
│   │   ├── deviceService.ts    # Device CRUD operations
│   │   ├── readingService.ts   # Reading queries & aggregation
│   │   └── authService.ts      # Authentication helpers
│   ├── theme/                  # Design tokens & theming
│   │   ├── colors.ts           # Color palette
│   │   └── typography.ts       # Font scales
│   ├── types/                  # TypeScript type definitions
│   │   ├── device.ts           # Device & Reading types
│   │   ├── auth.ts             # User & Permission types
│   │   └── api.ts              # API response types
│   ├── utils/                  # Utility functions
│   │   ├── formatters.ts       # Date, number formatting
│   │   ├── validators.ts       # Form validation
│   │   └── constants.ts        # App constants
│   ├── App.tsx                 # Root layout component
│   ├── main.tsx                # Entry point with routing
│   └── index.css               # Global styles
├── public/                     # Static assets (favicon, etc.)
├── vite.config.ts              # Vite configuration with proxies
├── tsconfig.json               # TypeScript configuration
├── eslint.config.js            # ESLint rules
├── package.json                # Dependencies & scripts
└── README.md                   # This document
```

## 🧱 Application Architecture

### Routing & Navigation

Routes are declared using React Router 6's `createBrowserRouter`. The app structure:

```
/
├── / (Dashboard)
├── /devices (Device List)
├── /devices/:id (Device Detail)
└── /admin (User Management - Admin only)
```

Protected routes check user role and redirect to login if unauthorized.

### Layout & UI Components

`App.tsx` composes the root layout:
- **LayoutContainer** - Shared container from `@asafarim/shared-ui-react`
- **Navbar** - Navigation with user menu and logout
- **Footer** - Shared footer with version info
- **Outlet** - Route-specific page content

All components use design tokens from `@asafarim/design-tokens` for consistent styling.

### Internationalization (i18n)

The app initializes i18n before rendering:

```typescript
// main.tsx
await initI18n();  // Loads locale resources from shared-i18n
ReactDOM.render(<App />, document.getElementById('root'));
```

Supports multiple languages with locale switching in Navbar.

### State Management with Zustand

Device state, KPI summaries, and API errors are managed via Zustand stores:

**useDevicesStore:**
- `devices` - Array of device objects
- `loading` - Loading indicator
- `error` - Error messages
- `fetchDevices()` - Load devices from API
- `createDevice()` - Create new device
- `updateDevice()` - Update existing device
- `deleteDevice()` - Delete device (Admin only)

**useAuthStore:**
- `user` - Current user info
- `role` - User role (Member, Manager, Admin)
- `isAuthenticated` - Auth status
- `logout()` - Clear session

### Data & API Layer

**deviceService.ts** - Centralized REST client:

```typescript
// Automatic credential handling (includes atk cookie)
export const deviceService = {
  listDevices: (page, pageSize) => api.get('/devices', { params: { page, pageSize } }),
  getDevice: (id) => api.get(`/devices/${id}`),
  createDevice: (data) => api.post('/devices', data),
  updateDevice: (id, data) => api.put(`/devices/${id}`, data),
  deleteDevice: (id) => api.delete(`/devices/${id}`),
  getReadings: (deviceId, from, to) => api.get(`/readings`, { params: { deviceId, from, to } }),
  getStats: (deviceId) => api.get(`/readings/device/${deviceId}/stats`),
};
```

**API Configuration** (`api/config.ts`):
- Axios instance with base URL
- Request interceptor: Adds auth headers
- Response interceptor: Handles 401 errors, retries with refresh token
- Error handling: Transforms API errors to user-friendly messages

### Dashboard Experience

The Dashboard page:
1. Fetches device summaries on mount
2. Displays KPI cards (total devices, active devices, etc.)
3. Renders Recharts for trend visualization
4. Supports manual refresh button
5. Auto-refreshes every 30 seconds (configurable)
6. Shows error states with retry options
7. Listens for admin seeding events to reload data@showcases/SmartOperationsDashboard/smartops-web/src/pages/Dashboard/index.tsx#1-320

## 🔌 Backend Integration

**SmartOps API Integration:**

All API requests are routed through environment-configured endpoints:

- **Development:** Vite proxy forwards `/api` → `http://localhost:5105`
- **Production:** Direct requests to `https://smartops.asafarim.be/api`

The Axios client automatically includes credentials (cookies) with all requests.

**Identity API Integration:**

Authentication flows are proxied separately:

- **Development:** `/auth` → Identity.Api (configured in `vite.config.ts`)
- **Production:** Direct requests to `https://identity.asafarim.be`

The `atk` cookie is automatically sent with all requests after login.

**Prerequisites:**

Before launching the frontend, ensure:
1. **SmartOps.Api** is running on `http://localhost:5105`
2. **Identity.Api** is running and accessible
3. **PostgreSQL** database is initialized with schema
4. Environment variables are correctly configured

Refer to [SmartOperationsDashboard README](../README.md) for complete backend setup instructions.

## 🧪 Quality & Testing

**Code Quality:**

- **Linting:** `pnpm lint` runs ESLint with React/TypeScript rules
  - Enforces code style and best practices
  - Catches common bugs and anti-patterns
  - Auto-fix available: `pnpm lint -- --fix`

- **Type Safety:** TypeScript strict mode enabled
  - `pnpm type-check` validates types without emitting
  - `pnpm build` includes full type checking
  - No `any` types allowed in production code

- **Formatting:** Prettier integration (via ESLint)
  - Consistent code formatting across team
  - Auto-format on save (IDE integration recommended)

**Testing:**

Currently, automated tests are not configured. As the UI stabilizes, consider adding:

- **Unit Tests:** Vitest for component logic and utilities
- **Integration Tests:** Testing API interactions with mock server
- **E2E Tests:** Playwright for user workflows (login, device CRUD, etc.)

Example test setup:
```bash
# When ready to add tests
pnpm add -D vitest @testing-library/react @testing-library/user-event
pnpm add -D @playwright/test
```

## 📦 Building & Deployment

**Local Production Build:**

```bash
# Build with production environment
pnpm build

# Output: dist/ directory with optimized assets
# - JavaScript minified and code-split
# - CSS extracted and minified
# - Images optimized
# - Source maps generated (for debugging)

# Test production build locally
pnpm preview -- --host 0.0.0.0 --port 4173
```

**Deployment via Monorepo Script:**

```bash
# From monorepo root
pnpm sd

# When prompted, select smartops-web
# The script will:
# 1. Install dependencies
# 2. Run TypeScript checks
# 3. Build production bundle
# 4. Deploy to /var/www/asafarim-dot-be/showcases/smartops-web
# 5. Reload nginx configuration
```

**Production Deployment Checklist:**

- [ ] Environment variables set in `.env.production`
- [ ] Backend API is accessible at configured URL
- [ ] Identity.Api is accessible and configured
- [ ] Database migrations are up-to-date
- [ ] CORS headers configured on backend
- [ ] SSL certificates valid and configured
- [ ] Nginx proxy rules configured correctly
- [ ] Health checks passing on deployed instance

## 🛠️ Troubleshooting

| Issue | Resolution |
|-------|-----------|
| **401 Unauthorized / Session Expired** | Clear browser cookies, log out and back in, verify `atk` cookie exists in DevTools |
| **CORS Error in Console** | Verify backend CORS policy includes frontend origin, check nginx proxy headers |
| **Auth Redirect Loop** | Verify Identity.Api URL in `.env`, check that cookies are being sent, clear browser cache |
| **API Network Errors (5xx)** | Verify SmartOps.Api is running on `localhost:5105`, check Vite proxy in `vite.config.ts` |
| **Blank Dashboard / No Data** | Check browser console for errors, verify user has `Member` role or higher, check API response in Network tab |
| **Module Not Found Error** | Run `pnpm install` from monorepo root, restart dev server, check for missing dependencies |
| **Slow Build Times** | Clear `.vite` cache: `rm -rf .vite`, rebuild: `pnpm build` |
| **Port Already in Use** | Change port in `vite.config.ts` or kill process: `lsof -i :5178` |

**Debug Mode:**

Enable debug logging for development:

```bash
# Set in .env.local
VITE_DEBUG_MODE=true
```

Then in code:
```typescript
if (import.meta.env.VITE_DEBUG_MODE) {
  console.log('Debug info:', data);
}
```

## 📚 Additional Resources

- **[SmartOperationsDashboard README](../README.md)** - Backend setup, API endpoints, database schema, deployment
- **[Backend API Docs](http://localhost:5105/swagger)** - Interactive Swagger UI (development only)
- **[Identity.Api Documentation](../../../apis/Identity.Api/README.md)** - SSO integration and JWT configuration
- **[Shared UI Components](../../../packages/shared-ui-react/README.md)** - Component library documentation
- **[Design Tokens](../../../packages/design-tokens/README.md)** - Color, typography, spacing reference
- **[Internationalization](../../../packages/shared-i18n/README.md)** - i18n setup and locale management

## 🤝 Contributing

When contributing to SmartOps Web:

1. **Code Style:** Follow ESLint rules (`pnpm lint`)
2. **Type Safety:** No `any` types, use strict TypeScript
3. **Components:** Keep components small and focused
4. **State:** Use Zustand stores for shared state
5. **API Calls:** Use service layer (deviceService, etc.)
6. **Testing:** Add tests for new features
7. **Documentation:** Update README if adding features
8. **Commits:** Use conventional commit messages

## 📞 Support

For issues or questions:

- Check [Troubleshooting](#-troubleshooting) section above
- Review [SmartOperationsDashboard README](../README.md) for system-wide issues
- Check [Identity.Api README](../../../apis/Identity.Api/README.md) for auth issues
- Consult monorepo documentation for workspace setup issues
