# SmartOperationsDashboard

A production-ready IoT operations dashboard built with React 18 + TypeScript (frontend) and ASP.NET Core 8 (backend), integrated with the ASafariM monorepo's Identity API for SSO.

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- PostgreSQL 12+
- pnpm (or npm)

### Backend Setup

```bash
# Navigate to backend
cd SmartOps.Api

# Create database
psql -U postgres -c "CREATE DATABASE smartops;"

# Build and run
dotnet build
dotnet watch run
```

Backend runs on: `http://localhost:5180`
Swagger UI: `http://localhost:5180/swagger`

### Frontend Setup

```bash
# Navigate to frontend
cd smartops-web

# Install dependencies
pnpm install

# Start dev server
pnpm start
```

Frontend runs on: `http://smartops.asafarim.local:5180`

## 📋 Architecture

### Backend (ASP.NET Core 8)

**Clean Architecture Layers:**
- **Models**: Device, Reading, UserPermission, enums
- **DTOs**: Request/response objects for API communication
- **Services**: Business logic (PermissionService, DeviceService, ReadingService)
- **Controllers**: API endpoints (Devices, Readings, Health)
- **Data**: EF Core DbContext with PostgreSQL

**Key Features:**
- JWT Bearer authentication from Identity.Api
- Role-based access control (Member, Manager, Admin)
- PostgreSQL database with automatic migrations
- CORS configured for frontend
- Swagger/OpenAPI documentation

### Frontend (React 18 + TypeScript)

**Project Structure:**
```
src/
├── api/
│   ├── config.ts           # API configuration
│   ├── deviceService.ts    # Device API client
│   └── readingService.ts   # Reading API client
├── components/             # Reusable components (to be created)
├── pages/                  # Page components (to be created)
├── hooks/                  # Custom hooks (to be created)
├── App.tsx                 # Main app component
├── App.css                 # App styles
├── index.css               # Global styles
└── main.tsx                # React entry point
```

**Key Features:**
- Shared UI components from @asafarim/shared-ui-react
- Shared design tokens (no Tailwind)
- Recharts for data visualization
- React Router for navigation
- TypeScript for type safety

## 🔐 Authentication

### SSO Integration

SmartOperationsDashboard integrates with Identity.Api for single sign-on:

1. **User Identity**: Extracted from JWT claims
   - `sub` - User ID (from Identity.Api)
   - `email` - User email
   - `role` - User role (Member, Manager, Admin)

2. **User Permissions**: Stored in SmartOps database
   - Maps AppUserId (from Identity.Api) to SmartOps role
   - Allows role-based access control

3. **Authentication Flow**:
   - User logs in at `http://identity.asafarim.local:5177`
   - JWT token stored in `atk` cookie
   - Cookie sent with all API requests
   - Backend validates token and checks permissions

### Role-Based Access Control

- **Member**: View-only access to devices and readings
- **Manager**: Can create/update devices, manage readings
- **Admin**: Full access including device deletion

## 📊 API Endpoints

### Devices
- `GET /api/devices` - List devices with pagination/filtering
- `GET /api/devices/{id}` - Get device by ID
- `POST /api/devices` - Create device (Manager+)
- `PUT /api/devices/{id}` - Update device (Manager+)
- `DELETE /api/devices/{id}` - Delete device (Admin only)

### Readings
- `GET /api/readings` - List readings with filtering
- `GET /api/readings/{id}` - Get reading by ID
- `GET /api/readings/device/{deviceId}/latest` - Latest reading for device
- `POST /api/readings` - Create reading (no auth - for devices)
- `GET /api/readings/device/{deviceId}/stats` - Statistics for device

### Health
- `GET /api/health` - Health check (no auth)

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

### Environment Variables

**Backend** (`appsettings.json`):
```json
{
  "ConnectionStrings": {
    "SmartOpsConnection": "Host=smartops-db;Port=5432;Database=smartops;Username=postgres;Password=${DB_PASSWORD}"
  },
  "AuthJwt": {
    "Key": "0+a0ZklJy6DVL6osEj73W6P9inMk3-Ocn8KkQoUDR78=",
    "Issuer": "asafarim.be",
    "Audience": "asafarim.be"
  }
}
```

**Frontend** (`.env.production`):
```
VITE_API_URL=https://smartops.asafarim.be/api
```

### Docker

Backend:
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY . .
RUN dotnet build -c Release

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/bin/Release/net8.0 .
EXPOSE 5180
ENTRYPOINT ["dotnet", "SmartOps.Api.dll"]
```

Frontend:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## 🧪 Testing

### Create Test Data

```bash
# Create device
curl -X POST http://localhost:5105/api/devices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sensor-01",
    "serialNumber": "SN-001",
    "location": "Building A",
    "description": "Temperature sensor"
  }'

# Create reading
curl -X POST http://localhost:5105/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "<device-id>",
    "temperature": 22.5,
    "humidity": 45.0,
    "pressure": 1013.25,
    "powerConsumption": 12.5,
    "operationCount": 100
  }'
```

## 📚 Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup and configuration guide
- [Backend API Documentation](http://localhost:5105/swagger) - Swagger UI (development)

## 🔄 Integration with Monorepo

- ✅ Uses Identity.Api for SSO
- ✅ Uses shared-ui-react components
- ✅ Uses shared-tokens for design
- ✅ Uses shared-i18n for internationalization
- ✅ Follows TaskManagement architecture pattern
- ✅ JWT authentication with cookie support
- ✅ PostgreSQL database
- ✅ Clean architecture principles

## 📝 Next Steps

### Frontend Components (Phase 2)
- [ ] Dashboard page with device overview
- [ ] DeviceList page with CRUD operations
- [ ] DeviceDetail page with readings chart
- [ ] ReadingsChart component (Recharts)
- [ ] MetricsGrid component

### Backend Enhancements (Phase 2+)
- [ ] SignalR hub for real-time updates
- [ ] File upload for device attachments
- [ ] Advanced filtering and search
- [ ] Batch operations
- [ ] Audit logging

### Testing & Deployment
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] E2E tests with Playwright
- [ ] CI/CD pipeline setup
- [ ] Performance optimization

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow clean architecture principles
4. Add tests for new features
5. Update documentation

## 📄 License

Part of the ASafariM monorepo project.

## 🆘 Troubleshooting

### Backend Issues

**JWT Configuration Error**
- Ensure `AuthJwt` section exists in `appsettings.json`
- Check issuer/audience match between Identity.Api and SmartOps.Api

**Database Connection Error**
- Verify PostgreSQL is running
- Check connection string in `appsettings.Development.json`
- Run `dotnet ef database update` to apply migrations

**401 Unauthorized**
- Verify `atk` cookie is being sent with requests
- Check JWT token expiration
- Ensure user has `UserPermission` record in database

### Frontend Issues

**CORS Error**
- Verify backend CORS policy includes frontend origin
- Check `appsettings.json` for allowed origins

**Authentication Not Working**
- Verify Identity.Api is running
- Check browser cookies for `atk` token
- Verify frontend auth configuration

**Module Not Found**
- Run `pnpm install` to install dependencies
- Restart dev server after installing packages

## 📞 Support

For issues or questions, refer to the [SETUP_GUIDE.md](./SETUP_GUIDE.md) or check the monorepo documentation.
