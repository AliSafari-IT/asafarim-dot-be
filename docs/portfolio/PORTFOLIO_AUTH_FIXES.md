# Portfolio Authentication & API Fixes

## Issues Fixed

### 1. **Sign Out Not Clearing Authentication State**
**Problem**: After clicking "Sign Out", the navbar still showed "Not signed in" but cookies remained, causing the user to appear signed in after refresh.

**Root Cause**: 
- Cookies were not being cleared for all domain/path combinations
- The `useAuth` hook wasn't listening for the `auth-signout` event to update state immediately

**Solution**:
- Added aggressive cookie clearing for current domain without leading dot
- Added cookie clearing without domain attribute (for cookies set without domain)
- Added `/portfolio` path to cookie clearing paths
- Added event listener in `useAuth` hook to immediately clear state when `auth-signout` event is dispatched

**Files Modified**:
1. `/packages/shared-ui-react/hooks/useAuth.ts`
   - Lines 423-434: Added current domain cookie clearing
   - Lines 348-364: Added `auth-signout` event listener

### 2. **Portfolio Page Returning HTML Instead of JSON**
**Problem**: When accessing `/portfolio` while not authenticated, the API returned an HTML login page instead of JSON, causing error: `Unexpected token '<', "<!doctype "... is not valid JSON`

**Root Cause**:
- The `/api/portfolio` endpoint requires authentication (`[Authorize]` attribute)
- When not authenticated, ASP.NET Core redirects to a login page (HTML)
- Frontend tried to parse HTML as JSON

**Solution**:
- Added content-type checking before parsing response
- Detect HTML responses and redirect to login page with return URL
- Handle 401 responses by checking if HTML is returned
- Provide clear error messages for authentication issues

**Files Modified**:
1. `/apps/core-app/src/services/portfolioService.ts`
   - Lines 31-45: Added 401 handling with HTML detection
   - Lines 47-59: Added content-type validation before JSON parsing
2. `/apps/core-app/src/components/Portfolio/Portfolio.tsx`
   - Lines 12-21: Added error handling for authentication errors

## Technical Details

### Cookie Clearing Strategy
```typescript
// Clear for current domain (e.g., "core.asafarim.be")
const currentDomain = window.location.hostname;
cookieNames.forEach(name => {
  paths.forEach(path => {
    // With domain
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${currentDomain}`;
    // Without domain (for cookies set without domain attribute)
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  });
});
```

### HTML Response Detection
```typescript
// Check content-type header
const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  const text = await response.text();
  // Detect HTML responses
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    // Redirect to login with return URL
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    throw new Error('Authentication required. Redirecting to login...');
  }
}
```

### Event-Based State Management
```typescript
// In useAuth hook
window.addEventListener('auth-signout', () => {
  setAuthenticated(false);
  setUser(null);
  setToken(null);
  setLoading(false);
});

// In signOut function
window.dispatchEvent(new Event('auth-signout'));
```

## Testing Checklist

- [x] Sign out clears all cookies properly
- [x] Navbar updates immediately after sign out
- [x] Accessing `/portfolio` while not authenticated redirects to login
- [x] After login, user is redirected back to `/portfolio`
- [x] No "Unexpected token" errors when not authenticated
- [x] Refresh after sign out doesn't show user as signed in

## API Endpoints Affected

- `GET /api/portfolio` - Requires authentication
- `GET /api/portfolio/settings` - Requires authentication
- `GET /api/portfolio/projects` - Requires authentication
- `POST /api/portfolio/projects` - Requires authentication
- `PUT /api/portfolio/projects/{id}` - Requires authentication
- `DELETE /api/portfolio/projects/{id}` - Requires authentication

## Browser Compatibility

All fixes tested and working in:
- Chrome/Edge (Chromium)
- Firefox
- Safari

## Related Documentation

- [SSO Architecture](./SSO-ARCHITECTURE.md)
- [Portfolio API Examples](./PORTFOLIO_API_EXAMPLES.md)
- [Bug Fix Summary](./BUGFIX_SUMMARY.md)
