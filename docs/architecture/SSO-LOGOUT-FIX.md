# SSO Logout Re-Authentication Fix

**Date**: 2025-10-10  
**Issue**: User logs out but immediately gets re-authenticated with cookies/localStorage restored

---

## Root Causes Identified

### Critical Issue 1: Wrong Event Handler for `auth-signout`
**Location**: `/packages/shared-ui-react/hooks/useAuth.ts:307`

**Problem**:
```typescript
// WRONG - This calls checkAuth() which re-authenticates!
window.addEventListener('auth-signout', debouncedHandle);
```

When `signOut()` dispatches the `auth-signout` event, the event listener triggered `debouncedHandle()`, which calls `checkAuth()`. This caused:
1. User clicks logout
2. `signOut()` dispatches `auth-signout` event
3. Event listener calls `checkAuth()` (after 500ms debounce)
4. If cookies still exist (timing issue), user gets re-authenticated immediately
5. Logout appears to fail

**Fix**:
```typescript
// CORRECT - Clear state immediately, don't re-check
const handleSignOutEvent = () => {
  console.log('🚪 Sign-out event received, clearing auth state...');
  if (mounted) {
    setAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  }
};
window.addEventListener('auth-signout', handleSignOutEvent);
```

### Critical Issue 2: Wrong Cookie Names
**Locations**: All `authSync.ts` files and `AuthProvider.tsx`

**Problem**:
The backend sets cookies with names `atk` (access token) and `rtk` (refresh token), but frontend code was trying to delete cookies named `auth_token` and `refresh_token`:

```typescript
// WRONG - These cookie names don't exist!
document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ...`;
document.cookie = `refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ...`;
```

**Backend Evidence** (`AuthController.cs:409, 424`):
```csharp
response.Cookies.Append("atk", accessToken, accessCookieOptions);  // ← "atk" not "auth_token"
response.Cookies.Append("rtk", refreshToken, refreshCookieOptions); // ← "rtk" not "refresh_token"
```

**Result**: Cookies were NEVER deleted during logout, so the user remained authenticated!

**Fix**:
```typescript
// CORRECT - Use actual cookie names
console.log('🍪 Deleting authentication cookies for domain:', COOKIE_DOMAIN);
document.cookie = `atk=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${COOKIE_DOMAIN}`;
document.cookie = `rtk=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${COOKIE_DOMAIN}`;
// Also delete without domain to cover current domain
document.cookie = `atk=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
document.cookie = `rtk=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
```

---

## Files Modified

### Core Authentication Hook
**File**: `/packages/shared-ui-react/hooks/useAuth.ts`

**Changes**:
1. **Line 307-318**: Changed `auth-signout` event handler from `debouncedHandle` (re-auth) to `handleSignOutEvent` (clear state)
2. **Line 381-385**: Fixed cookie deletion to use correct names `atk` and `rtk`

### Application Auth Sync Utilities
Fixed cookie names in all apps:

1. **`/apps/blog/src/utils/authSync.ts`** (lines 68-74)
2. **`/apps/ai-ui/src/utils/authSync.ts`** (lines 71-77)
3. **`/apps/identity-portal/src/utils/authSync.ts`** (lines 71-77)
4. **`/apps/core-app/src/utils/authSync.ts`** (lines 74-80)

### Identity Portal Context
**File**: `/apps/identity-portal/src/contexts/AuthProvider.tsx`

**Changes**:
1. **Lines 43-48**: Fixed cookie deletion in `logout()` function
2. **Lines 242-246**: Fixed cookie deletion in `forceSignOut()` function

---

## How It Works Now

### Correct Logout Flow

```
1. User clicks "Sign Out"
   ↓
2. signOut() clears localStorage
   ↓
3. signOut() deletes cookies (atk, rtk) ✅
   ↓
4. signOut() calls backend /auth/logout
   ↓
5. Backend deletes cookies (atk, rtk) ✅
   ↓
6. signOut() updates local state (authenticated=false)
   ↓
7. signOut() dispatches 'auth-signout' event
   ↓
8. AuthSyncProvider listener receives event
   ↓
9. Listener CLEARS state (not re-checks!) ✅
   ↓
10. All apps show logged-out state ✅
```

### Why It Failed Before

```
1. User clicks "Sign Out"
   ↓
2. signOut() tries to delete wrong cookies ❌
   → "auth_token" and "refresh_token" don't exist
   → Real cookies "atk" and "rtk" remain!
   ↓
3. signOut() dispatches 'auth-signout' event
   ↓
4. Event listener calls checkAuth() ❌
   ↓
5. checkAuth() finds cookies still exist
   ↓
