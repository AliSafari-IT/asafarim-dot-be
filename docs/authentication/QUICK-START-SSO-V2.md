# SSO V2 - Quick Start Guide

## 🚀 Ready to Use!

Your SSO has been completely rebuilt with professional best practices. Here's everything you need to know in 2 minutes.

---

## ✅ What Changed

- **Refresh tokens** now stored in database with rotation
- **Rate limiting** protects against brute force (10/min, 100/hour)
- **Account lockout** after 5 failed login attempts
- **Better security** with IP tracking and audit trails
- **Cleaner code** with service-based architecture

---

## 🧪 Test It Now

```bash
cd /var/repos/asafarim-dot-be
./test-sso-v2.sh
```

This runs automated tests for all auth flows.

---

## 🔧 Run Locally

```bash
cd apis/Identity.Api
dotnet run
```

Then visit: `http://localhost:5101/swagger`

---

## 📋 API Endpoints (Same as Before)

All your existing endpoints work exactly the same:

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user
- `GET /auth/token` - Get access token
- `POST /auth/refresh` - Refresh token
- `POST /auth/setup-password` - Setup password

**New endpoint:**
- `POST /auth/revoke-all` - Logout from all devices

---

## 🎯 Frontend Changes Required

**None!** Your frontend code works without any changes.

Cookies are set/read the same way. All endpoints are backward compatible.

---

## 🔐 Security Features

### Rate Limiting
- 10 requests per minute per IP
- 100 requests per hour per IP
- Applied to login, register, and refresh endpoints

### Account Lockout
- 5 failed login attempts = 15 minute lockout
- Automatic unlock after timeout

### Token Rotation
- New refresh token on every refresh
- Old token automatically revoked
- Prevents token reuse attacks

### IP Tracking
- All auth operations tracked by IP
- Useful for security audits
- Check logs: `journalctl -u dotnet-identity.service | grep "IP"`

---

## 📊 Monitor It

### Check Service Status
```bash
sudo systemctl status dotnet-identity.service
```

### View Logs
```bash
# Real-time
journalctl -u dotnet-identity.service -f

# Recent errors
journalctl -u dotnet-identity.service -p err -n 20

# Login events
journalctl -u dotnet-identity.service | grep "logged in"
```

### Database Queries
```sql
-- Active sessions
SELECT COUNT(*) FROM "RefreshTokens" 
WHERE "IsRevoked" = false AND "ExpiresAt" > NOW();

-- Sessions per user
SELECT "UserId", COUNT(*) 
FROM "RefreshTokens"
WHERE "IsRevoked" = false 
GROUP BY "UserId";
```

---

## 🚨 Troubleshooting

### Build Fails
```bash
dotnet clean apis/Identity.Api
dotnet build apis/Identity.Api
```

### Migration Issues
```bash
# Check database connection
psql -U postgres -d asafarim_identity -c "SELECT 1;"

# Reapply migration
dotnet ef database update --project apis/Identity.Api
```

### Service Won't Start
```bash
# Check logs
journalctl -u dotnet-identity.service -n 50

# Restart
sudo systemctl restart dotnet-identity.service
```

### Rate Limiting Too Strict
Edit `apis/Identity.Api/Middleware/RateLimitingMiddleware.cs`:
```csharp
private const int MaxRequestsPerMinute = 20; // Increase
private const int MaxRequestsPerHour = 200;  // Increase
```

---

## 🔄 Rollback (If Needed)

```bash
# Restore old controller
cp apis/Identity.Api/Controllers/AuthController.cs.backup \
   apis/Identity.Api/Controllers/AuthController.cs

# Rollback migration
dotnet ef database update InitIdentity --project apis/Identity.Api

# Rebuild and restart
dotnet build apis/Identity.Api
sudo systemctl restart dotnet-identity.service
```

---

## 📚 Full Documentation

- **Complete guide**: `docs/architecture/SSO-V2-IMPLEMENTATION.md`
- **Summary**: `SSO-V2-SUMMARY.md`
- **Architecture**: `docs/architecture/SSO-ARCHITECTURE.md`

---

## ✨ Key Benefits

| Feature | Before | After |
|---------|--------|-------|
| Refresh tokens | In-memory GUID | Database with rotation |
| Rate limiting | None | 10/min, 100/hour |
| Account lockout | None | 5 attempts, 15 min |
| Token security | Basic | Cryptographic RNG |
| IP tracking | None | Full audit trail |
| Session management | None | Revoke all sessions |
| Code quality | Mixed concerns | Service-based |

---

## 🎉 You're Done!

Your SSO is now production-ready with enterprise-grade security.

**No frontend changes needed** - everything works as before, just better and more secure.

Run `./test-sso-v2.sh` to verify everything works!
