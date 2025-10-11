# SSO V2 - Flow Diagrams

## Authentication Flows

### 1. Registration Flow

```
┌─────────┐                  ┌──────────────┐                 ┌──────────┐
│ Client  │                  │ AuthController│                 │ Database │
└────┬────┘                  └──────┬───────┘                 └────┬─────┘
     │                              │                              │
     │ POST /auth/register          │                              │
     │ {email, password, userName}  │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ Validate input               │
     │                              │ Check if user exists         │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │<─────────────────────────────┤
     │                              │ User not found (good!)       │
     │                              │                              │
     │                              │ Create user with password    │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │<─────────────────────────────┤
     │                              │ User created                 │
     │                              │                              │
     │                              │ Generate JWT (TokenService)  │
     │                              │                              │
     │                              │ Create refresh token         │
     │                              ├─────────────────────────────>│
     │                              │ Store with IP & expiry       │
     │                              │                              │
     │                              │<─────────────────────────────┤
     │                              │ Token stored                 │
     │                              │                              │
     │                              │ Set cookies (atk, rtk)       │
     │<─────────────────────────────┤                              │
     │ 200 OK + tokens + user info  │                              │
     │ Set-Cookie: atk=...          │                              │
     │ Set-Cookie: rtk=...          │                              │
     │                              │                              │
```

---

### 2. Login Flow

```
┌─────────┐                  ┌──────────────┐                 ┌──────────┐
│ Client  │                  │ AuthController│                 │ Database │
└────┬────┘                  └──────┬───────┘                 └────┬─────┘
     │                              │                              │
     │ POST /auth/login             │                              │
     │ {email, password, rememberMe}│                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ Find user by email           │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │<─────────────────────────────┤
     │                              │ User found                   │
     │                              │                              │
     │                              │ Check password (UserManager) │
     │                              │                              │
     │                              │ ✓ Password valid             │
     │                              │                              │
     │                              │ Reset failed attempt count   │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │ Generate JWT (TokenService)  │
     │                              │                              │
     │                              │ Create refresh token         │
     │                              ├─────────────────────────────>│
     │                              │ Store with IP & expiry       │
     │                              │                              │
     │                              │<─────────────────────────────┤
     │                              │ Token stored                 │
     │                              │                              │
     │                              │ Set cookies (persistent?)    │
     │<─────────────────────────────┤                              │
     │ 200 OK + tokens + user info  │                              │
     │ Set-Cookie: atk=...          │                              │
     │ Set-Cookie: rtk=...          │                              │
     │                              │                              │
```

---

### 3. Token Refresh Flow (NEW!)

```
┌─────────┐                  ┌──────────────┐                 ┌──────────┐
│ Client  │                  │ AuthController│                 │ Database │
└────┬────┘                  └──────┬───────┘                 └────┬─────┘
     │                              │                              │
     │ POST /auth/refresh           │                              │
     │ Cookie: rtk=<refresh-token>  │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ Get refresh token from cookie│
     │                              │                              │
     │                              │ Validate token               │
     │                              ├─────────────────────────────>│
     │                              │ SELECT * FROM RefreshTokens  │
     │                              │ WHERE Token = ? AND          │
     │                              │ IsRevoked = false AND        │
     │                              │ ExpiresAt > NOW()            │
     │                              │                              │
     │                              │<─────────────────────────────┤
     │                              │ Token valid + User data      │
     │                              │                              │
     │                              │ Generate new JWT             │
     │                              │                              │
     │                              │ Create new refresh token     │
     │                              ├─────────────────────────────>│
     │                              │ INSERT new token             │
     │                              │                              │
     │                              │ Revoke old token             │
     │                              ├─────────────────────────────>│
     │                              │ UPDATE old token             │
     │                              │ SET IsRevoked = true,        │
     │                              │ RevokedAt = NOW(),           │
     │                              │ ReplacedByToken = new_token  │
     │                              │                              │
     │                              │<─────────────────────────────┤
     │                              │ Rotation complete            │
     │                              │                              │
     │                              │ Set new cookies              │
     │<─────────────────────────────┤                              │
     │ 200 OK + new tokens          │                              │
     │ Set-Cookie: atk=<new>        │                              │
     │ Set-Cookie: rtk=<new>        │                              │
     │                              │                              │
```

---

### 4. Logout Flow

```
┌─────────┐                  ┌──────────────┐                 ┌──────────┐
│ Client  │                  │ AuthController│                 │ Database │
└────┬────┘                  └──────┬───────┘                 └────┬─────┘
     │                              │                              │
     │ POST /auth/logout            │                              │
     │ Cookie: rtk=<refresh-token>  │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ Get refresh token from cookie│
     │                              │                              │
     │                              │ Revoke token                 │
     │                              ├─────────────────────────────>│
     │                              │ UPDATE RefreshTokens         │
     │                              │ SET IsRevoked = true,        │
     │                              │ RevokedAt = NOW(),           │
     │                              │ RevokedByIp = <ip>           │
     │                              │ WHERE Token = ?              │
     │                              │                              │
     │                              │<─────────────────────────────┤
     │                              │ Token revoked                │
     │                              │                              │
     │                              │ Clear cookies                │
     │<─────────────────────────────┤                              │
     │ 200 OK                       │                              │
     │ Set-Cookie: atk=; Expires=-1 │                              │
     │ Set-Cookie: rtk=; Expires=-1 │                              │
     │ Clear-Site-Data: "cookies"   │                              │
     │                              │                              │
```

