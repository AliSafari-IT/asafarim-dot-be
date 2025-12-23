# SmartOperationsDashboard

A production-ready IoT operations dashboard built with React 18 + TypeScript (frontend) and ASP.NET Core 8 (backend), integrated with the ASafariM monorepo's Identity API for single sign-on (SSO). Provides real-time device telemetry visualization, role-based access control, and comprehensive device management capabilities.

## 🎯 Quick Start

### Prerequisites

- **Node.js** 20+ (for Vite 7 compatibility)
- **.NET 8 SDK** (latest patch)
- **PostgreSQL** 14+ (with `psql` CLI)
- **pnpm** 10+ (recommended) or npm 10+
- **Local domain setup** (optional but recommended):
  ```bash
  # Add to /etc/hosts
  127.0.0.1 smartops.asafarim.local identity.asafarim.local
  ```

### Backend Setup

```bash
# Navigate to backend directory
cd showcases/SmartOperationsDashboard/SmartOps.Api

# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE smartops;"

# Restore from backup (if available)
# psql -U postgres smartops < backup.sql

# Install dependencies and build
dotnet build

# Run with hot-reload
dotnet watch run
```

**Backend runs on:** `http://localhost:5105`  
**Swagger API docs:** `http://localhost:5105/swagger`

### Frontend Setup

```bash
# Navigate to frontend directory
cd showcases/SmartOperationsDashboard/smartops-web

# Install workspace dependencies
pnpm install

# Start development server with local domain
pnpm start
```

**Frontend runs on:** `http://smartops.asafarim.local:5178`  
**API proxy:** `/api` → `http://localhost:5105`  
**Auth proxy:** `/auth` → Identity API

### Verify Setup

1. **Backend health check:**
   ```bash
   curl http://localhost:5105/api/health
   ```

2. **Frontend access:**
   - Open `http://smartops.asafarim.local:5178` in browser
   - You should be redirected to Identity login if not authenticated
   - After login, dashboard should load with device data

## 📋 Architecture

### Backend (ASP.NET Core 8)

**Clean Architecture Layers:**

- **Models** (`Models/`): Core domain entities
  - `Device`: IoT device with metadata (name, serial number, location, status)
  - `Reading`: Telemetry data (temperature, humidity, pressure, power consumption)
  - `UserPermission`: Role-based access control mapping
  - `Enums`: Status, Role, PermissionLevel

- **DTOs** (`Controllers/Dtos/`): Request/response objects for API contracts
  - Device CRUD operations
  - Reading creation and retrieval
  - Permission management

- **Services** (`Services/`): Business logic layer
  - `DeviceService`: Device CRUD, filtering, pagination
  - `ReadingService`: Reading ingestion, aggregation, statistics
  - `PermissionService`: Role validation, access control

- **Controllers** (`Controllers/`): REST API endpoints
  - `DevicesController`: Device management (GET, POST, PUT, DELETE)
  - `ReadingsController`: Telemetry ingestion and retrieval
  - `HealthController`: Service health checks

- **Data** (`Data/`): EF Core DbContext with PostgreSQL
  - Automatic migrations
  - Relationship configuration
  - Seeding for test data

**Key Features:**

- **Authentication**: JWT Bearer tokens from Identity.Api with cookie support
- **Authorization**: Role-based access control (Member, Manager, Admin)
- **Database**: PostgreSQL 14+ with Entity Framework Core 8
- **API Documentation**: Swagger/OpenAPI with interactive UI
- **CORS**: Configured for frontend origin
- **Logging**: Serilog integration for structured logging
- **Validation**: FluentValidation for DTOs

### Frontend (React 18 + TypeScript + Vite)

**Project Structure:**

```
smartops-web/
├── src/
│   ├── api/              # API client configuration
│   │   └── config.ts     # Axios instance with auth headers
│   ├── components/       # Reusable UI components
│   │   ├── Navbar.tsx    # Navigation bar
│   │   └── ...
│   ├── pages/            # Route-level screens
│   │   ├── Dashboard.tsx # Device overview & KPIs
│   │   ├── Devices.tsx   # Device list & CRUD
│   │   └── ...
│   ├── hooks/            # Custom React hooks & Zustand stores
│   │   └── useDevicesStore.ts
│   ├── services/         # REST API wrappers
│   │   ├── deviceService.ts
│   │   └── readingService.ts
│   ├── theme/            # Theming & design tokens
│   ├── App.tsx           # Root layout component
│   └── main.tsx          # Entry point with routing
├── public/               # Static assets
├── vite.config.ts        # Vite configuration with proxies
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies & scripts
└── README.md             # Frontend documentation
```

