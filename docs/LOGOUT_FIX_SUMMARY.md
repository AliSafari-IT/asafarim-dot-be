# Logout Fix Summary - ai.asafarim.be & core.asafarim.be

**Date**: 2025-10-17  
**Issue**: Logout works on asafarim.be and blog.asafarim.be but fails on ai.asafarim.be and core.asafarim.be

## Root Cause

### Working Subdomains (asafarim.be, blog.asafarim.be)
- Use `packages/shared-ui-react/hooks/useAuth.ts`
- Logout URL: `https://identity.asafarim.be/auth/logout` (direct)
- Result: ✅ Cookies cleared successfully

### Failing Subdomains (ai.asafarim.be, core.asafarim.be)
- Use custom `authSync.ts` implementations
- Logout URLs were routed through Nginx proxies:
  - **ai-ui**: `/api/identity/auth/logout` → proxied but had cookie domain issues
  - **core-app**: `/api/auth/logout` → **WRONG API** (routed to Core API port 5102 instead of Identity API port 5101)

## The Problem in Detail

### 1. ai.asafarim.be Issue
**File**: `apps/ai-ui/src/utils/authSync.ts`

**Before**:
```typescript
const IDENTITY_API_BASE = isProd
  ? '/api/identity'  // ❌ Nginx-proxied path
  : ...
```

**Problem**: 
- Nginx route `/api/identity/` → `http://127.0.0.1:5101/`
- Logout call: `/api/identity/auth/logout`
- While technically correct, using relative paths caused cookie clearing issues

### 2. core.asafarim.be Issue (CRITICAL)
**File**: `apps/core-app/src/config.ts`

**Before**:
```typescript
const prodConfig: Config = {
  apiBaseUrl: '/api/auth',
  authEndpoints: {
    logout: '/api/auth/logout',  // ❌ Routes to Core API, not Identity API!
  },
```

**Problem**:
- Nginx route `/api/auth/` → `http://127.0.0.1:5102/auth/` (Core API port 5102)
- **Core API does NOT have auth endpoints** - only Identity API (port 5101) does
- Result: 404 or wrong handler, cookies never cleared

## Nginx Routing Context

From `/etc/nginx/snippets/asafarim/api-routes.conf`:
```nginx
# Line 79-103: /api/auth/ → Core API (port 5102) ❌
location /api/auth/ {
  proxy_pass http://127.0.0.1:5102/auth/;
  ...
}

# Line 59-76: /api/identity/ → Identity API (port 5101) ✅
location /api/identity/ {
  proxy_pass http://127.0.0.1:5101/;
  ...
}
```

## Solution Implemented

### Fix 1: Navbar Components (CRITICAL - The Real Issue!)

Both `ai-ui` and `core-app` Navbar components were using `useAuth` hook with **wrong authApiBase** that routed to Core API instead of Identity API.

**ai-ui/src/components/Navbar.tsx** (line 50-51):
```typescript
// BEFORE: const authApiBase = isProduction ? '/api/auth' : ...;  // ❌ Routes to Core API!
// AFTER:
const authApiBase = isProduction ? 'https://identity.asafarim.be/auth' : 'http://identity.asafarim.local:5101/auth';
```

**core-app/src/components/Navbar.tsx** (line 85-86):
```typescript
// BEFORE: const authApiBase = isProduction ? '/api/auth' : ...;  // ❌ Routes to Core API!
// AFTER:
const authApiBase = isProduction ? 'https://identity.asafarim.be/auth' : 'http://identity.asafarim.local:5101/auth';
```

**Why this was critical**: The Navbar logout button uses `useAuth` hook, which was calling `/api/auth/logout`. Nginx routes this to Core API (port 5102) instead of Identity API (port 5101), so logout never happened.

### Fix 2: Re-Authentication Bug in useAuth Hook

**packages/shared-ui-react/hooks/useAuth.ts**:

The hook was re-authenticating users after logout because:
1. `logout_in_progress` flag was stored in `sessionStorage`
2. `window.location.replace()` redirect cleared sessionStorage
3. On page reload, flag was gone, so `checkAuth()` ran
4. Found `user_info` in localStorage (lines 244-254)
5. Called `/refresh` endpoint with `rtk` cookie
6. Got new access token and re-authenticated user!

**Solution**: Changed `logout_in_progress` flag from `sessionStorage` to `localStorage`:
```typescript
// Line 218 (checkAuth):
const logoutInProgress = localStorage.getItem('logout_in_progress') === 'true';

// Line 377 (signOut):
localStorage.setItem('logout_in_progress', 'true');
```

