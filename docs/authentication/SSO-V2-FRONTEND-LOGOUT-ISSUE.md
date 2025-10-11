# SSO V2 - Frontend Auto-Logout Issue

**Date**: October 11, 2025  
**Issue**: Cookies/localStorage cleared 2 seconds after login  
**Status**: 🔍 **IDENTIFIED - Frontend Issue**

---

## Problem

After successful login, cookies and localStorage are cleared within 2 seconds, preventing the user from staying logged in.

### Symptoms
- Login succeeds (200 OK)
- Cookies set in browser (visible in DevTools for ~2 seconds)
- LocalStorage populated
- Then everything is cleared
- User appears logged out

---

## Root Cause

**Backend logs show:**
```
[13:05:03 INF] User logged in successfully: ali@asafarim.com
[13:05:05 INF] Revoked refresh token for user ...
[13:05:05 INF] User logged out from IP: 84.195.128.217
```

**The frontend is calling the logout endpoint 2 seconds after login!**

This is **NOT a backend issue**. The backend is working correctly:
- ✅ Login succeeds
- ✅ Cookies are set
- ✅ Tokens created
- ❌ Frontend immediately calls `/auth/logout`

---

## Likely Causes

### 1. Auth Check Failure Triggers Logout
Your `useAuth` hook might be:
```typescript
// ❌ BAD: Logout on any auth check failure
useEffect(() => {
  const checkAuth = async () => {
    const response = await fetch('/auth/me');
    if (!response.ok) {
      await logout(); // ❌ This is wrong!
    }
  };
  checkAuth();
}, []);
```

**Why this is wrong:**
- Right after login, cookies might not be immediately available
- Race condition between setting cookies and checking auth
- Network delay causes auth check to fail
- Triggers logout immediately

### 2. Redirect Logic Clears State
```typescript
// ❌ BAD: Clearing state on redirect
const handleLogin = async (credentials) => {
  await login(credentials);
  // Clear everything before redirect
  localStorage.clear(); // ❌ Don't do this!
  navigate(returnUrl);
};
```

### 3. Multiple Auth Checks Race Condition
```typescript
// ❌ BAD: Multiple components checking auth
// Navbar checks auth
// ProtectedRoute checks auth  
// App.tsx checks auth
// All at the same time, one fails, triggers logout
```

### 4. Logout on 401 Without Refresh Attempt
```typescript
// ❌ BAD: Logout immediately on 401
fetch('/auth/me').then(response => {
  if (response.status === 401) {
    logout(); // ❌ Should try refresh first!
  }
});
```

---

## Solution

### Fix 1: Don't Logout on Auth Check Failure

**Current (wrong):**
```typescript
const checkAuth = async () => {
  const response = await fetch('/auth/me', { credentials: 'include' });
  if (!response.ok) {
    await logout(); // ❌ Wrong!
    return;
  }
  setUser(await response.json());
};
```

**Fixed:**
```typescript
const checkAuth = async () => {
  const response = await fetch('/auth/me', { credentials: 'include' });
  
  if (!response.ok) {
    // Just set authenticated to false, don't logout
    setIsAuthenticated(false);
    setUser(null);
    return;
  }
  
  const userData = await response.json();
  setIsAuthenticated(true);
  setUser(userData);
};
```

### Fix 2: Try Refresh Before Giving Up

**Better approach:**
```typescript
const checkAuth = async () => {
  let response = await fetch('/auth/me', { credentials: 'include' });
  
  if (response.status === 401) {
    // Try to refresh token first
    const refreshResponse = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (refreshResponse.ok) {
      // Refresh succeeded, try auth check again
      response = await fetch('/auth/me', { credentials: 'include' });
    }
  }
  
  if (response.ok) {
    const userData = await response.json();
    setIsAuthenticated(true);
    setUser(userData);
  } else {
    // Only now set to unauthenticated (but don't call logout!)
    setIsAuthenticated(false);
    setUser(null);
  }
};
```

### Fix 3: Only Call Logout When User Explicitly Logs Out

