# Identity API

A comprehensive ASP.NET Core 8.0 identity and access management (IAM) API built with Entity Framework Core, PostgreSQL, and JWT authentication. The Identity API provides secure user authentication, authorization, role-based access control (RBAC), and user management capabilities for the Asafarim ecosystem.

## Overview

The Identity API is a RESTful web service that serves as the central authentication and authorization hub for all Asafarim applications. It provides secure user registration, login, token management, password reset, role management, and administrative user operations.

**Key Features:**
- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC)
- User registration and login
- Password setup and reset functionality
- Email notifications via SMTP
- Admin user management
- User preferences management
- Health check endpoints
- Structured logging with Serilog
- PostgreSQL database with Entity Framework Core
- Rate limiting and correlation ID middleware
- Reverse proxy support with forwarded headers

## Tech Stack

- **Framework:** ASP.NET Core 8.0
- **Language:** C# with .NET 8.0
- **Database:** PostgreSQL 8.0
- **ORM:** Entity Framework Core 8.0
- **Authentication:** JWT Bearer tokens with ASP.NET Core Identity
- **Email:** MailKit 4.14.1
- **Logging:** Serilog 8.0 with Console and File sinks
- **API Documentation:** Swagger/OpenAPI
- **Package Manager:** pnpm 10.20.0

## Project Structure

```
Identity.Api/
├── Controllers/                    # API Controllers
│   ├── AdminController.cs          # Admin user management endpoints
│   ├── AuthController.cs           # Authentication endpoints (login, register, token refresh)
│   ├── HealthController.cs         # Health check endpoints
│   ├── PreferencesController.cs    # User preferences management
│   ├── RolesController.cs          # Role management endpoints
│   └── UsersController.cs          # User profile endpoints
├── DTOs/                           # Data Transfer Objects
│   ├── AdminResetPasswordRequest.cs # Admin password reset DTO
│   ├── RoleDto.cs                  # Role data transfer object
│   └── UserPreferencesDto.cs       # User preferences DTO
├── Entities/                       # Domain entities
│   ├── PasswordSetupToken.cs       # Password setup token entity
│   └── RefreshToken.cs             # Refresh token entity
├── Extensions/                     # Extension methods
│   ├── LoggingExtensions.cs        # Logging configuration extensions
│   └── MigrationExtensions.cs      # Database migration extensions
├── Middleware/                     # Custom middleware
│   ├── CorrelationIdMiddleware.cs  # Request correlation tracking
│   └── RateLimitingMiddleware.cs   # API rate limiting
├── Migrations/                     # EF Core database migrations
├── Services/                       # Business logic services
│   ├── EmailService.cs             # Email sending service
│   ├── PasswordSetupTokenService.cs # Password setup token management
│   ├── RefreshTokenService.cs      # Refresh token management
│   └── SmartOpsRoleService.cs      # Role management service
├── sql-scripts/                    # SQL utility scripts
├── AppDbContext.cs                 # Entity Framework database context
├── AppUser.cs                      # Application user entity
├── AuthOptions.cs                  # JWT authentication options
├── Models.cs                       # Request/response models
├── Program.cs                      # Application entry point and configuration
├── TokenService.cs                 # JWT token generation and validation
├── SetupPasswordRequest.cs         # Password setup request model
├── appsettings.json                # Application configuration
├── appsettings.Production.json     # Production configuration
└── Identity.Api.csproj             # Project file
```

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- PostgreSQL 8.0+
- Node.js 18+ and pnpm (for npm scripts)
- SMTP server for email notifications

### Installation

1. Install dependencies:
```bash
pnpm install
dotnet restore
```

2. Configure database connection and settings (see Configuration section)

3. Apply database migrations:
```bash
dotnet ef database update
```

### Development

Start the development server with hot reload:

```bash
pnpm dev
# or
pnpm api
```

The API will be available at:
- HTTP: `http://localhost:5101`
- HTTPS: `https://localhost:5101`

### Building

Build the project:

```bash
pnpm build
# or
dotnet build Identity.Api.csproj
```

### Running

Start the production server:

```bash
pnpm start
# or
dotnet run --project Identity.Api.csproj
```

## Configuration

### Environment Variables

The application uses `appsettings.json` and `appsettings.Production.json` for configuration.

### Database Configuration

