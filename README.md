# ASafariM Monorepo

> **A comprehensive full-stack ecosystem** featuring multiple frontend applications, backend APIs, and shared packages for consistent development experience.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Recent Developments](#recent-developments)

## 🎯 Overview

This repository hosts a **polyrepo-style monorepo** driven by the PnPM workspace declared in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml). It currently includes:

- **7 Frontend Applications**: Web portal, Docusaurus blog, Core App dashboard, AI UI, Identity Portal, Test Automation UI (Testora), and Jobs UI
- **5 Backend APIs & Services**: Core, Identity, AI, Test Automation, and the Node-based TestRunner service
- **Showcase Solutions**: TaskManagement and SmartOperations dashboards (each with API + web client)
- **6 Shared Packages**: UI kits, design tokens, internationalization, helpers, dropdown menus, and theme infrastructure
- **Advanced Features**: Resume publishing, portfolio management, centralized authentication, SSO, GitHub Actions integration, and automated testing

**Key Principles:**

- 🔒 **Type Safety**: Full TypeScript coverage across all applications
- 🎨 **Design System**: Consistent UI/UX with shared components and tokens
- 🔐 **Security First**: GDPR-compliant data handling and role-based access control
- 🚀 **Developer Experience**: PnPM workspaces for efficient dependency management

## 🏗️ Architecture

### **Monorepo Structure**

```text
asafarim-dot-be/
├── apps/                    # Frontend applications
│   ├── web/                # Main portfolio & publications site
│   ├── blog/               # Docusaurus-based blog
│   ├── core-app/           # Core user experiences / dashboard
│   ├── ai-ui/              # AI interface application
│   ├── identity-portal/    # Authentication & user management
│   ├── test-automation-ui/ # Testora E2E management console
│   ├── jobs-ui/            # Job listings experience
│   └── showcase clients    # (see showcases/)
├── apis/                   # Backend services
│   ├── Core.Api/           # Main business logic API
│   ├── Identity.Api/       # Authentication & authorization
│   ├── Ai.Api/             # AI-related endpoints
│   ├── TestAutomation.Api/ # Test orchestration & GitHub Actions bridge
│   └── TestRunner/         # Node/Express TestCafe runner (port 4000)
├── showcases/              # End-to-end verticals (SmartOps, TaskManagement)
└── packages/               # Shared libraries
    ├── shared-ui-react/    # React components & utilities
    ├── shared-tokens/      # Design system tokens
    ├── shared-i18n/        # i18next wrappers & language utilities
    ├── react-themes/       # Theme provider + toggles
    ├── helpers/            # Shared TypeScript helpers
    └── dd-menu/            # Dropdown menu primitives
```

### **Data Flow**

```text
Frontend Apps → APIs → Database
     ↓           ↓       ↓
   React UI  → .NET APIs → PostgreSQL
     ↓           ↓       ↓
Shared UI & Services (TestRunner, SignalR) ← Tokens ← Consistent UX
```

## 📁 Repository Structure

### **Frontend Applications**

| Application | Purpose | Tech Stack | Port |
|-------------|---------|------------|------|
| **web** | Portfolio & publications | React + TypeScript + Vite | 5175 |
| **blog** | Technical blog | Docusaurus + TypeScript | 3000 |
| **core-app** | Core experiences (resume, hero, dashboards) | React + TypeScript | 5174 |
| **ai-ui** | Conversational AI assistant | React + TypeScript | 5173 |
| **identity-portal** | Auth & user management UI | React + TypeScript | 5177 |
| **test-automation-ui** | Testora test runner console | React + TypeScript | 5172 |
| **jobs-ui** | Job listings portal | React + TypeScript (with Angular legacy support) | 4200 |

### **Backend APIs & Services**

| API | Purpose | Tech Stack | Port |
|-----|---------|------------|------|
| **Core.Api** | Business logic & data | .NET 8 + Entity Framework | 5102 |
| **Identity.Api** | Authentication & users | .NET 8 + ASP.NET Identity | 5101 |
| **Ai.Api** | AI services | .NET 8 + ML.NET | 5103 |
| **TestAutomation.Api** | Test orchestration, GitHub Actions integration | .NET 8 + SignalR | 5106 |
| **TestRunner** | TestCafe runner exposing REST + SignalR hooks | Node.js + Express + TestCafe | 4000 |

### **Showcase Solutions**

