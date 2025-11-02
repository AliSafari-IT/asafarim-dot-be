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

This repository hosts a **polyrepo-style monorepo** that powers the entire ASafariM ecosystem. It includes:

- **6 Frontend Applications**: Web portal, blog, AI interface, job listings, identity management, and core app
- **3 Backend APIs**: AI services, core domain logic, and identity management
- **2 Shared Packages**: Reusable React components and design tokens
- **Advanced Features**: Resume publishing, portfolio management, authentication, and content validation

**Key Principles:**

- 🔒 **Type Safety**: Full TypeScript coverage across all applications
- 🎨 **Design System**: Consistent UI/UX with shared components and tokens
- 🔐 **Security First**: GDPR-compliant data handling and role-based access control
- 🚀 **Developer Experience**: PnPM workspaces for efficient dependency management

## 🏗️ Architecture

### **Monorepo Structure**

```
asafarim-dot-be/
├── apps/                    # Frontend applications
│   ├── web/                # Main portfolio & publications site
│   ├── blog/               # Docusaurus-based blog
│   ├── core-app/           # Core user experiences
│   ├── ai-ui/              # AI interface application
│   ├── jobs-ui/            # Job listings management
│   └── identity-portal/    # Authentication & user management
├── apis/                   # Backend services
│   ├── Core.Api/           # Main business logic API
│   ├── Identity.Api/       # Authentication & authorization
│   └── Ai.Api/             # AI-related endpoints
└── packages/               # Shared libraries
    ├── shared-ui-react/    # React components & utilities
    ├── react-themes/       # React themes
    └── shared-tokens/      # Design system tokens
```

### **Data Flow**

```
Frontend Apps → APIs → Database
     ↓           ↓       ↓
   React UI  → .NET APIs → PostgreSQL
     ↓           ↓       ↓
   Shared UI ← Tokens ← Consistent UX
```

## 📁 Repository Structure

### **Frontend Applications**

| Application | Purpose | Tech Stack | Port |
|-------------|---------|------------|------|
| **web** | Portfolio & publications | React + TypeScript + Vite | 5175 |
| **blog** | Technical blog | Docusaurus + TypeScript | 3000 |
| **core-app** | Core user experiences | React + TypeScript | 5174 |
| **ai-ui** | AI interface | React + TypeScript | 5173 |
| **jobs-ui** | Job listings | React/Angular + TypeScript | 4200 |
| **identity-portal** | Auth & user management | React/Angular + TypeScript | 5177 |

### **Backend APIs**

| API | Purpose | Tech Stack | Port |
|-----|---------|------------|------|
| **Core.Api** | Business logic & data | .NET 8 + Entity Framework | 5102 |
| **Identity.Api** | Authentication & users | .NET 8 + ASP.NET Identity | 5101 |
| **Ai.Api** | AI services | .NET 8 + ML.NET | 5103 |

### **Shared Packages**

| Package | Purpose | Version |
|---------|---------|---------|
| **shared-ui-react** | Reusable React components | v0.6.0 |
| **react-themes** | React themes | v1.0.0 |
| **shared-tokens** | Design system tokens | v1.0.0 |

## 🛠️ Technology Stack

### **Frontend**

- **React 19.1.1** - UI framework (consistent across all apps)
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling (via shared tokens)

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

### **Resume Publishing System** (October 2025)

- **Public Resume Sharing**: GDPR-compliant resume sharing with slug-based URLs
- **Privacy Controls**: Public/private toggle with consent tracking and IP logging
- **Secure Slug Generation**: Automated slug generation with collision detection and sanitization
- **Public DTOs**: Privacy-focused data transfer objects excluding sensitive information

### **Enhanced Portfolio Management** (September-October 2025)

- **Content Type Validation**: Fixed routing issues with invalid content types (e.g., `/portfolio/invalid/view/10`)
- **Improved Tag Management**: Enhanced tag input with visual feedback, accumulation, and duplicate prevention
- **Toast Notifications**: Integrated toast notifications for better user feedback
- **Better Form Handling**: Improved form validation and error handling across all portfolio forms

### **Work Experience & Technologies** (September 2025)

- **Technology Tracking**: Added technology field to work experience entities
- **Extended Database Schema**: Updated resume models to include technology relationships
- **Achievement Management**: Enhanced work experience with achievement lists and technology stacks

### **Authentication & Security** (September 2025)

- **Extended Token Duration**: Increased access token lifetime to 4 hours for better UX
- **Enhanced Logging**: Improved audit logging for publication and resume operations
- **Role-Based Access**: Admin controls for cross-user publication management

### **UI/UX Improvements** (September-October 2025)

- **Heading Component**: New flexible Heading component with multiple variants and styling options
- **Icon Enhancements**: Improved SVG icons with better accessibility and hover states
- **Responsive Design**: Enhanced responsive behavior across all components
- **Dark Mode Support**: Consistent dark mode implementation across all new components

---

**Built with ❤️ by ASafariM** | **License: CC BY 4.0** | **GitHub**: [alisafari-it/asafarim-dot-be](https://github.com/alisafari-it/asafarim-dot-be)
