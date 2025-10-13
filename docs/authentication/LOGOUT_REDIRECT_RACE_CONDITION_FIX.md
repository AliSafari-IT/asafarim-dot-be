# Logout Re-Authentication Race Condition Fix

## Issue

When logging out from the web app (https://asafarim.be/), clicking "Sign Out" did not actually log the user out. The authentication state would immediately be restored, as if the user had just logged in again.

**Symptoms:**
- Click "Sign Out" button
- Cookies appear to refresh back
- User remains logged in after logout
- Page may briefly show logged-out state, then re-authenticate

**Affected Apps:**
- Web app (asafarim.be)
- All apps using the shared useAuth hook

## Root Cause

The issue was a **race condition** in the logout flow in `/packages/shared-ui-react/hooks/useAuth.ts`:

### The Problematic Sequence

```typescript
// In signOut function (lines 408-454):

1. Clear local state (setAuthenticated(false), etc.)
2. Clear localStorage
3. Attempt client-side cookie clearing (doesn't work for HttpOnly cookies)
4. Call /clear-cookies endpoint (async, NOT awaited properly)
5. Call /auth/logout endpoint (async, NOT awaited properly)  
6. window.location.href = '/' ← IMMEDIATE REDIRECT
7. New page loads
8. checkAuth() runs automatically
9. Cookies still valid (steps 4-5 didn't complete!)
10. User re-authenticated ❌
```

### Why It Failed

**Problem 1: Premature Redirect**
The redirect happened **immediately** after initiating the logout API calls, without waiting for them to complete:

```typescript
// Old code - WRONG
await fetch(identityLogoutUrl, { ... }); // Started
window.location.href = '/'; // Redirect immediately, don't wait!
```

**Problem 2: No Protection Against Re-Authentication**
When the page reloaded after redirect, `checkAuth()` ran immediately and found valid cookies (because logout hadn't finished), so it re-authenticated the user.

**Problem 3: Auto-Refresh Timing**
The token refresh mechanism could trigger during the logout process, potentially restoring the session.

## Solution

### 1. Wait for Logout to Complete

Modified the `signOut` function to **await** the logout API call before redirecting:

```typescript
// New code - CORRECT
await fetch(identityLogoutUrl, {
  method: 'POST',
  credentials: 'include',
  // ... headers
});

// Wait to ensure server has time to clear cookies
await new Promise(resolve => setTimeout(resolve, 500));

// NOW redirect
window.location.href = '/';
```

### 2. Add Logout Flag

Use sessionStorage to prevent auto-re-authentication after logout:

**In signOut():**
```typescript
// Set flag BEFORE starting logout
sessionStorage.setItem('logout_in_progress', 'true');

// ... perform logout ...

// Redirect
window.location.href = '/';
```

**In checkAuth():**
```typescript
const logoutInProgress = sessionStorage.getItem('logout_in_progress') === 'true';
if (logoutInProgress) {
  console.log('🛑 Logout in progress, skipping auth check');
  sessionStorage.removeItem('logout_in_progress');
  setAuthenticated(false);
  setUser(null);
  setToken(null);
  return; // Don't try to authenticate
}
```

### 3. Reorder Operations

Changed the order to ensure logout completes first:

```typescript
// 1. Set logout flag (prevents re-auth)
sessionStorage.setItem('logout_in_progress', 'true');

// 2. Clear local state
setAuthenticated(false);
setUser(null);
setToken(null);

// 3. Clear localStorage
localStorage.removeItem('auth_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('user_info');

// 4. Clear client-side cookies (best effort)
// ... document.cookie clearing ...

// 5. Call backend logout (AWAIT completion)
await fetch(identityLogoutUrl, { method: 'POST', ... });

// 6. Call clear-cookies endpoint (AWAIT completion)
await fetch('https://identity.asafarim.be/clear-cookies', { ... });

// 7. Wait for cookies to fully clear
await new Promise(resolve => setTimeout(resolve, 500));

// 8. Broadcast signout event
window.dispatchEvent(new Event('auth-signout'));

// 9. NOW redirect (only after everything completes)
window.location.href = '/';
```

## Files Modified

### `/packages/shared-ui-react/hooks/useAuth.ts`

**Lines 358-462: signOut() function**
- Added `sessionStorage.setItem('logout_in_progress', 'true')` at start
- Reordered operations to call backend FIRST
- Added proper `await` for logout endpoint
- Added 500ms delay to ensure cookies are cleared
- Redirect only AFTER logout completes

**Lines 216-229: checkAuth() function**
- Check for `logout_in_progress` flag
- Skip auth check if flag is present
- Remove flag and set auth state to false
- Prevents immediate re-authentication after logout

## Testing

### Test Case 1: Logout from Web App
```bash
1. Log in to https://asafarim.be/
2. Click "Sign Out" button
3. Wait for redirect

Expected: ✅ User is logged out, stays logged out
Before Fix: ❌ User appears to log out, then immediately logs back in
After Fix: ✅ User successfully logs out and stays logged out
```

### Test Case 2: Logout from Identity Portal
```bash
1. Log in to https://identity.asafarim.be/
2. Go to dashboard
3. Click "Sign Out"

Expected: ✅ User is logged out
Before Fix: ❌ User may be re-authenticated
After Fix: ✅ User successfully logs out
```

### Test Case 3: Logout with Open Tabs
```bash
1. Log in with two tabs open (e.g., web app and blog)
2. Click "Sign Out" in one tab
3. Check the other tab

Expected: ✅ Both tabs should show logged out state
After Fix: ✅ Works correctly (broadcast event handles this)
```

## Console Output

After fix, successful logout will show:

```
🔑 Signing out user
🗑️ Cleared localStorage authentication data
🍪 Clearing cookies for domain: .asafarim.be
🔍 Current cookies after clearing: ...
📣 Notifying backend about logout
✅ Backend logout successful
🗑️ Using identity service to clear cookies
✅ Identity service cookie clearing completed
⏱️ Waiting for cookies to be fully cleared...
🔄 Redirecting after successful logout...
```

On page reload after logout:

```
🔍 Checking authentication status...
🛑 Logout in progress, skipping auth check
```

## Backend Logout Endpoint

The Identity API's logout endpoint (`/api/identity/auth/logout`) handles:

1. **Revoke refresh token** from database
2. **Clear cookies** (`atk` and `rtk`)
3. **Send Clear-Site-Data header**

**Location:** `/apis/Identity.Api/Controllers/AuthController.cs`

```csharp
[HttpPost("logout")]
public async Task<IActionResult> Logout()
{
    // Get and revoke refresh token
    if (Request.Cookies.TryGetValue("rtk", out var refreshToken))
    {
        await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken, ipAddress);
    }

    // Clear cookies
    ClearAuthCookies();

    return Ok(new { message = "Logged out successfully" });
}

private void ClearAuthCookies()
{
    var cookieOptions = new CookieOptions
    {
        HttpOnly = true,
        Secure = useSecure,
        SameSite = SameSiteMode.None,
        Domain = opts.CookieDomain,
        Path = "/",
        Expires = DateTime.UtcNow.AddDays(-1) // Expire immediately
    };

    Response.Cookies.Delete("atk", cookieOptions);
    Response.Cookies.Delete("rtk", cookieOptions);
    Response.Headers.Append("Clear-Site-Data", "\"cookies\"");
}
```

## Best Practices Applied

1. **Always await async operations before redirect** - Ensures operations complete
2. **Use flags to prevent race conditions** - SessionStorage flag prevents re-auth
3. **Add delays for cookie propagation** - 500ms ensures server has time to clear cookies
4. **Order operations correctly** - Backend clearing before redirect
5. **Clear all storage mechanisms** - localStorage, sessionStorage, cookies

## Related Issues

- Login redirect loop fix (separate issue)
- SSO cookie sharing across subdomains
- Token refresh timing

## Related Documentation

- [SSO Architecture](/docs/architecture/SSO-ARCHITECTURE.md)
- [Login Redirect Loop Fix](/docs/authentication/LOGIN_REDIRECT_LOOP_FIX.md)
- [Production Environment Detection](/docs/deployment/PRODUCTION_ENVIRONMENT_DETECTION.md)

---

**Fixed:** October 13, 2025  
**Reported By:** User  
**Status:** Resolved ✅  
**Impact:** All apps using shared useAuth hook
