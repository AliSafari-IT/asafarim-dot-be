# Multi-App URL Resolution Architecture

## Overview

This document describes the architectural design of the multi-app URL resolution system that enables seamless navigation between different applications in the ASafariM ecosystem across development and production environments.

## Problem Statement

The ASafariM platform consists of multiple independent applications:
- **Web Portal** (`web.asafarim.be`)
- **Blog** (`blog.asafarim.be`)
- **Core App** (`core.asafarim.be`)
- **AI Tools** (`ai.asafarim.be`)
- **Identity Portal** (`identity.asafarim.be`)
- **Jobs Tracker** (`core.asafarim.be/jobs`)

Each app needs to:
1. Link to other apps correctly in both dev and production
2. Share a common navigation bar (app switcher)
3. Automatically detect the environment and use appropriate URLs
4. Work during static site generation (SSR/build time)

## Solution Architecture

### 1. Centralized App Registry

**Location:** `packages/shared-ui-react/components/Navbar/appRegistry.ts`

```
┌─────────────────────────────────────────┐
│         App Registry Module             │
├─────────────────────────────────────────┤
│                                         │
│  appUrlConfig                           │
│  ├─ web: {prod, dev}                   │
│  ├─ blog: {prod, dev}                  │
│  ├─ core: {prod, dev}                  │
│  ├─ ai: {prod, dev}                    │
│  └─ identity: {prod, dev}              │
│                                         │
│  getAppUrl(appId) ───────┐             │
│                           ▼             │
│                   getIsProduction()     │
│                           │             │
│                           ▼             │
│                   Select URL            │
│                                         │
│  getAppRegistry() ───────────────────┐ │
│                                       ▼ │
│                           [AppInfo[]]   │
└─────────────────────────────────────────┘
```

### 2. Environment Detection

**Location:** `packages/shared-ui-react/configs/isProduction.ts`

```
                getIsProduction()
                        │
                        ▼
        ┌───────────────────────────┐
        │   typeof window?          │
        └───────────┬───────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   undefined              defined (browser)
        │                       │
        ▼                       ▼
  Check NODE_ENV        Check hostname + protocol
        │                       │
        ▼                       ▼
production === 'true'    asafarim.be || https:
        │                       │
        └───────────┬───────────┘
                    ▼
            return boolean
```

### 3. Component Integration

```
┌──────────────────────────────────────────┐
│           React Components               │
├──────────────────────────────────────────┤
│                                          │
│  CentralNavbar                           │
│    │                                     │
│    ├─ showAppSwitcher                   │
│    │    │                                │
│    │    └─ getAppRegistry() ◄───────────┼─── Runtime call
│    │         │                           │
│    │         └─ Map to dropdown items    │
│    │                                     │
│    ├─ getCurrentAppId()                 │
│    │    └─ Detect current app           │
│    │                                     │
│    └─ renderLink()                       │
│         └─ Render <a href={app.url}>    │
│                                          │
└──────────────────────────────────────────┘
```

## Data Flow

### Build Time (Static Generation)

```
1. Build Command
   └─ NODE_ENV=production pnpm build
        │
        ▼
2. Bundle Process
   ├─ Import appRegistry
   │   └─ Calls getAppRegistry()
   │        └─ Calls getAppUrl() for each app
   │             └─ Calls getIsProduction()
   │                  └─ window undefined
   │                       └─ Returns NODE_ENV === 'production'
   │                            └─ Returns production URLs
   │
   └─ Bundle URLs are baked into assets
```

### Runtime (Browser)

```
1. User loads page
   └─ React renders CentralNavbar
        │
        ▼
2. App Switcher renders
   ├─ Calls getAppRegistry()
   │   └─ Calls getAppUrl() for each app
   │        └─ Calls getIsProduction()
   │             └─ window.location.hostname available
   │                  └─ Returns isProductionDomain || isHttps
   │                       └─ Returns production/dev URLs
   │
   └─ Dropdown shows links with correct URLs
        │
        ▼
3. User clicks app link
   └─ Browser navigates to URL
```

## Key Design Decisions

### 1. Dual-Mode Detection (Build + Runtime)

