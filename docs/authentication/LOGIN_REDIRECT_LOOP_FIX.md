# Login Page Redirect Loop Fix

## Issue

When logging in directly from `https://identity.asafarim.be/login` (without a returnUrl), the page would flicker/loop between `/dashboard` and `/login`.

**Symptoms:**
- User submits login form
- Page briefly shows `/dashboard`
- Page redirects back to `/login`
- Page redirects to `/dashboard` again
- Loop continues indefinitely

**When it occurred:**
- ❌ Direct login from identity portal (`https://identity.asafarim.be/login`)
- ✅ Login from other apps with returnUrl works fine

## Root Cause

The login flow had **multiple redirect handlers** that conflicted with each other:

### 1. LoginForm Component
**Location:** `/apps/identity-portal/src/components/LoginForm.tsx`

After successful login (line 84):
```typescript
navigate(internalPath, { replace: true });
```

### 2. Login Page Component
**Location:** `/apps/identity-portal/src/pages/Login.tsx`

useEffect watching `isAuthenticated` (lines 12-38):
```typescript
useEffect(() => {
  if (isAuthenticated && !loading) {
    navigate(redirectTo, { replace: true });
  }
}, [isAuthenticated, loading, navigate, returnUrl]);
```

### 3. The Race Condition

```
Timeline of events:

1. User submits login form
   └─> LoginForm calls login()
       └─> Waits 2 seconds for cookies to be set
           └─> Returns success

2. LoginForm navigates to '/dashboard'
   └─> React Router changes route

3. isAuthenticated changes from false to true
   └─> Login page useEffect triggers
       └─> Also tries to navigate to '/dashboard'
       
4. Dashboard loads
   └─> Briefly checks auth state
   └─> If cookies not fully propagated: !isAuthenticated
       └─> Dashboard redirects to '/login'

5. Login page loads again
   └─> useEffect sees isAuthenticated === true
       └─> Redirects to '/dashboard'

6. GO TO STEP 4 → INFINITE LOOP
```

## Solution

Modified `Login.tsx` to **differentiate between two scenarios**:

### Scenario A: User Arrives Already Authenticated
User navigates to `/login` while already logged in (e.g., bookmark, direct URL).

**Expected behavior:** Redirect to dashboard immediately.

### Scenario B: User Just Logged In Via Form
User was NOT authenticated, filled out form, submitted successfully.

**Expected behavior:** Let LoginForm handle the redirect (avoid double redirect).

### Implementation

Use **sessionStorage flag** to coordinate between LoginForm and Login page:

**In LoginForm.tsx:**
```typescript
const handleSubmit = async (e: FormEvent) => {
  const success = await login(formData);
  if (success) {
    // Set flag to prevent Login page's useEffect from also redirecting
    sessionStorage.setItem('login_just_completed', 'true');
    
    // Then perform redirect
    navigate(internalPath, { replace: true });
  }
};
```

**In Login.tsx:**
```typescript
useEffect(() => {
  // Check if we just completed a login from the form
  const justCompletedLogin = sessionStorage.getItem('login_just_completed') === 'true';
  if (justCompletedLogin) {
    console.log('🛑 Login just completed via form, skipping page-level redirect');
    sessionStorage.removeItem('login_just_completed');
    return; // Don't redirect - LoginForm already handled it
  }
  
  if (isAuthenticated) {
    // User was already authenticated - safe to redirect
    navigate(redirectTo, { replace: true });
  }
}, [isAuthenticated, loading, navigate, returnUrl]);
```

**In DashboardPage.tsx:**
```typescript
useEffect(() => {
  const justCompletedLogin = sessionStorage.getItem('login_just_completed') === 'true';
  
  if (justCompletedLogin) {
    // Wait for auth state to stabilize after login
    const checkTimeout = setTimeout(() => {
      sessionStorage.removeItem('login_just_completed');
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      }
    }, 1000); // Give 1 second for cookies to fully propagate
    
    return () => clearTimeout(checkTimeout);
  }
  
  // Normal auth check for direct navigation
  if (!isAuthenticated) {
    navigate('/login', { replace: true });
  }
}, [isAuthenticated, loading, navigate]);
```

### Key Changes

1. **SessionStorage flag** (`login_just_completed`) to coordinate redirects between components
2. **LoginForm sets flag** before redirecting to prevent Login page from also redirecting
3. **Login page checks flag** and skips redirect if login just completed
4. **Dashboard waits 1 second** for auth state to stabilize after detecting the flag
5. **Flag is removed** after being checked to prevent affecting future navigations