6. User gets re-authenticated immediately! ❌
```

---

## Testing Procedure

### Test 1: Logout Stays Logged Out
1. Log in at `https://identity.asafarim.be`
2. Open DevTools → Application → Cookies
3. Verify cookies `atk` and `rtk` exist with domain `.asafarim.be`
4. Click "Sign Out" in any app
5. ✅ Check cookies are immediately deleted
6. ✅ Check localStorage is cleared
7. ✅ User remains logged out (no re-authentication)

### Test 2: Cross-App Logout
1. Open 3 tabs:
   - `https://asafarim.be` (web app)
   - `https://ai.asafarim.be` (AI app)
   - `https://blog.asafarim.be` (blog app)
2. Log in through any app
3. ✅ All tabs show authenticated state
4. Log out from ANY tab
5. ✅ All tabs immediately show logged-out state
6. ✅ Cookies deleted in all tabs
7. ✅ No re-authentication occurs

### Test 3: Verify Cookie Names
```bash
# In browser console after login
document.cookie.split(';').filter(c => c.includes('tk'))
// Should show: "atk=..." and "rtk=..."
// NOT "auth_token" or "refresh_token"
```

---

## Cookie Name Reference

### Backend Sets (Identity API)
| Cookie | Purpose | Source |
|--------|---------|--------|
| `atk` | Access Token | `AuthController.cs:409` |
| `rtk` | Refresh Token | `AuthController.cs:424` |

### Frontend Must Delete
| Cookie | Purpose | Fixed In |
|--------|---------|----------|
| `atk` | Access Token | All authSync files |
| `rtk` | Refresh Token | All authSync files |

### ❌ Wrong Names (Never Existed)
- `auth_token` - Never set by backend
- `refresh_token` - Never set by backend  
- `user_info` - Never set by backend

---

## Build Status

✅ **Shared UI Package** - Built successfully  
✅ **Web App** - Built and deployed  
✅ **AI App** - Built and deployed  
✅ **Blog App** - Built and deployed  
✅ **Identity Portal** - Built and deployed  

---

## Key Learnings

1. **Cookie Names Must Match**: Frontend cookie deletion must use exact cookie names set by backend
2. **Event Handlers Matter**: `auth-signout` should clear state, not trigger re-authentication
3. **Race Conditions**: Logout can fail if delayed auth checks override logout state
4. **Testing**: Always verify cookie deletion in DevTools, not just app behavior
5. **Documentation**: Keep frontend/backend cookie naming documented to prevent drift

---

## Prevention

To prevent this issue in the future:

### 1. Centralize Cookie Names
Create a shared constant file:

```typescript
// packages/shared-ui-react/constants/cookies.ts
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'atk',
  REFRESH_TOKEN: 'rtk'
} as const;
```

### 2. Add Tests
```typescript
// Test that cookies are deleted
it('should delete authentication cookies on logout', async () => {
  // Login
  await signIn();
  expect(document.cookie).toContain('atk=');
  
  // Logout
  await signOut();
  expect(document.cookie).not.toContain('atk=');
  expect(document.cookie).not.toContain('rtk=');
});
```

### 3. Backend Response Headers
Add header to confirm cookie deletion:
```csharp
Response.Headers.Add("X-Logout-Success", "true");
Response.Headers.Add("X-Cookies-Cleared", "atk,rtk");
```

---

## Related Issues

- ✅ [SSO-FIX-SUMMARY.md](./SSO-FIX-SUMMARY.md) - Initial SSO fixes (refresh endpoint, AuthSyncProvider)
- ✅ This document - Logout re-authentication fix

---

## Monitoring

Watch for these log messages:

### Success Pattern
```
🍪 Deleting authentication cookies for domain: .asafarim.be
🚪 Sign-out event received, clearing auth state...
Logout API call successful
```

### Failure Pattern (Should Not Occur)
```
✅ User is authenticated  ← After logout dispatch!
🔑 Fetching token for authenticated user...  ← Should not happen!
```

To monitor:
```bash
# Check Identity API logout calls
journalctl -u dotnet-identity.service | grep "Logout"

# Check for unexpected re-auth after logout
# (Look in browser console for the failure pattern above)
```

---

## Summary

**Two critical bugs prevented logout from working**:

1. **Wrong event handler**: `auth-signout` event triggered re-authentication instead of clearing state
2. **Wrong cookie names**: Frontend tried to delete non-existent cookies while real cookies (`atk`, `rtk`) remained

**Both are now fixed and deployed across all apps.**

The logout flow now properly:
- Clears localStorage ✅
- Deletes correct cookies (`atk`, `rtk`) ✅  
- Updates state without re-checking auth ✅
- Synchronizes across all apps instantly ✅
