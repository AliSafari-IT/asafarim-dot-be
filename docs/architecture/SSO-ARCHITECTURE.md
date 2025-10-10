# Single Sign-On (SSO) Architecture

## Overview

The ASafariM ecosystem uses a **centralized authentication** system where all applications share authentication state through cookies with domain `.asafarim.be`.

## Architecture Components

### 1. Identity Portal (`identity.asafarim.be`)
**Role**: Central authentication authority

**Responsibilities**:
- User login and registration
- Password management (setup, reset, change)
- Session management
- JWT token generation
- Setting authentication cookies with domain `.asafarim.be`

**API Endpoints**:
- `POST /api/identity/auth/login` - User login
- `POST /api/identity/auth/register` - User registration
- `POST /api/identity/auth/logout` - User logout
- `GET /api/identity/auth/me` - Get current user info
- `GET /api/identity/auth/token` - Get JWT token
- `POST /api/identity/auth/refresh` - Refresh access token
- `POST /api/identity/auth/setup-password` - First-time password setup

**Cookie Configuration**:
```csharp
Domain: .asafarim.be
HttpOnly: true
Secure: true (in production)
SameSite: None (in production with HTTPS)
Path: /
```

### 2. Consumer Apps (`web.asafarim.be`, `ai.asafarim.be`, etc.)
**Role**: Applications that consume authentication

**Responsibilities**:
- Check authentication status via shared cookies
- Redirect to Identity Portal for login/registration
- Display user information
- Handle sign-out

**Authentication Flow**:
1. App checks if user is authenticated by calling `/api/identity/auth/me`
2. If not authenticated, redirect to `https://identity.asafarim.be/login?returnUrl=<current-url>`
3. After successful login, Identity Portal redirects back to `returnUrl`
4. App automatically detects authentication via shared cookies

## Authentication Flow

### Login Flow
```
1. User visits web.asafarim.be/admin/resumes (protected page)
2. App detects user is not authenticated
3. App redirects to: https://identity.asafarim.be/login?returnUrl=https://web.asafarim.be/admin/resumes
4. User enters credentials at Identity Portal
5. Identity Portal validates credentials
6. Identity Portal sets cookies with domain .asafarim.be:
   - atk (access token)
   - rtk (refresh token)
7. Identity Portal redirects to: https://web.asafarim.be/admin/resumes
8. Web app detects authentication via cookies
9. User sees protected content
```

### Cross-App Authentication
```
1. User logs in at identity.asafarim.be
2. Cookies are set with domain .asafarim.be
3. User navigates to web.asafarim.be
4. Web app automatically recognizes user via shared cookies
5. No additional login required!
```

### Logout Flow
```
1. User clicks "Sign Out" in any app
2. App calls Identity API: POST /api/identity/auth/logout
3. Identity API deletes authentication cookies
4. App clears local state
5. App dispatches 'auth-signout' event (for cross-tab sync)
6. User is redirected to home page
7. All other apps automatically detect logout via cookie deletion
```

## Implementation Details

### Backend (Identity API)

**ForwardedHeaders Middleware**:
```csharp
// Required for HTTPS detection behind nginx reverse proxy
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

app.UseForwardedHeaders(); // Must be first middleware
```

**Cookie Configuration**:
```csharp
var isProdDomain = opts.CookieDomain?.EndsWith(".asafarim.be") == true;
var isHttps = context?.Request?.IsHttps == true;
var useSecure = isProdDomain || isHttps;
var sameSite = isProdDomain && isHttps ? SameSiteMode.None : SameSiteMode.Lax;

var cookieOptions = new CookieOptions
{
    HttpOnly = true,
    Secure = useSecure,
    SameSite = sameSite,
    Domain = opts.CookieDomain, // .asafarim.be
    Path = "/",
    Expires = persistent ? DateTime.UtcNow.AddMinutes(opts.AccessMinutes) : null
};
```

### Frontend (Consumer Apps)

**Local Auth Hook** (`apps/web/src/hooks/useAuth.ts`):
```typescript
import { useAuth as useSharedAuth } from '@asafarim/shared-ui-react';

const prodConfig: UseAuthOptions = {
  authApiBase: 'https://identity.asafarim.be/api/identity',
  meEndpoint: '/auth/me',
  tokenEndpoint: '/auth/token',
  logoutEndpoint: '/auth/logout',
  identityLoginUrl: 'https://identity.asafarim.be/login',
  identityRegisterUrl: 'https://identity.asafarim.be/register'
};

export const useAuth = () => {
  return useSharedAuth(prodConfig);
};
```

