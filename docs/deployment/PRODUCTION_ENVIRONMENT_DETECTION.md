# Production Environment Detection & URL Resolution

## Overview

This document explains how the application detects production vs development environments and resolves URLs accordingly. This is critical for ensuring that navigation between apps uses the correct URLs based on the deployment environment.

## Architecture

### Key Components

1. **`getIsProduction()`** - Runtime environment detection function
2. **App Registry** - Central registry of all application URLs
3. **CentralNavbar** - Shared navigation component that uses the registry

---

## Production Detection Logic

### Location

`/var/repos/asafarim-dot-be/packages/shared-ui-react/configs/isProduction.ts`

### TypeScript Compatibility

The file includes a `declare const process: any;` declaration to ensure TypeScript compatibility across all apps, even those without `@types/node` installed. This allows the function to access `process.env.NODE_ENV` during builds without requiring all consuming apps to install Node.js type definitions.

### How It Works

The `getIsProduction()` function uses a **dual-mode detection strategy**:

#### 1. Build-Time Detection (SSR/Static Generation)

When `window` is undefined (during build/SSR):

```typescript
if (typeof window === 'undefined') {
  return process.env.NODE_ENV === 'production';
}
```

**Why?** During static site generation (like Docusaurus builds), there's no browser environment. We use `NODE_ENV` to determine which URLs to bake into the bundle.

#### 2. Runtime Detection (Browser)

When running in the browser:

```typescript
const hostname = window.location.hostname;
const protocol = window.location.protocol;

const isProductionDomain = 
  hostname.includes('asafarim.be') ||
  hostname.includes('asafarim.com') ||
  // ... other production domains

const isHttps = protocol === 'https:';

return isProductionDomain || isHttps;
```

**Why?** Provides runtime flexibility and works even if the build was done with wrong NODE_ENV.

---

## App Registry & URL Resolution

### Location

`/var/repos/asafarim-dot-be/packages/shared-ui-react/components/Navbar/appRegistry.ts`

### Structure

```typescript
// URL configuration for each app
const appUrlConfig = {
  web: {
    production: 'https://asafarim.be',
    development: 'http://web.asafarim.local:5175'
  },
  blog: {
    production: 'https://blog.asafarim.be',
    development: 'http://blog.asafarim.local:3000'
  },
  // ... other apps
};

// Helper function to get URL at runtime
const getAppUrl = (appId: keyof typeof appUrlConfig): string => {
  const config = appUrlConfig[appId];
  return getIsProduction() ? config.production : config.development;
};
```

### Registry Accessor

The registry uses a **function approach** to ensure URLs are always resolved at runtime:

```typescript
export const getAppRegistry = (): AppInfo[] => [
  {
    id: 'blog',
    name: 'Blog',
    url: getAppUrl('blog'),  // ✅ Evaluated when called
    description: 'Documentation and blog'
  },
  // ... other apps
];
```

---

## Building for Production

### Critical Requirement

**Always set `NODE_ENV=production` when building for production deployment.**

### Build Commands

#### Blog App (Docusaurus)

```bash
# package.json
{
  "scripts": {
    "build": "NODE_ENV=production docusaurus build"
  }
}
```

**Why it matters:** Docusaurus performs static site generation. Without `NODE_ENV=production`, it will bake **development URLs** into the bundle.

#### Vite Apps (Web, Core, AI, Identity)

```bash
# Vite automatically sets NODE_ENV=production during build
pnpm build  # or: vite build
```

**How to verify:**

```bash
# Check built bundle for dev URLs (should return 0)
grep -r "blog.asafarim.local" dist/assets/*.js | wc -l

# Check for production URLs (should find some)
grep -r "blog.asafarim.be" dist/assets/*.js | wc -l
```

---

## Common Issues & Solutions

### Issue 1: Blog Icon Shows Dev URL in Production

**Symptom:** Clicking blog icon in production navbar redirects to `http://blog.asafarim.local:3000/`

**Root Cause:** Blog was built without `NODE_ENV=production`, so dev URLs were baked into bundle.

**Solution:**
```bash
cd apps/blog
NODE_ENV=production pnpm build
sudo rsync -av --delete build/ /var/www/asafarim-dot-be/apps/blog/
```

### Issue 2: Development Shows Production URLs

**Symptom:** Local dev environment uses production HTTPS URLs

**Root Cause:** App was built with `NODE_ENV=production` but running locally.