Now the flag persists across redirect and prevents re-authentication.

### Fix 3: ai-ui/src/utils/authSync.ts
```typescript
// Line 19-22
const IDENTITY_API_BASE = isProd
  ? 'https://identity.asafarim.be'  // ✅ Direct URL
  : (import.meta as { env: Record<string, string> }).env?.VITE_IDENTITY_API_URL || 'http://api.asafarim.local:5101';
```

**Benefits**:
- Bypasses Nginx proxy complexity
- Ensures cookies are set/cleared by authoritative Identity API
- Consistent with `shared-ui-react` approach

### Fix 2: core-app/src/config.ts
```typescript
// Line 35-45
const prodConfig: Config = {
  apiBaseUrl: 'https://identity.asafarim.be',
  authEndpoints: {
    me: 'https://identity.asafarim.be/auth/me',
    login: 'https://identity.asafarim.be/auth/login',
    register: 'https://identity.asafarim.be/auth/register',
    logout: 'https://identity.asafarim.be/auth/logout',  // ✅ Correct endpoint
  },
  isProduction: true
};
```

**Benefits**:
- Routes to correct API (Identity API port 5101)
- Direct URL ensures proper cookie handling
- Matches working implementation pattern

## Files Modified

1. `/var/repos/asafarim-dot-be/apps/ai-ui/src/utils/authSync.ts` (line 19-22)
2. `/var/repos/asafarim-dot-be/apps/ai-ui/src/components/Navbar.tsx` (line 50-51) **CRITICAL**
3. `/var/repos/asafarim-dot-be/apps/core-app/src/config.ts` (line 35-45)
4. `/var/repos/asafarim-dot-be/apps/core-app/src/components/Navbar.tsx` (line 85-86) **CRITICAL**
5. `/var/repos/asafarim-dot-be/packages/shared-ui-react/hooks/useAuth.ts` (line 218, 377) **RE-AUTH BUG FIX**

## Testing Instructions

### 1. Rebuild Frontend Apps
```bash
cd /var/repos/asafarim-dot-be

# Build ai-ui
cd apps/ai-ui
npm run build

# Build core-app
cd ../core-app
npm run build
```

### 2. Test Logout on ai.asafarim.be
1. Navigate to https://ai.asafarim.be
2. Login with credentials
3. Click logout
4. Verify:
   - Redirected to home/login page
   - No `atk` or `rtk` cookies in DevTools → Application → Cookies
   - Cannot access protected pages without re-login

### 3. Test Logout on core.asafarim.be
1. Navigate to https://core.asafarim.be
2. Login with credentials
3. Click logout
4. Verify same as above

### 4. Verify Cross-Domain Logout
1. Login on https://asafarim.be
2. Navigate to https://ai.asafarim.be (should be logged in)
3. Logout from ai.asafarim.be
4. Navigate to https://core.asafarim.be (should be logged out)
5. Navigate to https://asafarim.be (should be logged out)

## Backend Configuration (No Changes Needed)

All backend APIs already correctly configured:
- **Identity.Api** (`appsettings.Production.json`): `CookieDomain: ".asafarim.be"` ✅
- **Core.Api** (`appsettings.Production.json`): `CookieDomain: ".asafarim.be"` ✅
- **Ai.Api** (`appsettings.Production.json`): `CookieDomain: ".asafarim.be"` ✅

## Why This Works

1. **Direct API calls** bypass Nginx routing complexity
2. **Identity API** is the authoritative source for authentication
3. **Cookie domain `.asafarim.be`** is set correctly by Identity API
4. **CORS** is properly configured on Identity API to accept requests from all subdomains
5. **Consistent pattern** with working implementations (web, blog apps)

## Alternative Considered (Not Implemented)

We could have fixed the Nginx routing by changing `/api/auth/` to route to Identity API instead of Core API, but this would:
- Require Nginx config changes and reload
- Create potential conflicts with existing Core API routes
- Add unnecessary complexity
- Not solve the cookie domain issues in ai-ui

Direct URLs are simpler and more reliable.

## Related Files

- Backend: `/var/repos/asafarim-dot-be/apis/Identity.Api/Controllers/AuthController.cs`
- Shared hook: `/var/repos/asafarim-dot-be/packages/shared-ui-react/hooks/useAuth.ts`
- Nginx config: `/etc/nginx/snippets/asafarim/api-routes.conf`

## Status

✅ **FIXED** - Ready for testing and deployment