| Showcase | Components | Description |
|----------|------------|-------------|
| **TaskManagement** | `showcases/TaskManagement/TaskManagement.Api` + `showcases/TaskManagement/taskmanagement-web` | Collaborative project & task tracking with PostgreSQL backend, cookie-based auth, and role-driven permissions |
| **SmartOperationsDashboard** | `showcases/SmartOperationsDashboard/SmartOps.Api` + `.../smartops-web` | IoT-style device monitoring with SignalR live updates, audit logging, and responsive admin UI |

### **Shared Packages**

| Package | Purpose |
|---------|---------|
| **shared-ui-react** | React components (Navbar, Auth, Cards, Notifications, etc.) |
| **shared-tokens** | CSS variables & semantic design tokens |
| **shared-i18n** | i18next initialization, hooks, and language utilities |
| **react-themes** | Theme provider, toggle, and default palettes |
| **helpers** | Cross-app TypeScript helpers (env, datetime, layout) |
| **dd-menu** | Dropdown/Menu primitives usable across apps |

## 🛠️ Technology Stack

### **Frontend**

- **React 19.1.1** - UI framework (consistent across all apps)
- **TypeScript** - Type safety and developer experience
- **Vite** (or Docusaurus for blog) - Fast build tool and dev server
- **React Router** - Client-side routing
- **Shared Tokens & CSS Modules** - Design system enforced by `@asafarim/shared-tokens`; no Tailwind required

### **Backend**

- **.NET 8** - Cross-platform framework
- **Entity Framework Core** - ORM and data access
- **ASP.NET Core** - Web API framework
- **PostgreSQL** - Primary database

### **Development Tools**

- **PnPM** - Fast, disk-efficient package manager
- **Workspaces** - Monorepo dependency management
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality

## 🚀 Quick Start

### **Prerequisites**

- **Node.js 18+** - JavaScript runtime
- **.NET 8+** - Backend framework
- **PostgreSQL** - Database server
- **Git** - Version control

### **Initial Setup**

```bash
# 1. Clone the repository
git clone https://github.com/alisafari-it/asafarim-dot-be.git
cd asafarim-dot-be

# 2. Install all dependencies (pnpm workspaces)
pnpm install

# 3. Set up environment variables
# Copy .env.example files and configure your settings
cp apis/Core.Api/appsettings.Development.json.example apis/Core.Api/appsettings.Development.json
# Edit with your database connection strings and JWT secrets

# 4. Build shared packages first
pnpm run dev:shared

# 5. Start everything (recommended)
pnpm run app
```

### **Alternative: Start Individual Services**

```bash
# Frontend only
pnpm run dev

# APIs only
pnpm run api

# Specific app
pnpm run dev:web

# Specific API
pnpm run dev:coreapi
```

## 💻 Development

### **Development Commands**

| Command | Description | Services Started |
|---------|-------------|------------------|
| `pnpm app` | Full stack (clean install + build + run) | All apps + APIs |
| `pnpm dev` | All frontend apps | web, blog, core, ai, jobs, identity |
| `pnpm api` | All backend APIs | Core, Identity, AI APIs |
| `pnpm dev:web` | Web app only | Portfolio site (port 5175) |
| `pnpm dev:shared` | Build shared packages | UI components & tokens |

### **Port Management**

The setup includes intelligent port management:

```bash
# Kill conflicting processes before starting
pnpm run predev  # Kills all dev ports
pnpm run kill:web   # Kills web-specific ports

# Individual service killers
pnpm run kill:identity  # Ports 5101, 5177
pnpm run kill:core      # Ports 5102, 5174
pnpm run kill:ai        # Ports 5103, 5173
```

### **Workspace Features**

#### **PnPM Workspaces**

- **Selective Installation**: `pnpm --filter @asafarim/web install`
- **Scoped Scripts**: `pnpm --filter @asafarim/shared-ui-react build`
- **Dependency Hoisting**: Shared dependencies in root node_modules

#### **Development Workflow**

1. **Make changes** in your feature branch
2. **Test across apps** when modifying shared packages
3. **Run linting**: `pnpm run lint` (if configured)
4. **Commit with conventional messages**: `feat:`, `fix:`, `docs:`, etc.
5. **Push and create PR** with screenshots for UI changes

### **Environment Variables**

#### **Required Variables**

```bash
# Database connections
DATABASE_CONNECTION_STRING="Host=localhost;Port=5432;Database=asafarim;Username=postgres;Password=password"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_ISSUER="asafarim"
JWT_AUDIENCE="asafarim-users"

# API URLs (for frontend apps)
VITE_API_BASE_URL="http://localhost:5102"
VITE_IDENTITY_BASE_URL="http://localhost:5101"
```

