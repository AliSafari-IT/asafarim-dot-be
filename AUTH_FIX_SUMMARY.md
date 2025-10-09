# 🔐 Authentication Fix Summary

## Problem Identified

Your authentication was failing because:

1. **Port Mismatch**: Frontend tried to call `http://api.asafarim.local:5101/auth/me`
2. **Missing Endpoints**: Identity.Api (5101) has auth endpoints, but Core.Api (5102) didn't
3. **No Unified Gateway**: Each API ran on different ports without a unified entry point

## Solution Implemented

### ✅ Unified API Gateway Pattern

Created a **proxy layer in Core.Api** that forwards authentication requests to Identity.Api while keeping a single API endpoint for frontends.

### Changes Made

#### 1. **Core.Api (Port 5102)** - Added Auth Proxy Endpoints
- **File**: `apis/Core.Api/Program.cs`
- **Added Endpoints**:
  - `GET /auth/me` - Proxies to Identity.Api
  - `GET /auth/token` - Returns token from cookies
  - `POST /auth/logout` - Proxies logout and clears cookies
  - `POST /auth/refresh` - Proxies token refresh
- **Configuration**: `apis/Core.Api/appsettings.Development.json`
  - Added `"IdentityApiUrl": "http://localhost:5101"`

#### 2. **Frontend Configuration Updates**
- **identity-portal**: `apps/identity-portal/src/config/auth.ts`
  - Changed: `authApiBase: 'http://api.asafarim.local:5102'` (was 5101)
- **shared-ui-react**: `packages/shared-ui-react/hooks/useAuth.ts`
  - Changed default: `'http://api.asafarim.local:5102'` (was 5101)
- **web app**: `apps/web/.env.development`
  - Changed: `VITE_IDENTITY_API_URL=http://api.asafarim.local:5102`

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend Apps (web, identity-portal, ai-ui, etc.)         │
│  All point to: http://api.asafarim.local:5102              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Core.Api (Port 5102) - Unified API Gateway                │
│  ├─ Business logic endpoints (jobs, timeline, resume, etc.)│
│  └─ Auth proxy endpoints:                                   │
│     ├─ /auth/me     ──────┐                                │
│     ├─ /auth/token  ──────┤                                │
│     ├─ /auth/logout ──────┼─> Forwards to Identity.Api     │
│     └─ /auth/refresh ─────┘                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Identity.Api (Port 5101) - Authentication Service         │
│  ├─ POST /auth/login                                        │
│  ├─ POST /auth/register                                     │
│  ├─ GET  /auth/me                                           │
│  ├─ GET  /auth/token                                        │
│  ├─ POST /auth/logout                                       │
│  └─ POST /auth/refresh                                      │
└─────────────────────────────────────────────────────────────┘
```

## Testing Steps

### 1. Restart Both APIs
```bash
# Terminal 1 - Identity.Api
cd apis/Identity.Api
dotnet run

# Terminal 2 - Core.Api
cd apis/Core.Api
dotnet run
```

### 2. Rebuild Frontend Package
```bash
cd packages/shared-ui-react
pnpm install
pnpm build
```

### 3. Test Authentication Flow

#### A. Login at Identity Portal
1. Navigate to: `http://identity.asafarim.local:5177/login?returnUrl=http://web.asafarim.local:5175/`
2. Enter credentials and click "Sign In"
3. Should redirect to web app

#### B. Verify in Browser DevTools

**Network Tab:**
- Look for request to: `http://api.asafarim.local:5102/auth/me`
- Status should be: **200 OK** (not 401)
- Response should contain user info

**Application Tab > Cookies:**
- Domain: `.asafarim.local`
- Cookies present: `atk` (access token), `rtk` (refresh token)
- `HttpOnly`: true
- `SameSite`: Lax

**Console:**
- Should see: `✅ AUTHENTICATED` (not `❌ NOT AUTHENTICATED`)
- Should see: `Auth check response status: 200`

### 4. Test Cross-App Cookie Sharing
1. Login at identity-portal
2. Navigate to web app → Should stay logged in
3. Navigate to ai-ui → Should stay logged in
4. Logout from any app → Should log out from all

## Debugging Checklist

If authentication still fails:

- [ ] Verify `api.asafarim.local` is in your hosts file (`C:\Windows\System32\drivers\etc\hosts`)
- [ ] Check both APIs are running (5101 and 5102)
- [ ] Clear all cookies for `.asafarim.local` domain
- [ ] Clear browser cache and localStorage
- [ ] Verify cookie `SameSite` is set to `Lax` (not `None` for local dev)
- [ ] Check CORS is configured for your frontend origins
- [ ] Verify `AuthJwt:CookieDomain` is `.asafarim.local` in both APIs

## Key Configuration Files

### Backend
- `apis/Identity.Api/appsettings.Development.json` - AuthJwt config
- `apis/Core.Api/appsettings.Development.json` - AuthJwt + IdentityApiUrl
- `apis/Core.Api/Program.cs` - Auth proxy endpoints

### Frontend
- `packages/shared-ui-react/hooks/useAuth.ts` - Default auth base URL
- `apps/identity-portal/src/config/auth.ts` - Identity portal auth config
- `apps/web/.env.development` - Web app environment variables

## Additional Notes

### Why Port 5102 Instead of 5101?

Using Core.Api (5102) as the unified gateway provides:
1. **Single Entry Point**: All frontend apps use one API base URL
2. **Better Separation**: Authentication service is separate but accessible
3. **Scalability**: Easy to add more proxied services
4. **Production Ready**: Can easily switch to reverse proxy (Nginx) later

### Cookie Configuration

- **Domain**: `.asafarim.local` (with leading dot for subdomain sharing)
- **HttpOnly**: `true` (prevents JavaScript access for security)
- **Secure**: `false` in dev (local HTTP), `true` in prod (HTTPS)
- **SameSite**: `Lax` in dev, `None` in prod with HTTPS
- **Path**: `/` (accessible across all paths)

## Next Steps

1. ✅ Restart both APIs
2. ✅ Rebuild shared-ui-react package
3. ✅ Test login flow
4. ✅ Verify cookies in DevTools
5. ✅ Test cross-app authentication
