# Environment & URL Resolution - Quick Reference

> **Quick guide for developers working with production vs development environments**

## TL;DR

```bash
# ✅ Building for PRODUCTION deployment
NODE_ENV=production pnpm build

# ✅ Building for LOCAL development
pnpm build  # (or omit NODE_ENV)

# ❌ DON'T do this for production
pnpm build  # without NODE_ENV=production (for blog)
```

---

## Environment Detection

### How It Works

| Context | Detection Method | Result |
|---------|-----------------|--------|
| **Build Time** (no window) | `process.env.NODE_ENV` | `production` or `development` |
| **Runtime** (browser) | `window.location.hostname` + protocol | Based on domain |

### Production Indicators

- ✅ `hostname.includes('asafarim.be')`
- ✅ `hostname.includes('asafarim.com')`  
- ✅ `protocol === 'https:'`

### Development Indicators

- ✅ `hostname.includes('local')`
- ✅ `hostname.includes('localhost')`
- ✅ `port !== 443 && port !== 80`

---

## App URLs

| App | Development | Production |
|-----|------------|-----------|
| **Web** | `http://web.asafarim.local:5175` | `https://asafarim.be` |
| **Blog** | `http://blog.asafarim.local:3000` | `https://blog.asafarim.be` |
| **Core** | `http://core.asafarim.local:5174` | `https://core.asafarim.be` |
| **AI** | `http://ai.asafarim.local:5173` | `https://ai.asafarim.be` |
| **Identity** | `http://identity.asafarim.local:5177` | `https://identity.asafarim.be` |

---

## Common Commands

### Local Development

```bash
# Start dev server (uses development URLs)
pnpm start

# Build for local testing (development URLs)
pnpm build
```

### Production Build

```bash
# Blog (Docusaurus) - MUST set NODE_ENV
cd apps/blog
NODE_ENV=production pnpm build

# Vite apps - NODE_ENV automatically set
cd apps/web  # or core-app, ai-ui, identity-portal
pnpm build  # NODE_ENV is set to 'production' by Vite
```

### Deploy to Production

```bash
# Use selective deploy script
sudo bash /var/repos/asafarim-dot-be/scripts/selective-deploy.sh

# Or manual deploy
cd /var/repos/asafarim-dot-be
NODE_ENV=production pnpm build
sudo rsync -av --delete apps/[app]/build/ /var/www/asafarim-dot-be/apps/[app]/
```

---

## Verification Checklist

### Before Deploying

- [ ] Built with `NODE_ENV=production`
- [ ] Check build logs show `isProd? true`
- [ ] No dev URLs in bundle: `grep -r "asafarim.local" dist/`
- [ ] Production URLs present: `grep -r "asafarim.be" dist/`

### After Deploying

- [ ] App loads on production domain
- [ ] App switcher shows all apps
- [ ] Clicking app icons navigates to production URLs (not `.local`)
- [ ] Browser console shows `isProduction: true`

---

## Troubleshooting

### Problem: App switcher shows dev URLs in production

**Cause:** Built without `NODE_ENV=production`

**Fix:**
```bash
NODE_ENV=production pnpm build
sudo rsync -av --delete build/ /var/www/asafarim-dot-be/apps/[app]/
```

### Problem: Local dev shows production URLs

**Cause:** Built with `NODE_ENV=production` but running locally

**Fix:**
```bash
# Rebuild without NODE_ENV
pnpm build
# Or explicitly set to development
NODE_ENV=development pnpm build
```

### Problem: Some apps work, blog doesn't

**Cause:** Blog requires explicit `NODE_ENV`, Vite apps set it automatically

**Fix:**
```bash
# Update blog package.json
"build": "NODE_ENV=production docusaurus build"
```

---

## Debug Commands

```bash
# Check environment in browser console
console.log({
  hostname: window.location.hostname,
  isProduction: window.location.hostname.includes('asafarim.be')
});

# Check bundle contents
cd apps/[app]/build  # or dist
grep -r "asafarim" assets/js/*.js

# Find dev URLs (should be 0 in prod builds)
grep -r "asafarim.local" assets/js/*.js | wc -l

# Find production URLs
grep -r "asafarim.be" assets/js/*.js | wc -l

# Check deployed files
sudo grep -r "asafarim.local" /var/www/asafarim-dot-be/apps/blog/assets/js/
```

---

## Key Files

```
packages/shared-ui-react/
  ├─ configs/
  │   └─ isProduction.ts          # Environment detection
  └─ components/Navbar/
      ├─ appRegistry.ts            # URL configuration
      └─ CentralNavbar.tsx         # App switcher component

apps/blog/
  └─ package.json                  # Build script with NODE_ENV

scripts/
  └─ selective-deploy.sh           # Deployment automation
```

---

## Development Workflow

```bash
# 1. Make changes to shared package
cd packages/shared-ui-react
pnpm build

# 2. Test in specific app
cd ../../apps/web
pnpm start  # Dev server

# 3. Build for production
NODE_ENV=production pnpm build

# 4. Verify build
grep -r "asafarim.local" dist/

# 5. Deploy
sudo bash /var/repos/asafarim-dot-be/scripts/selective-deploy.sh
```

---

## Environment Variables Reference

| Variable | Values | Used By | Purpose |
|----------|--------|---------|---------|
| `NODE_ENV` | `production`, `development`, `test` | Build tools, getIsProduction() | Determines build optimizations and URL selection |

---

## Best Practices

1. ✅ **Always** use `NODE_ENV=production` for production builds
2. ✅ **Verify** build output before deploying
3. ✅ **Test** app switcher after deployment
4. ✅ **Document** any new apps in the registry
5. ❌ **Never** commit builds to git
6. ❌ **Never** hardcode URLs in components

---

## Quick Links

- [Full Documentation](/docs/deployment/PRODUCTION_ENVIRONMENT_DETECTION.md)
- [Architecture Overview](/docs/architecture/MULTI_APP_URL_RESOLUTION.md)
- [Deployment Checklist](/docs/deployment/DEPLOYMENT_CHECKLIST.md)

---

**Last Updated:** October 13, 2025  
**Maintained By:** Development Team
