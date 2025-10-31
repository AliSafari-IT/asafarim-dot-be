# SmartOps Web

SmartOps Web is the React front-end for the Smart Operations Dashboard. It provides real-time visibility into device telemetry, role-aware administration, and a cohesive user experience that integrates with the ASafariM Identity platform for single sign-on.

## 🌐 Overview

- **Stack:** React 18, TypeScript, Vite, Zustand, Recharts, shared ASafariM UI packages
- **Identity:** Authenticates through the Identity API using shared cookies (e.g. `atk`)
- **API:** Communicates with the SmartOps backend (`SmartOps.Api`) through REST endpoints proxied at `/api`
- **Internationalization:** Bootstrapped via `@asafarim/shared-i18n` before the app renders

## ✅ Prerequisites

- Node.js 20+ (aligned with Vite 7 requirements)
- pnpm (preferred) or npm
- Access to the SmartOps API and Identity API in the monorepo
- Recommended: Configure `smartops.asafarim.local` and `identity.asafarim.local` in `/etc/hosts` for local HTTPS parity

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template if needed
cp .env.local .env        # optional overrides for developers

# 3. Start the dev server (uses smartops.asafarim.local:5178)
pnpm dev

# Alternate: start with explicit host/port flags defined in package.json
pnpm start
```

The dev server runs on `http://smartops.asafarim.local:5178`, proxies `/api` to the backend at `http://localhost:5105`, and proxies `/auth` to the Identity service for SSO flows.@showcases/SmartOperationsDashboard/smartops-web/package.json#6-12 @showcases/SmartOperationsDashboard/smartops-web/vite.config.ts#34-64

## 🔧 Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts Vite in dev mode on the default host/port. |
| `pnpm start` | Starts Vite with the host/port flags required for local domain testing. | 
| `pnpm build` | Runs TypeScript project references and creates a production build in `dist/`. |
| `pnpm preview` | Serves the production build locally. |
| `pnpm lint` | Executes ESLint across the project. |

Scripts are defined in `package.json` and assume pnpm workspaces with shared ASafariM packages.@showcases/SmartOperationsDashboard/smartops-web/package.json#6-39

## 🔐 Environment Configuration

The application expects Identity and API endpoints to be provided through Vite environment variables. Default values are supplied for both development and production:

```ini
# .env
VITE_IDENTITY_API_URL=http://identity.asafarim.local:5101
VITE_SMARTOPS_API_URL=http://localhost:5105/api
```

```ini
# .env.production
VITE_IDENTITY_API_URL=https://identity.asafarim.be
VITE_SMARTOPS_API_URL=https://smartops.asafarim.be/api
```

- `.env` is for local development and feeds the Vite dev server proxy.
- `.env.production` is used during `pnpm build` to emit production-ready URLs.
- `.env.local` (provided as a template) can be used for developer-specific overrides.

Configure additional entries such as analytics keys or feature flags as needed, following the `VITE_` prefix convention so Vite exposes them to the client.@showcases/SmartOperationsDashboard/smartops-web/.env#1-2 @showcases/SmartOperationsDashboard/smartops-web/.env.production#1-2

## 🗂️ Project Structure

```
smartops-web/
├── src/
│   ├── api/           # API base configuration
│   ├── components/    # Shared layout primitives (Navbar, etc.)
│   ├── hooks/         # Zustand stores and React hooks
│   ├── pages/         # Route-level screens (Dashboard, Devices, Admin)
│   ├── services/      # REST service wrappers (devices, readings)
│   ├── theme/         # Root theming provider
│   ├── App.tsx        # Layout + notification shell
│   └── main.tsx       # Entry point, routing, i18n init
├── public/            # Static assets
├── vite.config.ts     # Vite and proxy configuration
├── package.json       # Scripts and workspace dependencies
└── README.md          # This document
```

## 🧱 Application Architecture

### Routing

Routes are declared with `createBrowserRouter`. The root layout wraps nested pages, including the dashboard, device CRUD views, and admin user management, all rendered inside the shared layout container.@showcases/SmartOperationsDashboard/smartops-web/src/main.tsx#7-37

### Layout & UI

