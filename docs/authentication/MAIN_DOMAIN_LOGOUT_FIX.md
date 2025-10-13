# Main Domain Logout Cookie Clearing Fix

## Issue

When logging out from the **main domain** (`asafarim.be`), cookies were not being fully cleared. The navbar would show "Not signed in!" but refreshing the page would restore the "Signed in" state.

**Symptoms:**
- Logout from https://asafarim.be/
- Navbar shows "Not signed in!"
- Cookies still present in browser DevTools
- Refreshing page re-authenticates the user
- **Only affected main domain, not subdomains**

## Root Cause

### Cookie Domain Behavior

When cookies are set with `Domain = ".asafarim.be"` (with leading dot), they can be accessed by:
- `asafarim.be` (main domain)
- `www.asafarim.be`
- `blog.asafarim.be`
- `ai.asafarim.be`
- All other subdomains

However, browsers can also store cookies for the **exact domain** without the dot:
- `asafarim.be` (no dot)

### The Problem

The backend's `ClearAuthCookies()` method only cleared cookies with `Domain = ".asafarim.be"`:

```csharp
// Old code - INCOMPLETE
var cookieOptions = new CookieOptions
{
    Domain = opts.CookieDomain, // ".asafarim.be"
    Path = "/",
    Expires = DateTime.UtcNow.AddDays(-1)
};

Response.Cookies.Delete("atk", cookieOptions);
Response.Cookies.Delete("rtk", cookieOptions);
```

This left cookies that were set for the exact domain `asafarim.be` (without dot) still active.

### Why Main Domain Only?

- **Subdomains** (like `blog.asafarim.be`) only store cookies with the wildcard domain `.asafarim.be`
- **Main domain** (`asafarim.be`) can have cookies for BOTH:
  - `.asafarim.be` (wildcard)
  - `asafarim.be` (exact match)

## Solution

Modified `ClearAuthCookies()` in `/apis/Identity.Api/Controllers/AuthController.cs` to clear cookies with **three different domain configurations**:

### 1. Wildcard Domain (Original)
```csharp
var cookieOptions = new CookieOptions
{
    Domain = ".asafarim.be",
    Path = "/",
    Expires = DateTime.UtcNow.AddDays(-1)
};

Response.Cookies.Delete("atk", cookieOptions);
Response.Cookies.Delete("rtk", cookieOptions);
```

### 2. Exact Domain (New)
```csharp
// Clear cookies for exact domain without leading dot
var exactDomain = opts.CookieDomain.TrimStart('.'); // "asafarim.be"
var exactDomainOptions = new CookieOptions
{
    Domain = exactDomain,
    Path = "/",
    Expires = DateTime.UtcNow.AddDays(-1)
};

Response.Cookies.Delete("atk", exactDomainOptions);
Response.Cookies.Delete("rtk", exactDomainOptions);
```

### 3. Current Host (New)
```csharp
// Clear cookies without any domain specified (uses current host)
var noDomainOptions = new CookieOptions
{
    Path = "/",
    Expires = DateTime.UtcNow.AddDays(-1)
    // No Domain property - clears for current host only
};

Response.Cookies.Delete("atk", noDomainOptions);
Response.Cookies.Delete("rtk", noDomainOptions);
```

### Why Three Variations?

Each configuration targets different cookie scopes:

1. **`.asafarim.be`** - Clears cookies shared across all subdomains
2. **`asafarim.be`** - Clears cookies specific to the main domain
3. **No domain** - Clears cookies for the exact current host (backup)

This ensures cookies are cleared regardless of how they were originally set.

## Files Modified

### `/apis/Identity.Api/Controllers/AuthController.cs`

**Method:** `ClearAuthCookies()` (lines 387-445)

**Before:**
- Only cleared cookies with configured domain (`.asafarim.be`)
- Left cookies for exact domain intact

**After:**
- Clears cookies with wildcard domain (`.asafarim.be`)
- Clears cookies with exact domain (`asafarim.be`)
- Clears cookies without domain (current host)
- Logs all clearing operations

## Testing

