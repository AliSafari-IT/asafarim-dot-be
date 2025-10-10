# SSO Authentication Fix Summary

**Date**: 2025-10-10  
**Issues Fixed**:
1. ✅ Immediate logout after login
2. ✅ Cross-app logout not working (except blog app)

---

## Root Causes Identified

### Issue 1: Immediate Logout After Login
**Problem**: Users were getting logged out immediately after successful authentication.

**Root Cause**: The `/auth/refresh` endpoint had a **chicken-and-egg problem**:
- The endpoint required `[Authorize]` attribute checking `User.Identity?.IsAuthenticated`
- When the access token expired (15 minutes), the user was no longer authenticated
- The refresh attempt failed because it required valid authentication
- This caused immediate logout when the token expired

### Issue 2: Cross-App Logout Not Working
**Problem**: Logging out in one app didn't immediately reflect in other apps (they required page refresh).

**Root Cause**: **Missing AuthSyncProvider wrapper in Web and AI apps**:
- ✅ **Blog app** wrapped with `<AuthSyncProvider>` → listened to `auth-signout` events → worked correctly
- ❌ **Web app** missing `<AuthSyncProvider>` → didn't listen to events → required refresh
- ❌ **AI app** missing `<AuthSyncProvider>` → didn't listen to events → required refresh

The `useAuth` hook does listen to `auth-signout` events, but only when properly mounted within `AuthSyncProvider`.

---

## Fixes Implemented

### Fix 1: Removed Authentication Requirement from Refresh Endpoint
**File**: `/apis/Identity.Api/Controllers/AuthController.cs`

**Changes**:
- Removed the authentication check (`User.Identity?.IsAuthenticated`) from the `/auth/refresh` endpoint
- Now extracts user ID from the expired JWT token without validation
- Falls back to authenticated claims if token parsing fails
- Allows token refresh even when the access token has expired

**Key Code**:
```csharp
// Parse the JWT without validation to extract claims
var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
var token = handler.ReadJwtToken(expiredToken);
userId = token.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == ClaimTypes.NameIdentifier)?.Value;
```

### Fix 2: Added AuthSyncProvider to Web App
**File**: `/apps/web/src/main.tsx`

**Changes**:
```tsx
import { AuthSyncProvider } from "@asafarim/shared-ui-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthSyncProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthSyncProvider>
  </StrictMode>
);
```

### Fix 3: Added AuthSyncProvider to AI App
**File**: `/apps/ai-ui/src/main.tsx`

**Changes**:
```tsx
import { AuthSyncProvider } from "@asafarim/shared-ui-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthSyncProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthSyncProvider>
  </React.StrictMode>
);
```

### Fix 4: Increased Token Lifetime
**Files**: 
- `/apis/Identity.Api/appsettings.json`
- `/apis/Identity.Api/appsettings.Production.json`

**Changes**:
- `AccessMinutes`: **15 → 60 minutes**
- Reduced frequency of token expiration issues
- Provides better user experience with longer sessions

### Fix 5: Optimized Frontend Token Refresh Timing
**File**: `/packages/shared-ui-react/hooks/useAuth.ts`

**Changes**:
- Token refresh interval: **10 minutes → 45 minutes**
- With 60-minute token lifetime, provides 15-minute safety buffer
- Prevents premature refresh attempts
- Reduces unnecessary API calls

---

## How It Works Now

### Login Flow
1. User logs in at `identity.asafarim.be`
2. Identity API sets cookies with domain `.asafarim.be`:
   - `atk` (access token, expires in 60 minutes)
   - `rtk` (refresh token, expires in 30 days)
3. User is redirected back to the requesting app
4. All apps automatically recognize authentication via shared cookies
5. **NEW**: AuthSyncProvider listens for auth state changes

### Token Refresh Flow
1. Frontend checks token expiration every request
2. If token is expired, calls `/auth/refresh`
3. **NEW**: Backend extracts user ID from expired token (no auth required)
4. Backend validates refresh token and generates new access token
5. New cookies are set automatically
6. User remains authenticated seamlessly

### Cross-App Logout Flow
1. User clicks "Sign Out" in any app
2. App calls Identity API: `POST /api/identity/auth/logout`
3. Identity API deletes authentication cookies
4. App dispatches `auth-signout` event
5. **NEW**: AuthSyncProvider in all apps listens to this event
6. All apps immediately update their auth state
7. **No page refresh required!**

---

## Testing Instructions