**Connection Strings:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=asafarim;Username=postgres;Password=your_password",
    "JobsConnection": "Host=localhost;Port=5432;Database=jobs;Username=postgres;Password=your_password",
    "SharedConnection": "Host=localhost;Port=5432;Database=shared_db;Username=postgres;Password=your_password"
  }
}
```

### JWT Authentication Configuration

```json
{
  "AuthJwt": {
    "Key": "your-secret-key-minimum-32-characters-long",
    "Issuer": "asafarim.be",
    "Audience": "asafarim.be",
    "AccessMinutes": 60,
    "RefreshDays": 30,
    "ExpiresInMinutes": 1440,
    "CookieDomain": ".asafarim.be"
  }
}
```

**Configuration Options:**
- `Key`: Secret key for signing JWT tokens (minimum 32 characters)
- `Issuer`: Token issuer identifier
- `Audience`: Token audience identifier
- `AccessMinutes`: Access token expiration time in minutes (default: 60)
- `RefreshDays`: Refresh token expiration time in days (default: 30)
- `ExpiresInMinutes`: Alternative expiration setting (default: 1440)
- `CookieDomain`: Cookie domain for authentication cookies

### Email Configuration

```json
{
  "Email": {
    "SmtpHost": "smtp.example.com",
    "SmtpPort": 465,
    "SmtpUsername": "your-email@example.com",
    "SmtpPassword": "your-password",
    "FromDisplayName": "Your App Support"
  }
}
```

### Password Setup Configuration

```json
{
  "PasswordSetup": {
    "BaseUrl": "https://identity.yourdomain.com"
  }
}
```

### Logging Configuration

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

**Log Files:**
- Development: `./logs/identity-api-*.log`
- Production: `/var/log/asafarim/identity-api/identity-api-*.log`

Logs rotate hourly and retain 24 files.

## API Endpoints

### Authentication Endpoints (`/api/auth`)

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `200 OK` with user details and tokens

#### POST `/api/auth/login`
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["User"]
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:** `200 OK` with new access token

#### POST `/api/auth/logout`
Invalidate refresh token and logout user.

**Headers:** `Authorization: Bearer {access_token}`

**Response:** `200 OK`

#### POST `/api/auth/setup-password`
Complete password setup for new users.

**Request Body:**
```json
{
  "token": "setup_token_here",
  "password": "NewSecurePassword123!"
}
```

**Response:** `200 OK`

#### POST `/api/auth/forgot-password`
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`

#### POST `/api/auth/reset-password`
Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:** `200 OK`

### User Endpoints (`/api/users`)

#### GET `/api/users/me`
Get current authenticated user profile.

**Headers:** `Authorization: Bearer {access_token}`

**Response:** `200 OK` with user details

#### PUT `/api/users/me`
Update current user profile.

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`

#### POST `/api/users/change-password`
Change user password.

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response:** `200 OK`

### Admin Endpoints (`/api/admin`)

**Note:** All admin endpoints require `Admin` role.

#### GET `/api/admin/users`
Get all users with pagination.

**Query Parameters:**
- `pageNumber` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)

**Response:** `200 OK` with paginated user list

#### GET `/api/admin/users/{id}`
Get user by ID.

**Response:** `200 OK` with user details

#### POST `/api/admin/users`
Create new user.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "roles": ["User"]
}
```

**Response:** `201 Created` with user details and setup token

