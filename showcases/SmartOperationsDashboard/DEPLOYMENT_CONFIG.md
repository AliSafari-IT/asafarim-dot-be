# SmartOperationsDashboard Deployment Configuration

## ✅ Configuration Files Created

### Frontend (smartops-web)

#### `.env` (Development)
```
VITE_IDENTITY_API_URL=http://identity.asafarim.local:5101
VITE_SMARTOPS_API_URL=http://localhost:5105/api
```

#### `.env.production` (Production)
```
VITE_IDENTITY_API_URL=https://identity.asafarim.be
VITE_SMARTOPS_API_URL=https://smartops.asafarim.be/api
```

#### `.env.local` (Local Overrides - Not Committed)
Template for local development overrides.

#### `src/api/config.ts` (Updated)
- Now reads `VITE_SMARTOPS_API_URL` and `VITE_IDENTITY_API_URL` from environment variables
- Falls back to hardcoded URLs if env vars not set
- Exports `API_BASE_URL`, `IDENTITY_API_URL`, `API_CONFIG`, `API_CONFIG_IDENTITY`

### Backend (SmartOps.Api)

#### `appsettings.json` (Development)
```json
{
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*",
  "ConnectionStrings": { "SmartOpsConnection": "Host=localhost;Port=5432;Database=smartops;Username=postgres;Password=Ali+123456/" },
  "AuthJwt": {
    "Key": "0+a0ZklJy6DVL6osEj73W6P9inMk3+Ocn8KkQoUDR78=",
    "Issuer": "asafarim.be",
    "Audience": "asafarim.be"
  }
}
```

#### `appsettings.Production.json` (Production)
- Same database connection string (update as needed for production)
- Enhanced JWT settings with AccessMinutes, RefreshDays, ExpiresInMinutes, CookieDomain
- Kestrel endpoint configured for `http://localhost:5105`
- Enhanced logging for EF Core database commands

#### `Properties/launchSettings.json` (Updated)
- Added `launchUrl: "api/health"` for health check endpoint

### Nginx Configuration

#### `/etc/nginx/snippets/asafarim/api-routes.conf` (Updated)
Added new location block for SmartOps API:
```nginx
location /api/smartops/ {
  proxy_pass http://127.0.0.1:5105/api/;
  # ... standard proxy headers and CORS pass-through
}
```

**Routing:**
- Frontend calls: `https://smartops.asafarim.be/api/smartops/...`
- Nginx strips `/api/smartops` prefix
- Proxies to: `http://127.0.0.1:5105/api/...`

## 🚀 Deployment Script Integration

The app is already configured in `/var/repos/asafarim-dot-be/scripts/selective-deploy.sh`:

**Frontend:**
```bash
["smartops-web"]="showcases/SmartOperationsDashboard/smartops-web/dist"
```

**Backend:**
```bash
["SmartOps.Api"]="showcases/SmartOperationsDashboard/SmartOps.Api/SmartOps.Api.csproj"
["SmartOps.Api"]="$SITE_ROOT/apis/smartops"
["SmartOps.Api"]="dotnet-smartops"
```

## 📋 Deployment Steps

### Development
```bash
# Frontend
cd showcases/SmartOperationsDashboard/smartops-web
pnpm install
pnpm build

# Backend
cd showcases/SmartOperationsDashboard/SmartOps.Api
dotnet build -c Release
dotnet run
```

### Production (via pnpm sd)
```bash
pnpm sd
# Select: smartops-web (option 8) and SmartOps.Api (option 5)
```

## 🔗 URLs

### Development
- **Frontend:** `http://smartops.asafarim.local:5178`
- **Backend:** `http://localhost:5105`
- **Swagger:** `http://localhost:5105/swagger`

### Production
- **Frontend:** `https://smartops.asafarim.be`
- **Backend:** `https://smartops.asafarim.be/api/smartops/`
- **Swagger:** `https://smartops.asafarim.be/api/smartops/swagger`

## 🔐 Authentication

- Uses JWT tokens from Identity.Api
- Token stored in `atk` cookie
- CORS configured for both dev and production origins
- Role-based access control: Member, Manager, Admin

## 📦 Database

- **Database:** PostgreSQL (smartops)
- **Connection:** `Host=localhost;Port=5432;Database=smartops;Username=postgres;Password=Ali+123456/`
- **Migrations:** Auto-applied on API startup

## ✅ Ready for Deployment

All configuration files are in place. Run `pnpm sd` to deploy both frontend and backend.