## 🚢 Deployment

### **Build Commands**

```bash
# Build all applications
pnpm run app:build

# Build specific apps
pnpm run app:web:build
pnpm run app:blog:build

# Build all APIs
pnpm run api:build
```

### **Production Deployment**

```bash
# 1. Clean build
pnpm run app:build

# 2. Deploy with your strategy
# Docker, PM2, systemd, or your preferred method

# 3. Run database migrations
dotnet ef database update --project apis/Core.Api

# 4. Start services
pnpm run api  # Production APIs
# Serve built frontend apps via nginx/Caddy/Cloudflare
```

### **Environment Setup**

- **Development**: Use `appsettings.Development.json`
- **Production**: Use `appsettings.Production.json` with proper secrets
- **Docker**: Each service can be containerized independently

## 🤝 Contributing

### **Branch Strategy**

```
main ← feature/ ← your-branch
     ← release/ ← hotfix/
```

### **Code Standards**

- **TypeScript**: Strict mode enabled across all projects
- **React**: Functional components with hooks
- **Commits**: Follow [Conventional Commits](https://conventionalcommits.org/)
- **PRs**: Include screenshots for UI changes

### **Development Checklist**

- [ ] Code passes linting (`pnpm run lint`)
- [ ] Tests pass (`pnpm run test`)
- [ ] Shared packages tested across consuming apps
- [ ] Documentation updated
- [ ] Database migrations included (if applicable)

### **Pull Request Template**

```markdown
## Description
Brief description of changes

## Changes Made
- Feature 1: Description
- Feature 2: Description

## Screenshots
[Before/After screenshots for UI changes]

## Testing
- [ ] Manual testing completed
- [ ] Cross-app compatibility verified
- [ ] Database migrations tested
```

## 🔧 Troubleshooting

### **Common Issues**

#### **"Invalid hook call" Errors**

```bash
# Solution: Ensure React version consistency
pnpm list react  # Check versions across workspaces
pnpm update react@19.1.1  # Align all React versions
```

#### **Port Conflicts**

```bash
# Kill all development ports
pnpm run predev

# Or kill specific service ports
pnpm run kill:web
```

#### **Database Connection Issues**

```bash
# Check connection string format
# Ensure PostgreSQL is running
# Verify database exists and user has permissions
```

#### **Build Failures**

```bash
# Clean install and rebuild
pnpm run rm:nm  # Remove all node_modules
pnpm install    # Fresh install
pnpm run dev:shared  # Rebuild shared packages
```

### **Performance Optimization**

#### **Development Speed**

- Use `pnpm` instead of `npm` for faster installs
- Enable workspace protocol for local packages
- Use `pnpm run dev:shared` before starting apps

#### **Production Builds**

- Enable gzip compression in reverse proxy
- Use CDN for static assets
- Implement caching headers for API responses

## 📈 Recent Developments

### **Test Automation Platform (Q4 2025)**

- **TestAutomation.Api** now validates GitHub credentials, encrypts secrets, and triggers workflows with structured payloads
- **TestRunner Service** supports headless Chrome, resilient retries, and automatic cleanup of `temp-tests`
- **Test-Automation UI** consumes new settings/integration APIs with encryption-aware forms and error handling

### **Identity Portal Enhancements (Q4 2025)**

- Centralized `shared-i18n` usage with new translation namespaces (navbar, dashboard, admin area)
- Magic-link password setup emails via MailKit with HTML templates and Data Protection token storage
- Admin dashboards redesigned with CSS tokens, responsive cards, and improved Admin/User management flows

### **Shared UI & Tokens (Q4 2025)**

- `shared-ui-react` Navbar/AuthStatus updated to support userName-aware greetings and consistent theme toggles
- `shared-tokens` consumed across apps (no Tailwind); new CSS variables for accent, warning, and surface states
- Portfolio, Dashboard, and User Profile screens refactored to semantic CSS classes using tokens and responsive grids

### **Showcase Enhancements (TaskManagement & SmartOps)**

- TaskManagement backend migrated fully to PostgreSQL with JWT auth, global admin roles, and polished web client
- SmartOperationsDashboard delivers SignalR-powered live data, app switcher SSO, and theme-aware navbar

---

**Built with ❤️ by ASafariM** | **License: CC BY 4.0** | **GitHub**: [alisafari-it/asafarim-dot-be](https://github.com/alisafari-it/asafarim-dot-be)