#### PUT `/api/admin/users/{id}`
Update user details.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "updated@example.com",
  "roles": ["User", "Admin"]
}
```

**Response:** `200 OK`

#### DELETE `/api/admin/users/{id}`
Delete user.

**Response:** `204 No Content`

#### POST `/api/admin/users/{id}/reset-password`
Admin reset user password.

**Request Body:**
```json
{
  "newPassword": "NewPassword123!"
}
```

**Response:** `200 OK`

### Role Endpoints (`/api/roles`)

#### GET `/api/roles`
Get all available roles.

**Headers:** `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
[
  {
    "id": "role-id",
    "name": "Admin",
    "normalizedName": "ADMIN"
  }
]
```

#### POST `/api/roles`
Create new role (Admin only).

**Request Body:**
```json
{
  "name": "Manager"
}
```

**Response:** `201 Created`

#### DELETE `/api/roles/{id}`
Delete role (Admin only).

**Response:** `204 No Content`

### Preferences Endpoints (`/api/preferences`)

#### GET `/api/preferences`
Get current user preferences.

**Headers:** `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "userId": "user-id",
  "preferredLanguage": "en",
  "theme": "light"
}
```

#### PUT `/api/preferences`
Update user preferences.

**Request Body:**
```json
{
  "preferredLanguage": "nl",
  "theme": "dark"
}
```

**Response:** `200 OK`

### Health Endpoints

#### GET `/health`
Basic health check.

**Response:** `200 OK` - "Healthy"

#### GET `/health/detailed`
Detailed health check with database connectivity.

**Response:** `200 OK`
```json
{
  "status": "Healthy",
  "database": "Connected",
  "timestamp": "2025-12-27T22:00:00Z"
}
```

## Database Schema

### Tables

**AspNetUsers**
- User accounts with ASP.NET Identity fields
- Custom fields: `FirstName`, `LastName`, `PreferredLanguage`, `RequiresPasswordSetup`

**AspNetRoles**
- Application roles

**AspNetUserRoles**
- User-role relationships (many-to-many)

**RefreshTokens**
- Refresh token storage with expiration tracking

**PasswordSetupTokens**
- One-time password setup tokens for new users

**AspNetUserClaims**, **AspNetUserLogins**, **AspNetUserTokens**, **AspNetRoleClaims**
- Standard ASP.NET Identity tables

## Security Features

### Authentication & Authorization
- JWT Bearer token authentication
- Role-based authorization with ASP.NET Core Identity
- Refresh token rotation for enhanced security
- Password setup tokens with expiration
- Secure password hashing with Identity framework

### Middleware
- **CorrelationIdMiddleware**: Tracks requests across services
- **RateLimitingMiddleware**: Prevents API abuse
- **ForwardedHeaders**: Supports reverse proxy deployments

### Security Best Practices
- HTTPS enforcement in production
- Secure cookie configuration
- CORS policy configuration
- SQL injection prevention via EF Core parameterization
- Password complexity requirements
- Token expiration and rotation

## Logging

The API uses Serilog for structured logging with:
- Console output in compact JSON format
- File logging with hourly rotation
- Correlation ID enrichment
- Service and environment enrichment
- Configurable log levels per namespace

**Log Locations:**
- Development: `./logs/identity-api-*.log`
- Production: `/var/log/asafarim/identity-api/identity-api-*.log`

## Error Handling

The API returns standard HTTP status codes:
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful deletion
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server error

Error responses include descriptive messages:
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Database Migrations

### Create Migration
```bash
dotnet ef migrations add MigrationName
```

### Apply Migrations
```bash
dotnet ef database update
```

### Rollback Migration
```bash
dotnet ef database update PreviousMigrationName
```

### Remove Last Migration
```bash
dotnet ef migrations remove
```

## Deployment

### Production Deployment

1. **Update configuration:**
   - Set production connection strings in `appsettings.Production.json`
   - Configure production JWT keys
   - Set up SMTP credentials
   - Configure CORS origins

2. **Build the application:**
```bash
dotnet publish -c Release -o ./publish
```

3. **Run database migrations:**
```bash
dotnet ef database update --connection "your_production_connection_string"
```

4. **Configure systemd service** (Linux):
```ini
[Unit]
Description=Identity API Service
After=network.target

[Service]
WorkingDirectory=/var/www/identity-api
ExecStart=/usr/bin/dotnet /var/www/identity-api/Identity.Api.dll
Restart=always
RestartSec=10
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5101

[Install]
WantedBy=multi-user.target
```

5. **Configure reverse proxy** (Nginx):
```nginx
server {
    listen 443 ssl http2;
    server_name identity.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Testing

### Manual Testing
Use the included `Identity.Api.http` file with REST Client extension in VS Code or use tools like Postman/Insomnia.

### Health Check
```bash
curl http://localhost:5101/health
```

### Test Authentication Flow
```bash
# Register
curl -X POST http://localhost:5101/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5101/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `systemctl status postgresql`
- Check connection string in `appsettings.json`
- Ensure database exists: `psql -U postgres -c "\l"`
- Check user permissions

### JWT Token Issues
- Verify JWT key is at least 32 characters
- Check token expiration settings
- Ensure clock synchronization between servers
- Validate issuer and audience claims

### Email Sending Issues
- Verify SMTP credentials
- Check SMTP port and SSL/TLS settings
- Test SMTP connection manually
- Review email service logs

### Migration Issues
- Ensure EF Core tools are installed: `dotnet tool install --global dotnet-ef`
- Check database connection
- Review migration files for conflicts
- Use `--verbose` flag for detailed output

## Performance Considerations

- Database connection pooling is enabled by default
- Use pagination for large data sets
- Implement caching for frequently accessed data
- Monitor database query performance
- Configure rate limiting appropriately
- Use async/await for I/O operations

## Contributing

1. Follow C# coding conventions
2. Write unit tests for new features
3. Update API documentation
4. Add database migrations for schema changes
5. Update this README for significant changes

## License

ISC License - Copyright (c) ASafariM

## Support

For issues and questions:
- Email: ali@asafarim.com
- Documentation: https://docs.asafarim.be

## Version History

### v0.6.0 (Current)
- User preferences with language support
- Enhanced admin user management
- Improved password setup flow
- Rate limiting middleware
- Correlation ID tracking
- Structured logging improvements

### Previous Versions
See git history for detailed changelog.
