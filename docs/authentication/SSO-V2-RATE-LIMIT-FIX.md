# SSO V2 - Rate Limiting Fix

**Date**: October 11, 2025  
**Issue**: Rate limiting too aggressive, blocking legitimate auth checks  
**Status**: ✅ **FIXED**

---

## Problem

The new SSO V2 implementation included rate limiting for security, but it was **too aggressive** for production use:

### Symptoms
- Multiple `429 Too Many Requests` errors in browser console
- Users unable to login
- Auth checks failing with rate limit errors
- Frontend making rapid `/auth/me` and `/auth/refresh` calls on page load

### Root Cause
1. **Rate limits too low**: 10 requests/minute was too restrictive
2. **Wrong endpoints limited**: `/auth/refresh` was rate limited, causing auth check failures
3. **Multiple components**: React apps with multiple components all checking auth simultaneously

---

## Solution Applied

### 1. Increased Rate Limits
**Before:**
```csharp
private const int MaxRequestsPerMinute = 10;
private const int MaxRequestsPerHour = 100;
```

**After:**
```csharp
private const int MaxRequestsPerMinute = 30;  // Increased 3x
private const int MaxRequestsPerHour = 300;   // Increased 3x
```

### 2. Excluded Auth Check Endpoints
**Before:** Rate limiting applied to:
- `/auth/login` ✓
- `/auth/register` ✓
- `/auth/refresh` ❌ (shouldn't be limited)
- `/auth/me` ❌ (shouldn't be limited)

**After:** Rate limiting only applied to:
- `/auth/login` ✓ (prevents brute force)
- `/auth/register` ✓ (prevents spam)

**Excluded from rate limiting:**
- `/auth/refresh` - Used for automatic token renewal
- `/auth/me` - Used for frequent auth status checks
- `/auth/token` - Used for token retrieval
- `/auth/logout` - Should always work

---

## Why This Makes Sense

### Security vs Usability Balance

**Login & Register** need strict rate limiting:
- ✅ Prevents brute force password attacks
- ✅ Prevents account enumeration
- ✅ Prevents spam registrations
- ✅ 30 requests/minute is still very restrictive

**Auth Checks** should NOT be rate limited:
- ✅ Multiple components check auth on page load
- ✅ Token refresh happens automatically
- ✅ These are authenticated operations (already have valid token)
- ✅ No security risk from checking auth status

### Real-World Usage Pattern

When a user visits your site:
1. **Navbar** checks auth status → `/auth/me`
2. **ProtectedRoute** checks auth status → `/auth/me`
3. **User profile** checks auth status → `/auth/me`
4. **Multiple tabs** each check auth status → `/auth/me` × N

**Result:** 10+ requests in < 1 second = Rate limit exceeded ❌

With the fix, this works perfectly ✅

---

## Testing

### Before Fix
```
GET /auth/me → 401 Unauthorized
POST /auth/refresh → 429 Too Many Requests ❌
POST /auth/login → 429 Too Many Requests ❌
```

### After Fix
```
GET /auth/me → 401 Unauthorized (expected, no token)
POST /auth/refresh → Works normally ✓
POST /auth/login → Works normally ✓
```

---

## Configuration

Current rate limiting configuration:

```csharp
// File: apis/Identity.Api/Middleware/RateLimitingMiddleware.cs

// Rate limits (per IP address)
MaxRequestsPerMinute = 30   // Login/Register only
MaxRequestsPerHour = 300    // Login/Register only

// Endpoints with rate limiting
- POST /auth/login
- POST /auth/register

// Endpoints WITHOUT rate limiting
- GET /auth/me
- GET /auth/token
- POST /auth/refresh
- POST /auth/logout
- POST /auth/setup-password
```

---

## Deployment

### Changes Made
1. ✅ Updated `RateLimitingMiddleware.cs`
2. ✅ Rebuilt Identity.Api
3. ✅ Restarted `dotnet-identity.service`

### Verify Fix
```bash
# Check service is running
sudo systemctl status dotnet-identity.service

# Test auth endpoints
curl https://identity.asafarim.be/health
curl https://identity.asafarim.be/api/identity/auth/me

# Check logs for rate limiting
journalctl -u dotnet-identity.service | grep "Rate limit"
```

---

## Future Improvements

### Option 1: Configurable Rate Limits
Move rate limits to `appsettings.json`:
```json
{
  "RateLimiting": {
    "LoginRequestsPerMinute": 30,
    "LoginRequestsPerHour": 300,
    "Enabled": true
  }
}
```

### Option 2: Per-User Rate Limiting
Instead of per-IP, track per authenticated user:
- Prevents one user from exhausting rate limit for entire IP
- Better for users behind corporate NAT

### Option 3: Redis-Based Rate Limiting
For distributed deployments:
- Share rate limit state across multiple servers
- More accurate tracking
- Better performance

### Option 4: Exponential Backoff
Progressive rate limiting:
- First 5 failures: No delay
- Next 5 failures: 1 second delay
- Next 5 failures: 5 second delay
- After 15 failures: 15 minute lockout

---

## Monitoring

### Check Rate Limiting Events
```bash
# See rate limit hits (should be rare now)
journalctl -u dotnet-identity.service | grep "Rate limit exceeded"

# Count rate limit events today
journalctl -u dotnet-identity.service --since today | grep -c "Rate limit exceeded"

# See which IPs are getting rate limited
journalctl -u dotnet-identity.service | grep "Rate limit exceeded" | grep -oP 'client: \K[^,]+'
```

### Expected Behavior
- **Normal usage**: No rate limit errors
- **Brute force attack**: Rate limit errors on `/auth/login`
- **Spam registration**: Rate limit errors on `/auth/register`

---

## Summary

✅ **Fixed** - Rate limiting now properly balanced for security and usability:
- **Login/Register**: Protected against brute force (30/min)
- **Auth checks**: No rate limiting (unlimited)
- **Token refresh**: No rate limiting (unlimited)

Your SSO now works smoothly while maintaining security against actual attacks.

---

## Rollback (If Needed)

If you need to revert:

```bash
cd /var/repos/asafarim-dot-be

# Edit the middleware
nano apis/Identity.Api/Middleware/RateLimitingMiddleware.cs

# Change back to:
# MaxRequestsPerMinute = 10
# MaxRequestsPerHour = 100
# Add back /auth/refresh to rate limited endpoints

# Rebuild and restart
dotnet build apis/Identity.Api
sudo systemctl restart dotnet-identity.service
```