### Test Case 1: Logout from Main Domain
```bash
1. Log in to https://asafarim.be/
2. Open DevTools → Application → Cookies
3. Note cookies present (atk, rtk, etc.)
4. Click "Sign Out"
5. Check DevTools → Cookies should be EMPTY

Expected: ✅ All cookies cleared
Before Fix: ❌ Cookies remain (atk, rtk still present)
After Fix: ✅ All cookies cleared
```

### Test Case 2: Refresh After Logout
```bash
1. Log out from https://asafarim.be/
2. Wait for redirect to complete
3. Refresh the page (Ctrl+R)

Expected: ✅ User stays logged out
Before Fix: ❌ User re-authenticates on refresh
After Fix: ✅ User stays logged out
```

### Test Case 3: Logout from Subdomain
```bash
1. Log in to https://blog.asafarim.be/
2. Click "Sign Out"
3. Check cookies

Expected: ✅ Cookies cleared (should still work)
Before Fix: ✅ Worked (no issue on subdomains)
After Fix: ✅ Still works
```

## Backend Logs

After fix, logout logs will show:

```
[Information] Refresh token revoked for IP: xxx.xxx.xxx.xxx
[Debug] Auth cookies cleared for domain: .asafarim.be
[Debug] Also cleared cookies for exact domain: asafarim.be
[Information] User logged out from IP: xxx.xxx.xxx.xxx
```

## Console Output (Frontend)

Frontend logout will show:

```
🔑 Signing out user
🗑️ Cleared localStorage authentication data
🍪 Clearing cookies for domain: .asafarim.be
📣 Notifying backend about logout
✅ Backend logout successful
🗑️ Using identity service to clear cookies
✅ Identity service cookie clearing completed
⏱️ Waiting for cookies to be fully cleared...
🔄 Redirecting after successful logout...
```

After redirect and page load:

```
🔍 Checking authentication status...
🛑 Logout in progress, skipping auth check
❌ User is not authenticated
```

## Cookie Domain Best Practices

### Setting Cookies
When setting authentication cookies, always use wildcard domain:

```csharp
var cookieOptions = new CookieOptions
{
    Domain = ".asafarim.be", // Leading dot for all subdomains
    Path = "/",
    HttpOnly = true,
    Secure = true,
    SameSite = SameSiteMode.None
};
```

### Clearing Cookies
When clearing cookies, clear **all variations**:

```csharp
// 1. Wildcard domain
Response.Cookies.Delete("atk", new CookieOptions { Domain = ".asafarim.be", ... });

// 2. Exact domain
Response.Cookies.Delete("atk", new CookieOptions { Domain = "asafarim.be", ... });

// 3. No domain (current host)
Response.Cookies.Delete("atk", new CookieOptions { Path = "/" });
```

## Related Issues

- [Logout Race Condition](/docs/authentication/LOGOUT_REDIRECT_RACE_CONDITION_FIX.md)
- [Login Redirect Loop](/docs/authentication/LOGIN_REDIRECT_LOOP_FIX.md)
- [SSO Architecture](/docs/architecture/SSO-ARCHITECTURE.md)

## Browser Cookie Scope Reference

| Cookie Domain | Accessible From |
|--------------|-----------------|
| `.asafarim.be` | `asafarim.be`, `www.asafarim.be`, `blog.asafarim.be`, etc. |
| `asafarim.be` | `asafarim.be` only |
| `blog.asafarim.be` | `blog.asafarim.be` only |
| (no domain) | Exact current host only |

## Why This Only Affected Main Domain

**Subdomains** (e.g., `blog.asafarim.be`):
- Cookies set with `Domain = ".asafarim.be"`
- Browser stores them ONLY as `.asafarim.be`
- Clearing `.asafarim.be` works ✅

**Main domain** (`asafarim.be`):
- Cookies set with `Domain = ".asafarim.be"`
- Browser may store them as BOTH `.asafarim.be` AND `asafarim.be`
- Need to clear both ✅

## Implementation Notes

1. **Order matters** - Clear from most specific to least specific
2. **All three methods** ensure comprehensive clearing
3. **No negative impact** on subdomain logout (still works)
4. **Backward compatible** with existing logout logic

---

**Fixed:** October 13, 2025  
**Reported By:** User  
**Status:** Resolved ✅  
**Impact:** Main domain (asafarim.be) logout functionality