**Key Features:**

- **UI Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite 7 for fast development and optimized builds
- **State Management**: Zustand for device state, KPIs, and error handling
- **Routing**: React Router 6 for SPA navigation
- **Data Visualization**: Recharts for interactive charts and graphs
- **Shared Components**: `@asafarim/shared-ui-react` for consistent design
- **Design Tokens**: `@asafarim/design-tokens` for theming
- **Internationalization**: `@asafarim/shared-i18n` for multi-language support
- **HTTP Client**: Axios with automatic credential handling

## 🔐 Authentication & Authorization

### SSO Integration with Identity.Api

SmartOperationsDashboard integrates with the ASafariM Identity.Api for single sign-on (SSO):

**Authentication Flow:**

1. User navigates to `http://smartops.asafarim.local:5178`
2. Frontend detects missing authentication and redirects to Identity login
3. User authenticates at `http://identity.asafarim.local:5101`
4. Identity.Api issues JWT token stored in `atk` cookie
5. Frontend automatically includes cookie with all API requests
6. Backend validates JWT signature and claims
7. User is granted access to SmartOps dashboard

**JWT Claims Extraction:**

The backend extracts user identity from JWT claims:

- `sub` - User ID (UUID from Identity.Api)
- `email` - User email address
- `name` - User display name
- `role` - Primary role (Member, Manager, Admin)

**User Permissions:**

SmartOps maintains a `UserPermission` record that maps:
- `AppUserId` (from Identity.Api) → SmartOps role
- Enables fine-grained access control per user
- Allows role changes without re-authentication

### Role-Based Access Control (RBAC)

Three-tier permission model:

| Role | Devices | Readings | Admin |
|------|---------|----------|-------|
| **Member** | View only | View only | No |
| **Manager** | Create, Read, Update | Create, Read, Aggregate | No |
| **Admin** | Full CRUD | Full CRUD, Delete | Yes |

**Permission Enforcement:**

- Backend validates user role on every request
- Unauthorized requests return `403 Forbidden`
- Frontend hides UI elements based on user role
- Audit logging tracks permission-based actions

## 📊 API Endpoints

### Devices Management

**List Devices** (Member+)
```
GET /api/devices?page=1&pageSize=20&status=Active
```
Response: Paginated device list with metadata

**Get Device Details** (Member+)
```
GET /api/devices/{id}
```
Response: Single device with all metadata

**Create Device** (Manager+)
```
POST /api/devices
Content-Type: application/json

{
  "name": "Sensor-01",
  "serialNumber": "SN-12345",
  "location": "Building A, Floor 2",
  "description": "Temperature and humidity sensor",
  "status": "Active"
}
```

**Update Device** (Manager+)
```
PUT /api/devices/{id}
Content-Type: application/json

{
  "name": "Sensor-01-Updated",
  "location": "Building B",
  "status": "Inactive"
}
```

**Delete Device** (Admin only)
```
DELETE /api/devices/{id}
```

### Readings & Telemetry

**List Readings** (Member+)
```
GET /api/readings?deviceId={id}&from=2025-01-01&to=2025-01-31&limit=100
```
Response: Readings sorted by timestamp (newest first)

**Get Reading by ID** (Member+)
```
GET /api/readings/{id}
```

**Latest Reading for Device** (Member+)
```
GET /api/readings/device/{deviceId}/latest
```
Response: Most recent reading with timestamp

**Create Reading** (No authentication - for IoT devices)
```
POST /api/readings
Content-Type: application/json

{
  "deviceId": "uuid",
  "temperature": 22.5,
  "humidity": 45.0,
  "pressure": 1013.25,
  "powerConsumption": 12.5,
  "operationCount": 1000,
  "recordedAt": "2025-01-23T15:30:00Z"
}
```