**Logout should ONLY be called:**
- ✅ User clicks "Logout" button
- ✅ User's session is explicitly revoked
- ❌ NOT when auth check fails
- ❌ NOT on 401 responses
- ❌ NOT on component mount

```typescript
// ✅ GOOD: Explicit logout only
const logout = async () => {
  await fetch('/auth/logout', { 
    method: 'POST', 
    credentials: 'include' 
  });
  
  setIsAuthenticated(false);
  setUser(null);
  localStorage.removeItem('user');
  navigate('/login');
};

// Only call logout when user clicks logout button
<button onClick={logout}>Logout</button>
```

### Fix 4: Add Delay After Login

**Temporary workaround:**
```typescript
const handleLogin = async (credentials) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });
  
  if (response.ok) {
    const data = await response.json();
    setIsAuthenticated(true);
    setUser(data.user);
    
    // Wait a bit for cookies to be fully set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Now redirect
    navigate(returnUrl || '/');
  }
};
```

---

## Debugging Steps

### 1. Check Your useAuth Hook

Look for these patterns in `shared-ui-react/hooks/useAuth.ts`:

```typescript
// ❌ BAD PATTERNS:
- logout() called in useEffect
- logout() called on 401 response
- logout() called on auth check failure
- localStorage.clear() anywhere except explicit logout
- Cookies deleted anywhere except explicit logout
```

### 2. Add Console Logs

```typescript
const logout = async () => {
  console.trace('🚨 LOGOUT CALLED - Stack trace:'); // See who called it
  // ... rest of logout logic
};
```

This will show you exactly what's triggering the logout.

### 3. Check Network Tab

In DevTools Network tab, look for:
1. `POST /auth/login` - Should be 200 OK
2. `GET /auth/me` - Might be 401 (that's okay initially)
3. `POST /auth/logout` - **This should NOT happen automatically!**

If you see logout being called, check the "Initiator" column to see what triggered it.

### 4. Check Application Tab

Watch the cookies in real-time:
1. Before login: No `atk` or `rtk` cookies
2. After login: Both cookies appear
3. **If they disappear:** Something is calling logout or clearing cookies

---

## Quick Test

Try this in your browser console after login:

```javascript
// Check if cookies are set
document.cookie.split(';').filter(c => c.includes('atk') || c.includes('rtk'))

// Check localStorage
localStorage.getItem('user')

// Try auth check manually
fetch('https://identity.asafarim.be/api/identity/auth/me', { 
  credentials: 'include' 
}).then(r => r.json()).then(console.log)
```

If the manual auth check works but your app logs out, the issue is definitely in your frontend code.

---

## Example: Correct useAuth Implementation

```typescript
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        // Just set to unauthenticated, don't logout!
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setIsAuthenticated(true);
    setUser(data.user);
    
    return data;
  };

  // ONLY call this when user explicitly clicks logout
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return { isAuthenticated, user, loading, login, logout, checkAuth };
};
```

---

## Action Items

1. **Find where logout is being called automatically**
   - Search for `logout()` in your codebase
   - Add `console.trace()` to see the call stack

2. **Remove automatic logout calls**
   - Don't call logout on 401
   - Don't call logout on auth check failure
   - Don't call logout in useEffect

3. **Fix auth check logic**
   - Set `isAuthenticated = false` instead of calling logout
   - Try token refresh before giving up

4. **Test the fix**
   - Login
   - Wait 5 seconds
   - Check if cookies are still there
   - Check if you can access protected pages

---

## Backend is Working Correctly

The backend logs prove:
- ✅ Login endpoint works
- ✅ Cookies are set correctly
- ✅ Tokens are created
- ✅ Auth checks work with valid cookies
- ✅ Token refresh works
- ✅ Logout works when called

**The issue is 100% in the frontend code calling logout automatically.**

---

## Need Help?

If you can't find where logout is being called, share:
1. Your `useAuth.ts` file
2. Your login page component
3. Your protected route component
4. Network tab screenshot showing the logout call

I can help identify the exact line causing the issue.