**Solution:**
```bash
# Rebuild without NODE_ENV or with NODE_ENV=development
cd apps/[app-name]
pnpm build
```

---

## Deployment Workflow

### 1. Build All Apps for Production

```bash
# From repository root
cd /var/repos/asafarim-dot-be

# Rebuild shared package
cd packages/shared-ui-react
rm -rf dist
pnpm build
cd ../..

# Build all apps
NODE_ENV=production pnpm build
```

### 2. Deploy Using Selective Deploy Script

```bash
sudo bash /var/repos/asafarim-dot-be/scripts/selective-deploy.sh
```

The script will:
1. Clean node_modules for selected apps
2. Install dependencies
3. Build shared packages
4. Build selected apps **with proper NODE_ENV**
5. Deploy to `/var/www/asafarim-dot-be/`
6. Restart services
7. Reload Nginx

---

## Testing Production URLs

### Before Deployment

Check build output logs for production detection:

```bash
# During blog build, you should see:
🔐 shared-ui-react/hooks/useAuth.ts: isProd? true
🔐 Identity API Base: https://identity.asafarim.be/api/identity
```

### After Deployment

1. Visit production site: `https://blog.asafarim.be/`
2. Open browser console
3. Check debug output:
   ```javascript
   App Registry Debug: {
     "isProduction": true,
     "currentHostname": "blog.asafarim.be",
     "currentAppId": "blog",
     "blogApp": {
       "url": "https://blog.asafarim.be"
     }
   }
   ```
4. Click app switcher icons to verify correct URLs

---

## Environment Variables

### NODE_ENV

- **Purpose:** Tells build tools whether to optimize for production
- **Values:** `production`, `development`, `test`
- **Used by:** 
  - Vite (automatically set during `vite build`)
  - Docusaurus (must be set manually)
  - Our `getIsProduction()` function

### Setting NODE_ENV

```bash
# Linux/macOS
NODE_ENV=production pnpm build

# Windows (PowerShell)
$env:NODE_ENV="production"; pnpm build

# Windows (CMD)
set NODE_ENV=production && pnpm build
```

---

## Best Practices

1. **Always verify NODE_ENV** before production builds
2. **Check build logs** for `isProd? true` messages
3. **Grep bundles** for dev URLs before deploying
4. **Use selective deploy script** - it handles NODE_ENV correctly
5. **Document environment-specific configs** in respective app READMEs

---

## Debug Commands

```bash
# Check if production URLs are in bundle
cd apps/blog/build
grep -r "https://blog.asafarim.be" assets/js/*.js | wc -l

# Check if dev URLs leaked into bundle (should be 0)
grep -r "blog.asafarim.local" assets/js/*.js | wc -l

# View deployed bundle
sudo find /var/www/asafarim-dot-be/apps/blog/assets/js -name "*.js" -exec grep -l "asafarim" {} \;
```

---

## Related Files

- `/packages/shared-ui-react/configs/isProduction.ts` - Production detection
- `/packages/shared-ui-react/components/Navbar/appRegistry.ts` - URL registry
- `/packages/shared-ui-react/components/Navbar/CentralNavbar.tsx` - Navbar component
- `/apps/blog/package.json` - Blog build configuration
- `/scripts/selective-deploy.sh` - Deployment automation

---

## Troubleshooting Guide

### Verify Current Environment

```typescript
// In browser console on any app
console.log({
  hostname: window.location.hostname,
  protocol: window.location.protocol,
  isProduction: window.location.hostname.includes('asafarim.be')
});
```

### Force Rebuild Everything

```bash
cd /var/repos/asafarim-dot-be

# Clean everything
pnpm rm:nm
rm -rf packages/*/dist apps/*/dist apps/*/build

# Rebuild from scratch
pnpm i
cd packages/shared-ui-react && pnpm build && cd ../..
NODE_ENV=production pnpm build
```

---

## Maintenance Notes

### When Adding New Apps

1. Add URL config to `appUrlConfig` in `appRegistry.ts`
2. Add app entry to `getAppRegistry()`
3. Update this documentation
4. Update selective deploy script if needed

### When Changing Domain Names

1. Update `appUrlConfig` in `appRegistry.ts`
2. Update production domain checks in `isProduction.ts`
3. Rebuild all apps
4. Update Nginx configurations
5. Update DNS records

---

**Last Updated:** October 13, 2025  
**Author:** Development Team  
**Related Issues:** Blog icon URL resolution in production