**Device Statistics** (Member+)
```
GET /api/readings/device/{deviceId}/stats?from=2025-01-01&to=2025-01-31
```
Response: Aggregated metrics (min, max, avg, latest)

### System Health

**Health Check** (No authentication)
```
GET /api/health
```
Response: Service status and dependency health

## 🗄️ Database Schema

### Devices Table
- `Id` (uuid, PK)
- `Name`, `SerialNumber` (unique), `Location`, `Status` (enum)
- `Description`, `CreatedAt`, `UpdatedAt`, `CreatedBy`

### Readings Table
- `Id` (uuid, PK)
- `DeviceId` (FK → Devices, cascade delete)
- `Temperature`, `Humidity`, `Pressure`, `PowerConsumption` (numeric)
- `OperationCount` (int), `RecordedAt`

### UserPermissions Table
- `Id` (uuid, PK)
- `AppUserId` (uuid, unique) - from Identity.Api
- `Role` (string enum), `IsActive` (bool)
- `CreatedAt`, `UpdatedAt`

## 🚀 Deployment

### Environment Configuration

**Backend** (`appsettings.json` / `appsettings.Production.json`):

```json
{
  "ConnectionStrings": {
    "SmartOpsConnection": "Host=smartops-db;Port=5432;Database=smartops;Username=postgres;Password=${DB_PASSWORD};Ssl Mode=Require"
  },
  "AuthJwt": {
    "Key": "${JWT_KEY}",
    "Issuer": "https://identity.asafarim.be",
    "Audience": "smartops.asafarim.be"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  },
  "Cors": {
    "AllowedOrigins": ["https://smartops.asafarim.be"]
  }
}
```

**Frontend** (`.env.production`):

```ini
VITE_IDENTITY_API_URL=https://identity.asafarim.be
VITE_SMARTOPS_API_URL=https://smartops.asafarim.be/api
VITE_APP_ENV=production
```

### Deployment via Monorepo Script

The project is integrated with the monorepo's selective deployment script:

```bash
# From monorepo root
pnpm sd

# Select option for smartops-web when prompted
# The script will:
# 1. Build the frontend with production environment
# 2. Optimize assets and create dist/ bundle
# 3. Deploy to /var/www/asafarim-dot-be/showcases/smartops-web
# 4. Reload nginx configuration
```

### Docker Deployment

**Backend Dockerfile:**

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY . .
RUN dotnet build -c Release

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/bin/Release/net8.0 .
ENV ASPNETCORE_URLS=http://+:5105
EXPOSE 5105
ENTRYPOINT ["dotnet", "SmartOps.Api.dll"]
```

**Frontend Dockerfile:**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1
```

**Docker Compose** (for local multi-container setup):

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: smartops
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  smartops-api:
    build: ./SmartOps.Api
    environment:
      ConnectionStrings__SmartOpsConnection: "Host=postgres;Port=5432;Database=smartops;Username=postgres;Password=${DB_PASSWORD}"
      AuthJwt__Key: ${JWT_KEY}
    ports:
      - "5105:5105"
    depends_on:
      - postgres

  smartops-web:
    build: ./smartops-web
    ports:
      - "80:80"
    depends_on:
      - smartops-api

volumes:
  postgres_data:
```

## 🧪 Testing & Development

### Create Test Data with cURL

**Authenticate first** (get JWT token from Identity.Api):

```bash
# Get token from Identity.Api
TOKEN=$(curl -s -X POST http://identity.asafarim.local:5101/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' | jq -r '.token')
```

**Create a Device:**

```bash
curl -X POST http://localhost:5105/api/devices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Temperature Sensor 01",
    "serialNumber": "SN-2025-001",
    "location": "Building A, Floor 2, Room 201",
    "description": "Monitors ambient temperature and humidity",
    "status": "Active"
  }'
```

**Create a Reading:**

```bash
curl -X POST http://localhost:5105/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "550e8400-e29b-41d4-a716-446655440000",
    "temperature": 22.5,
    "humidity": 45.0,
    "pressure": 1013.25,
    "powerConsumption": 12.5,
    "operationCount": 1000,
    "recordedAt": "2025-01-23T15:30:00Z"
  }'