`App.tsx` composes shared layout primitives (`LayoutContainer`, `FooterContainer`, `Navbar`) from `@asafarim/shared-ui-react` and surfaces a pre-launch banner so stakeholders know the product is in progress.@showcases/SmartOperationsDashboard/smartops-web/src/App.tsx#1-29

### Internationalization

`initI18n()` from `@asafarim/shared-i18n` runs before rendering to preload locale resources defined in the shared i18n workspace.@showcases/SmartOperationsDashboard/smartops-web/src/main.tsx#1-17

### State Management

Device state, KPI summaries, and API errors are managed via Zustand. `useDevicesStore` orchestrates loading indicators, device CRUD, and summary fetches while delegating data access to the REST service layer.@showcases/SmartOperationsDashboard/smartops-web/src/hooks/useDevicesStore.ts#1-68

### Data & API Layer

`deviceService` centralizes REST calls to `/devices` and `/readings`, automatically including credentials so cookies from the Identity service are sent. It exposes helpers for summary metrics, device CRUD, and reading analytics that the dashboard consumes.@showcases/SmartOperationsDashboard/smartops-web/src/services/deviceService.ts#1-273

### Dashboard Experience

The dashboard page pulls device summaries, groups readings into chart-ready intervals, and renders trend and power charts via Recharts. It supports manual refresh, auto-refresh every 30s, contextual error states, and listens for admin seeding events to trigger data reloads.@showcases/SmartOperationsDashboard/smartops-web/src/pages/Dashboard/index.tsx#1-320

## 🔌 Backend Integration

- **SmartOps API:** All requests are routed through `VITE_SMARTOPS_API_URL` (defaults to `/api`) which Vite proxies to `http://localhost:5105` during development.@showcases/SmartOperationsDashboard/smartops-web/vite.config.ts#34-64
- **Identity API:** Authentication flows are proxied via `/auth` in development and point to `VITE_IDENTITY_API_URL` in production so that cookies and CORS policies align with nginx routing.@showcases/SmartOperationsDashboard/smartops-web/vite.config.ts#34-64 @showcases/SmartOperationsDashboard/smartops-web/.env.production#1-2

Ensure the backend (`SmartOps.Api`) is running locally before launching the web app. Refer to `/showcases/SmartOperationsDashboard/README.md` for full backend setup instructions.

## 🧪 Quality

- **Linting:** `pnpm lint` uses ESLint with modern React rules to enforce project conventions.@showcases/SmartOperationsDashboard/smartops-web/package.json#6-12
- **Type Safety:** TypeScript project references (`tsconfig.json` + `tsc -b`) run during `pnpm build` to catch type regressions before bundling.@showcases/SmartOperationsDashboard/smartops-web/package.json#6-12
- **Testing:** Automated tests are not yet configured. Consider adding Vitest or Playwright suites as the UI stabilizes.

## 📦 Building & Deployment

```bash
# Production build
pnpm build

# Serve build locally for QA
pnpm preview -- --host 0.0.0.0 --port 4173
```

Deployment is handled via the monorepo’s selective deployment script (`pnpm sd`), where SmartOps Web is registered under option `smartops-web`. The script outputs an artifact suitable for nginx to serve at `https://smartops.asafarim.be`.

## 🛠️ Troubleshooting

| Issue | Resolution |
| --- | --- |
| **401 / session expired** | Confirm you are logged into the Identity site and that the `atk` cookie exists. Reauthenticate if necessary. |
| **CORS or auth redirect loops** | Verify the Identity API URL matches your environment configuration and that nginx proxies include required headers as described in ops documentation. |
| **API network errors** | Check that `SmartOps.Api` is running on `localhost:5105` and that Vite’s proxy is active. |
| **Shared packages missing** | Run `pnpm install` from the monorepo root to hydrate workspaces before launching the app. |

## 📚 Additional Resources

- [SmartOperationsDashboard README](../README.md) – Backend, infrastructure, and deployment details
- [DEPLOYMENT_CONFIG.md](../DEPLOYMENT_CONFIG.md) – Infrastructure configuration reference
- `packages/shared-ui-react`, `packages/shared-i18n` – Shared toolkit leveraged by this app