## Files Modified

### `/apps/identity-portal/src/pages/Login.tsx`

**Before:**
- Always redirected when `isAuthenticated === true`
- Conflicted with LoginForm's redirect
- Caused double redirects and race conditions

**After:**
- Checks sessionStorage flag `login_just_completed`
- Skips redirect if login just completed (LoginForm handles it)
- Only auto-redirects already-authenticated users
- Uses `hasRedirectedRef` to prevent multiple redirects

### `/apps/identity-portal/src/components/LoginForm.tsx`

**Before:**
- Redirected immediately after successful login
- No coordination with Login page component

**After:**
- Sets `login_just_completed` flag in sessionStorage before redirecting
- Prevents Login page's useEffect from conflicting

### `/apps/identity-portal/src/pages/DashboardPage.tsx`

**Before:**
- Immediately redirected to login if `!isAuthenticated`
- Caused issues when auth state hadn't stabilized after login

**After:**
- Checks for `login_just_completed` flag
- Waits 1 second for auth to stabilize if flag present
- Prevents premature redirect back to login during auth propagation

## Testing

### Test Case 1: Direct Login (The Bug)
```bash
1. Log out completely
2. Navigate to https://identity.asafarim.be/login
3. Fill in credentials
4. Click "Sign In"

Expected: ✅ Smooth redirect to /dashboard
Before Fix: ❌ Flickering loop between /login and /dashboard
After Fix: ✅ Works correctly
```

### Test Case 2: Already Logged In
```bash
1. Log in to identity portal
2. Navigate to /dashboard
3. Manually go to https://identity.asafarim.be/login

Expected: ✅ Immediately redirect to /dashboard
Before Fix: ✅ Worked
After Fix: ✅ Still works
```

### Test Case 3: Login with ReturnUrl
```bash
1. Click "Sign In" from blog.asafarim.be
2. Redirected to identity.asafarim.be/login?returnUrl=https://blog.asafarim.be
3. Fill in credentials
4. Click "Sign In"

Expected: ✅ Redirect back to blog.asafarim.be
Before Fix: ✅ Worked
After Fix: ✅ Still works
```

### Test Case 4: Already Logged In with ReturnUrl
```bash
1. Already logged in
2. Click "Sign In" link from another app
3. Redirected to identity.asafarim.be/login?returnUrl=...

Expected: ✅ Immediately redirect to returnUrl
Before Fix: ✅ Worked
After Fix: ✅ Still works
```

## Related Issues

### Cookie Propagation Delay

The login function already includes a 2-second delay for cookie propagation:

```typescript
// useIdentityPortalAuth.ts, line 56
await new Promise(resolve => setTimeout(resolve, 2000));
```

This ensures cookies are set before redirect, but the redirect loop could still occur during this window.

### Dashboard Auth Check

The Dashboard page also checks authentication:

```typescript
// DashboardPage.tsx
useEffect(() => {
  if (!loading && !isAuthenticated) {
    navigate('/login', { replace: true });
  }
}, [isAuthenticated, loading, navigate]);
```

This is necessary to protect the dashboard, but can contribute to loops if auth state isn't stable.

## Best Practices Applied

1. **Single Responsibility:** Each component handles one redirect scenario
2. **State Tracking:** Use refs to track initial state vs. changes
3. **Prevent Double Redirects:** Guard clauses and flags prevent multiple redirects
4. **Separation of Concerns:** Form submission redirect ≠ auth guard redirect

## Future Improvements

### Option 1: Centralized Redirect Logic
Move all redirect logic to a single location (e.g., router guard or HOC).

### Option 2: Better Auth State Management
Use a state machine library (e.g., XState) to manage auth transitions explicitly.

### Option 3: Session Storage Flag
Set a flag in sessionStorage after login to distinguish fresh login from existing session:

```typescript
// After login
sessionStorage.setItem('just_logged_in', 'true');

// In Login page
const justLoggedIn = sessionStorage.getItem('just_logged_in') === 'true';
if (justLoggedIn) {
  sessionStorage.removeItem('just_logged_in');
  // Skip auto-redirect
}
```

## Related Documentation

- [SSO Architecture](/docs/architecture/SSO-ARCHITECTURE.md)
- [Authentication Flow](/docs/authentication/)
- [Production Environment Detection](/docs/deployment/PRODUCTION_ENVIRONMENT_DETECTION.md)

---

**Fixed:** October 13, 2025  
**Reported By:** User  
**Status:** Resolved ✅  
**Impact:** Identity Portal login experience