```

**Query Readings:**

```bash
curl -X GET "http://localhost:5105/api/readings?deviceId=550e8400-e29b-41d4-a716-446655440000&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Unit Testing

```bash
# Backend tests (when available)
cd SmartOps.Api
dotnet test

# Frontend tests (when available)
cd smartops-web
pnpm test
```

## 📚 Documentation

- **[SmartOps Web README](./smartops-web/README.md)** - Frontend architecture and development guide
- **[Backend API Documentation](http://localhost:5105/swagger)** - Interactive Swagger UI (development)
- **[Identity.Api Documentation](https://github.com/asafarim/asafarim-dot-be/tree/main/apis/Identity.Api)** - SSO integration details

## 🔄 Integration with Monorepo

SmartOperationsDashboard is fully integrated with the ASafariM monorepo:

- ✅ **Identity.Api** - Single sign-on and JWT authentication
- ✅ **shared-ui-react** - Consistent UI components and patterns
- ✅ **design-tokens** - Centralized design system
- ✅ **shared-i18n** - Multi-language support
- ✅ **shared-logging** - Structured logging integration
- ✅ **Clean Architecture** - Layered, testable codebase
- ✅ **PostgreSQL** - Persistent data storage
- ✅ **Selective Deployment** - Integrated with `pnpm sd` script

## �️ Development Workflow

### Local Development

1. **Start PostgreSQL:**
   ```bash
   # Using Docker
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
   ```

2. **Start Backend:**
   ```bash
   cd SmartOps.Api
   dotnet watch run
   ```

3. **Start Frontend:**
   ```bash
   cd smartops-web
   pnpm dev
   ```

4. **Access Dashboard:**
   - Open `http://smartops.asafarim.local:5178`
   - Login with Identity.Api credentials
   - Create devices and view telemetry

### Code Style & Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **C#**: Follow Microsoft naming conventions
- **Formatting**: Prettier (frontend), dotnet format (backend)
- **Linting**: ESLint (frontend), StyleCop (backend)
- **Testing**: Unit tests for business logic, E2E tests for workflows

## 🆘 Troubleshooting

### Backend Issues

| Issue | Solution |
|-------|----------|
| **JWT Configuration Error** | Verify `AuthJwt` section in `appsettings.json` matches Identity.Api issuer/audience |
| **Database Connection Failed** | Check PostgreSQL is running, verify connection string, run `dotnet ef database update` |
| **401 Unauthorized** | Verify `atk` cookie exists in browser, check token expiration, ensure user has `UserPermission` record |
| **CORS Error** | Verify `appsettings.json` CORS policy includes frontend origin |
| **Port Already in Use** | Change port in `appsettings.json` or kill process: `lsof -i :5105` |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| **Authentication Redirect Loop** | Clear browser cookies, verify Identity.Api URL in `.env`, check CORS headers |
| **API Network Errors** | Verify backend is running on `localhost:5105`, check Vite proxy configuration |
| **Module Not Found** | Run `pnpm install` from monorepo root, restart dev server |
| **Blank Dashboard** | Check browser console for errors, verify user has `Member` role or higher |
| **Slow Performance** | Clear browser cache, rebuild frontend: `pnpm build`, check network tab for large assets |

### Common Solutions

**Clear Cache & Restart:**
```bash
# Frontend
rm -rf node_modules dist .vite
pnpm install
pnpm dev

# Backend
dotnet clean
dotnet build
dotnet watch run
```

**Reset Database:**
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE smartops;"
psql -U postgres -c "CREATE DATABASE smartops;"
dotnet ef database update
```

**Check Service Health:**
```bash
# Backend health
curl http://localhost:5105/api/health

# Frontend (if running)
curl http://smartops.asafarim.local:5178/health
```

## 📞 Support & Resources

- **Monorepo Issues**: Check [asafarim-dot-be](https://github.com/asafarim/asafarim-dot-be) repository
- **Identity.Api Help**: See [Identity.Api README](../../../apis/Identity.Api/README.md)
- **Architecture Questions**: Review [TaskManagement](../TaskManagement/) showcase for similar patterns
- **Deployment Issues**: Consult ops documentation or contact DevOps team