---

### 5. Rate Limiting Flow

```
┌─────────┐              ┌──────────────────┐              ┌──────────────┐
│ Client  │              │ RateLimitMiddleware│            │ AuthController│
└────┬────┘              └────────┬─────────┘              └──────┬───────┘
     │                            │                               │
     │ POST /auth/login           │                               │
     ├───────────────────────────>│                               │
     │                            │                               │
     │                            │ Get client IP                 │
     │                            │ (from X-Forwarded-For)        │
     │                            │                               │
     │                            │ Check request count           │
     │                            │ - Last minute: 3 requests     │
     │                            │ - Last hour: 15 requests      │
     │                            │                               │
     │                            │ ✓ Under limit                 │
     │                            │                               │
     │                            │ Add request timestamp         │
     │                            │                               │
     │                            │ Continue to controller        │
     │                            ├──────────────────────────────>│
     │                            │                               │
     │                            │                               │ (Process
     │                            │<──────────────────────────────┤  login)
     │<───────────────────────────┤                               │
     │ 200 OK                     │                               │
     │                            │                               │
     │                            │                               │
     │ POST /auth/login (11th)    │                               │
     ├───────────────────────────>│                               │
     │                            │                               │
     │                            │ Check request count           │
     │                            │ - Last minute: 11 requests ❌ │
     │                            │                               │
     │                            │ RATE LIMIT EXCEEDED           │
     │<───────────────────────────┤                               │
     │ 429 Too Many Requests      │                               │
     │ Retry-After: 60            │                               │
     │ {message, retryAfter}      │                               │
     │                            │                               │
```

---

### 6. Account Lockout Flow

```
┌─────────┐                  ┌──────────────┐                 ┌──────────┐
│ Client  │                  │ AuthController│                 │ Database │
└────┬────┘                  └──────┬───────┘                 └────┬─────┘
     │                              │                              │
     │ POST /auth/login (attempt 1) │                              │
     │ {email, wrong_password}      │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ Find user                    │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │ Check password ❌            │
     │                              │                              │
     │                              │ Increment failed count (1)   │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │<─────────────────────────────┤                              │
     │ 401 Unauthorized             │                              │
     │                              │                              │
     │                              │                              │
     │ ... (attempts 2-4) ...       │                              │
     │                              │                              │
     │                              │                              │
     │ POST /auth/login (attempt 5) │                              │
     │ {email, wrong_password}      │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ Find user                    │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │ Check password ❌            │
     │                              │                              │
     │                              │ Increment failed count (5)   │
     │                              ├─────────────────────────────>│
     │                              │ ACCOUNT LOCKED               │
     │                              │ LockoutEnd = NOW() + 15min   │
     │                              │                              │
     │<─────────────────────────────┤                              │
     │ 401 Unauthorized             │                              │
     │                              │                              │
     │                              │                              │
     │ POST /auth/login (attempt 6) │                              │
     │ {email, correct_password}    │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ Find user                    │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │ Check if locked ✓            │
     │                              │ LockoutEnd > NOW()           │
     │                              │                              │
     │<─────────────────────────────┤                              │
     │ 401 Unauthorized             │                              │
     │ "Account is locked"          │                              │
     │                              │                              │
     │                              │                              │
     │ ... (wait 15 minutes) ...    │                              │
     │                              │                              │
     │                              │                              │
     │ POST /auth/login             │                              │
     │ {email, correct_password}    │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ Find user                    │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │ Check if locked ❌           │
     │                              │ LockoutEnd < NOW()           │
     │                              │                              │
     │                              │ Check password ✓             │
     │                              │                              │
     │                              │ Reset failed count to 0      │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │<─────────────────────────────┤                              │
     │ 200 OK + tokens              │                              │
     │                              │                              │
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Apps                           │
│  (web, ai, blog, identity-portal)                              │
│                                                                 │
│  - React/TypeScript                                            │
│  - useAuth hook from @asafarim/shared-ui-react                │
│  - Cookies: atk (access token), rtk (refresh token)           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS (Production)
                         │ HTTP (Development)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    Nginx Reverse Proxy                          │
│                                                                 │
│  - SSL Termination                                             │
│  - X-Forwarded-For, X-Forwarded-Proto headers                 │
│  - Load balancing (future)                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Identity.Api (ASP.NET Core)                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Middleware Pipeline                                     │  │
│  │  1. ForwardedHeaders (detect HTTPS)                     │  │
│  │  2. RateLimiting (10/min, 100/hour)                     │  │
│  │  3. CORS (allow credentials)                            │  │
│  │  4. Authentication (JWT from cookie)                    │  │
│  │  5. Authorization (roles, policies)                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Controllers                                             │  │
│  │  - AuthController (login, register, refresh, etc.)      │  │
│  │  - AdminController (user management)                    │  │
│  │  - UsersController (profile management)                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Services                                                │  │
│  │  - ITokenService (JWT creation & validation)            │  │
│  │  - IRefreshTokenService (token rotation & revocation)   │  │
│  │  - UserManager (ASP.NET Identity)                       │  │
│  │  - SignInManager (ASP.NET Identity)                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Data Layer                                              │  │
│  │  - AppDbContext (Entity Framework Core)                 │  │
│  │  - Connection pooling & retry logic                     │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Npgsql
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│                                                                 │
│  Tables:                                                        │
│  - AspNetUsers (user accounts)                                 │
│  - AspNetRoles (roles)                                         │
│  - AspNetUserRoles (user-role mapping)                         │
│  - RefreshTokens (NEW! token storage & rotation)              │
│                                                                 │
│  Indexes:                                                       │
│  - RefreshTokens.Token (unique)                                │
│  - RefreshTokens.UserId                                        │
│  - RefreshTokens.ExpiresAt                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Dependencies

```
AuthController
    ├── UserManager<AppUser>
    │   └── AppDbContext
    │       └── PostgreSQL
    │
    ├── SignInManager<AppUser>
    │   └── UserManager<AppUser>
    │
    ├── ITokenService
    │   └── AuthOptions (configuration)
    │
    └── IRefreshTokenService
        └── AppDbContext
            └── PostgreSQL