**Usage in Components**:
```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, user, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <button onClick={() => signIn()}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Security Considerations

### Cookie Security
- **HttpOnly**: Prevents JavaScript access to cookies (XSS protection)
- **Secure**: Cookies only sent over HTTPS in production
- **SameSite=None**: Allows cross-subdomain cookie sharing (required for SSO)
- **Domain=.asafarim.be**: Shares cookies across all subdomains

### Token Management
- **Access Token**: Short-lived JWT (15 minutes)
- **Refresh Token**: Long-lived token (30 days)
- **Automatic Refresh**: Tokens refreshed every 10 minutes if user is active

### CORS Configuration
```csharp
// Production origins
var productionOrigins = new[]
{
    "https://asafarim.be",
    "https://www.asafarim.be",
    "https://ai.asafarim.be",
    "https://core.asafarim.be",
    "https://blog.asafarim.be",
    "https://identity.asafarim.be",
};

builder.Services.AddCors(opt =>
    opt.AddPolicy("app", p =>
        p.WithOrigins(allowedOrigins)
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials()
    )
);
```

## Troubleshooting

### Issue: Cookies not shared across apps
**Cause**: Cookie domain not set correctly or HTTPS not detected
**Solution**: 
1. Verify `CookieDomain` is set to `.asafarim.be` in `appsettings.Production.json`
2. Ensure `ForwardedHeaders` middleware is configured
3. Check nginx is sending `X-Forwarded-Proto: https` header

### Issue: User logged out immediately after login
**Cause**: Multiple `useAuth` instances without configuration
**Solution**: Always use local auth hook wrapper, never import `useAuth` directly from shared package

### Issue: Logged out when visiting login page while authenticated
**Cause**: Authentication check (`/auth/me`) returning 401 even with valid cookies
**Possible Reasons**:
1. **Cookie not being sent**: Check browser DevTools → Network → Request Headers for `Cookie: atk=...`
2. **Backend not reading cookie**: Verify `OnMessageReceived` event in JWT configuration reads from `atk` cookie
3. **Token expired**: Check token expiration time
4. **SameSite issues**: Cookies with `SameSite=None` require `Secure=true` and HTTPS

**Debug Steps**:
1. Open browser DevTools → Application → Cookies
2. Verify cookies `atk` and `rtk` exist with domain `.asafarim.be`
3. Check Network tab when visiting login page
4. Look for `/auth/me` request and verify:
   - Request has `Cookie` header with `atk` value
   - Response status (should be 200 if authenticated, 401 if not)
5. If 401, check backend logs for JWT validation errors

**Solution**:
- If cookies exist but not sent: Check `SameSite` and `Secure` flags
- If cookies sent but 401: Check JWT validation in backend logs
- If cookies missing: User was actually logged out, not an SSO issue

### Issue: CORS errors
**Cause**: Origin not in allowed list or credentials not enabled
**Solution**: 
1. Add origin to `productionOrigins` array
2. Ensure `.AllowCredentials()` is called in CORS policy

## Best Practices

1. **Always use local auth hooks**: Each app should have its own `hooks/useAuth.ts` that wraps the shared hook with proper configuration

2. **Never call `useAuth()` without config**: This creates instances with default values and breaks SSO

3. **Handle return URLs**: Always preserve the user's intended destination when redirecting to login

4. **Test cross-app navigation**: Verify users stay authenticated when moving between apps

5. **Monitor cookie expiration**: Implement automatic token refresh to maintain sessions

## Testing SSO

### Manual Test Flow
1. Clear all cookies
2. Visit `https://web.asafarim.be/admin/resumes`
3. Should redirect to `https://identity.asafarim.be/login?returnUrl=...`
4. Login with credentials
5. Should redirect back to `/admin/resumes` with authentication
6. Navigate to `https://ai.asafarim.be`
7. Should be automatically authenticated (no login required)
8. Sign out from AI app
9. Refresh web app - should be logged out there too

### Verification Checklist
- [ ] Cookies have domain `.asafarim.be`
- [ ] Cookies have `Secure` flag in production
- [ ] Cookies have `HttpOnly` flag
- [ ] Cookies have `SameSite=None` in production
- [ ] Login redirects back to return URL
- [ ] Authentication persists across page refreshes
- [ ] Authentication shared across all subdomains
- [ ] Logout clears cookies and updates all apps
- [ ] Token refresh works automatically
- [ ] No duplicate `useAuth` initializations in console