**Why?**
- Build tools need to tree-shake and optimize code
- Static sites need to bake URLs into HTML/JS
- Runtime detection provides flexibility for edge cases

**Trade-off:**
- More complex logic
- Must remember to set NODE_ENV

**Alternative considered:**
- Runtime-only detection (would break static builds)
- Config files (less flexible, requires rebuilds for changes)

### 2. Centralized Registry

**Why?**
- Single source of truth for all app URLs
- Easy to add/remove apps
- Consistent URL resolution across all apps

**Trade-off:**
- All apps depend on shared package
- Changes require rebuild of all apps

**Alternative considered:**
- Each app has its own config (duplicated logic)
- Environment variables (hard to manage 10+ URLs)

### 3. Function-Based Registry (Not Static Array)

**Why?**
- Ensures URLs are evaluated when accessed, not when imported
- Prevents stale URLs from being cached

**Previous approach (problematic):**
```typescript
// ❌ Evaluated once at module load
export const appRegistry = [
  { id: 'blog', url: getIsProduction() ? 'https://...' : 'http://...' }
];
```

**Current approach:**
```typescript
// ✅ Evaluated every time it's called
export const getAppRegistry = () => [
  { id: 'blog', url: getAppUrl('blog') }
];
```

### 4. Hostname + HTTPS Detection

**Why?**
- Works even if NODE_ENV is wrong
- Handles custom domains
- HTTPS indicates production in most cases

**Edge cases handled:**
- `localhost` → Always development
- `*.local` → Always development
- `asafarim.be` → Always production
- `https:` → Production (unless .local)

## Security Considerations

### 1. No Hardcoded Credentials

URLs are public information, safe to bundle.

### 2. Protocol Enforcement

HTTPS detection ensures secure connections in production.

### 3. Domain Validation

Development domains (`.local`) are explicitly checked to prevent accidental production connections.

## Performance Considerations

### 1. Minimal Runtime Overhead

- `getIsProduction()` is called per app URL (~6 apps)
- Hostname check is a simple string operation
- No network requests

### 2. Build-Time Optimization

- Bundlers can optimize away unused branches
- Production builds have dev URLs removed (tree-shaken)

### 3. Caching Strategy

Currently no caching to ensure fresh URLs. If performance becomes an issue, could add:
```typescript
let _cachedRegistry: AppInfo[] | null = null;

export const getAppRegistry = () => {
  if (!_cachedRegistry && typeof window !== 'undefined') {
    _cachedRegistry = buildRegistry();
  }
  return _cachedRegistry || buildRegistry();
};
```

## Testing Strategy

### 1. Build Verification

```bash
# After building for production
grep -r "asafarim.local" dist/assets/*.js
# Should return 0 results
```

### 2. Runtime Verification

```javascript
// In browser console
console.log(getAppRegistry());
// Verify all URLs match current environment
```

### 3. Cross-Environment Testing

- Test dev build locally
- Test prod build on staging
- Test prod build in production
- Verify app switcher in each environment

## Maintenance

### Adding New Apps

1. Update `appUrlConfig`:
   ```typescript
   newapp: {
     production: 'https://newapp.asafarim.be',
     development: 'http://newapp.asafarim.local:PORT'
   }
   ```

2. Add to `getAppRegistry()`:
   ```typescript
   {
     id: 'newapp',
     name: 'New App',
     url: getAppUrl('newapp'),
     description: 'Description'
   }
   ```

3. Update `getCurrentAppId()`:
   ```typescript
   if (hostname === 'newapp.asafarim.be') return 'newapp';
   ```

### Changing Domains

1. Update production URLs in `appUrlConfig`
2. Update domain checks in `isProduction.ts`
3. Rebuild all apps
4. Update Nginx configs
5. Update DNS

## Related Documentation

- [Production Environment Detection](/docs/deployment/PRODUCTION_ENVIRONMENT_DETECTION.md)
- [SSO Architecture](/docs/architecture/SSO-ARCHITECTURE.md)
- [Deployment Checklist](/docs/deployment/DEPLOYMENT_CHECKLIST.md)

---

**Architecture Version:** 2.0  
**Last Updated:** October 13, 2025  
**Status:** Active
