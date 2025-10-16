# CORS Error Fix - Authentication Flickering Root Cause

## The REAL Problem

The flickering wasn't just about duplicate auth checks - it was caused by **WRONG API ENDPOINTS** causing CORS errors!

### Evidence from Console Logs

```
✅ WORKS: https://identity.asafarim.be/auth/me (ProtectedRoute)
❌ FAILS: https://identity.asafarim.be/api/identity/auth/me (ResumeList via local useAuth)

Error: Access to fetch at 'https://identity.asafarim.be/auth/me' from origin 
'https://asafarim.be' has been blocked by CORS policy
```

### Root Cause

**File**: `/apps/web/src/hooks/useAuth.ts`

The web app's local `useAuth` hook was configured with INCORRECT API base URLs:

```typescript
// ❌ BEFORE (WRONG):
authApiBase: 'https://identity.asafarim.be/api/identity'
meEndpoint: '/auth/me'
// Results in: https://identity.asafarim.be/api/identity/auth/me ← CORS ERROR!

// ✅ AFTER (CORRECT):
authApiBase: 'https://identity.asafarim.be/auth'
meEndpoint: '/me'
// Results in: https://identity.asafarim.be/auth/me ← WORKS!
```

### Why This Happened

The Identity API's authentication endpoints are at:
- `/auth/me`
- `/auth/token`
- `/auth/logout`
- `/auth/refresh`

NOT at `/api/identity/auth/*`

The nginx routing for Identity API is:
```nginx
location /auth/ {
    proxy_pass http://identity_api/auth/;
    # CORS headers configured here
}
```

When the web app tried to call `/api/identity/auth/me`, it bypassed the CORS-configured nginx location block!

## The Fix

### Changed Files

1. **`/apps/web/src/hooks/useAuth.ts`**
   - Production: `authApiBase: 'https://identity.asafarim.be/auth'`
   - Dev: `authApiBase: 'http://identity.asafarim.local:5177/auth'`
   - Updated endpoints to `/me`, `/token`, `/logout` (removed `/auth` prefix)

### Why Multiple useAuth Instances

The web app has its own `useAuth` wrapper that:
1. Imports the shared `useAuth` from `@asafarim/shared-ui-react`
2. Passes environment-specific configuration
3. Returns the configured hook

Components can import from either:
- `@asafarim/shared-ui-react` (uses default config)
- `../hooks/useAuth` (uses web app's custom config)

Both were being used, causing conflicting API calls!

## Testing After Fix

1. **Build**: `pnpm run build:web`
2. **Deploy**: `pnpm run sd` → select web
3. **Test**: Navigate to `/admin/entities/resumes` while logged in
4. **Verify Console**:
   - ✅ All auth calls go to `https://identity.asafarim.be/auth/*`
   - ✅ No CORS errors
   - ✅ No flickering
   - ✅ Page loads immediately

## Additional Notes

### CORS Configuration

The Identity API nginx config has CORS headers for `/auth/*`:

```nginx
location /auth/ {
    add_header 'Access-Control-Allow-Origin' 'https://asafarim.be' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
}
```

This is why `/auth/me` works but `/api/identity/auth/me` fails!

### Lesson Learned

When debugging authentication issues:
1. Check console for CORS errors (not just auth failures)
2. Verify the EXACT URLs being called
3. Ensure URLs match nginx location blocks
4. Check for multiple auth hook instances with different configs