### Test 1: Login Persistence
1. Log in at `https://identity.asafarim.be/login`
2. Navigate to different apps (web, AI, blog)
3. ✅ Should remain logged in across all apps
4. Wait 30 minutes
5. ✅ Should still be logged in (token auto-refreshed)
6. Wait 60+ minutes without activity
7. ✅ Should be logged out after token expires

### Test 2: Cross-App Logout
1. Open multiple apps in different tabs:
   - `https://asafarim.be` (web app)
   - `https://ai.asafarim.be` (AI app)
   - `https://blog.asafarim.be` (blog app)
2. Log in through any app
3. ✅ All tabs should show authenticated state
4. Log out from any app
5. ✅ All tabs should immediately show logged out state (without refresh)

### Test 3: Token Refresh
1. Log in and note the time
2. Monitor browser DevTools → Network tab
3. After 45 minutes, verify automatic refresh request
4. ✅ Should see `POST /auth/refresh` with 200 response
5. ✅ New `atk` cookie should be set

---

## Architecture Changes

### Before
```
┌─────────────────┐
│  Identity API   │
│  /auth/refresh  │
│  [Authorize] ❌ │ ← Required valid token to refresh!
└─────────────────┘
        │
        ↓ Token expired → ❌ FAIL
     ┌──────┐
     │ Apps │
     └──────┘
```

### After
```
┌─────────────────────────┐
│     Identity API        │
│    /auth/refresh        │
│  Reads expired token ✅ │ ← Parses expired JWT for user ID
└─────────────────────────┘
        │
        ↓ Token expired → ✅ SUCCESS
     ┌──────────────────────────┐
     │  Apps with AuthSyncProvider │
     │  Listen to auth-signout  ✅ │
     └──────────────────────────┘
```

---

## Deployment Status

✅ **Identity API**
- Built successfully
- Service restarted: `dotnet-identity.service`
- Running on port 5101

✅ **Shared UI Package**
- Built successfully
- Auth hooks updated with new refresh logic

✅ **Web App**
- Built successfully
- AuthSyncProvider integrated
- Deployed to `/var/www/asafarim-dot-be/apps/web`

✅ **AI App**
- Built successfully
- AuthSyncProvider integrated
- Deployed to `/var/www/asafarim-dot-be/apps/ai-ui`

---

## Security Considerations

### Production Recommendations
1. **Refresh Token Validation**: Currently using simple GUID tokens. Consider:
   - Store refresh tokens in database with expiration
   - Implement token rotation on refresh
   - Add token revocation mechanism

2. **Rate Limiting**: Add rate limiting to `/auth/refresh` endpoint to prevent abuse

3. **Package Updates**: Update vulnerable packages:
   - `Npgsql` 8.0.0 (high severity vulnerability)
   - `System.IdentityModel.Tokens.Jwt` 7.0.3 (moderate severity)

---

## Key Learnings

1. **Token Refresh Pattern**: Refresh endpoints should NOT require authentication - that defeats their purpose
2. **Event Broadcasting**: Cross-app synchronization requires proper event listener setup (AuthSyncProvider)
3. **Token Lifetimes**: Balance between security (shorter tokens) and UX (fewer refreshes)
4. **Cookie Configuration**: SameSite=None requires Secure=true and HTTPS in production

---

## Files Modified

### Backend
- `/apis/Identity.Api/Controllers/AuthController.cs` - Fixed refresh endpoint
- `/apis/Identity.Api/appsettings.json` - Increased AccessMinutes to 60
- `/apis/Identity.Api/appsettings.Production.json` - Increased AccessMinutes to 60

### Frontend
- `/packages/shared-ui-react/hooks/useAuth.ts` - Optimized refresh interval
- `/apps/web/src/main.tsx` - Added AuthSyncProvider
- `/apps/ai-ui/src/main.tsx` - Added AuthSyncProvider

---

## Monitoring

To monitor the SSO system:

```bash
# Check Identity API logs
journalctl -u dotnet-identity.service -f

# Check for refresh endpoint calls
journalctl -u dotnet-identity.service | grep "RefreshToken"

# Check cookie issues
journalctl -u dotnet-identity.service | grep "SetAuthCookies"

# Check authentication failures
journalctl -u dotnet-identity.service | grep "GetCurrentUser"
```

---

## Next Steps

1. ✅ Test login/logout flow across all apps
2. ✅ Verify token refresh after 45 minutes
3. ✅ Confirm cross-app logout works instantly
4. ⚠️ Consider implementing proper refresh token storage
5. ⚠️ Update vulnerable NuGet packages
6. ⚠️ Add rate limiting to auth endpoints