```

---

## Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      Token Lifecycle                            │
└─────────────────────────────────────────────────────────────────┘

1. Creation (Login/Register)
   ┌──────────────────────────────────────────────────────┐
   │ Access Token (JWT)          Refresh Token            │
   │ - Created by TokenService   - Created by RefreshSvc  │
   │ - Lifetime: 60 minutes      - Lifetime: 30 days      │
   │ - Stored in: Cookie (atk)   - Stored in: DB + Cookie │
   │ - Contains: user claims     - Contains: random bytes │
   └──────────────────────────────────────────────────────┘
                         │
                         ▼
2. Usage (Every Request)
   ┌──────────────────────────────────────────────────────┐
   │ Client sends cookie with atk                         │
   │ JWT middleware validates token                       │
   │ If valid: User.Identity populated                    │
   │ If expired: 401 Unauthorized                         │
   └──────────────────────────────────────────────────────┘
                         │
                         ▼
3. Refresh (Before Expiry)
   ┌──────────────────────────────────────────────────────┐
   │ Client sends rtk cookie                              │
   │ RefreshTokenService validates token                  │
   │ If valid:                                            │
   │   - Generate new access token                        │
   │   - Create new refresh token                         │
   │   - Revoke old refresh token                         │
   │   - Update cookies                                   │
   └──────────────────────────────────────────────────────┘
                         │
                         ▼
4. Revocation (Logout)
   ┌──────────────────────────────────────────────────────┐
   │ Client calls /auth/logout                            │
   │ RefreshTokenService marks token as revoked           │
   │ Cookies cleared (Expires = -1)                       │
   │ Clear-Site-Data header sent                          │
   └──────────────────────────────────────────────────────┘
                         │
                         ▼
5. Cleanup (Periodic)
   ┌──────────────────────────────────────────────────────┐
   │ Background job (future enhancement)                  │
   │ Delete tokens expired > 60 days ago                  │
   │ Keeps database clean                                 │
   └──────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                            │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Network
├── HTTPS (TLS 1.2+)
├── Nginx reverse proxy
└── Firewall rules

Layer 2: Rate Limiting
├── 10 requests/minute per IP
├── 100 requests/hour per IP
└── Applied to auth endpoints

Layer 3: Authentication
├── JWT with HMAC-SHA256
├── HttpOnly cookies (XSS protection)
├── Secure flag (HTTPS only)
└── SameSite=None (cross-subdomain)

Layer 4: Authorization
├── Role-based access control
├── Policy-based authorization
└── Resource-based permissions

Layer 5: Account Protection
├── Password requirements (8+ chars, complexity)
├── Account lockout (5 attempts, 15 min)
├── Failed attempt tracking
└── IP address logging

Layer 6: Token Security
├── Cryptographic RNG (64 bytes)
├── Token rotation on refresh
├── Database-backed revocation
├── Expiration enforcement
└── Algorithm verification

Layer 7: Audit & Monitoring
├── Comprehensive logging
├── IP address tracking
├── Failed attempt monitoring
└── Anomaly detection (future)
```

---

This visual guide helps understand the complete flow and architecture of SSO V2.
