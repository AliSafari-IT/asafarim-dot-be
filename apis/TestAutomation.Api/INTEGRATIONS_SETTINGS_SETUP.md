# Integrations & Settings Database Setup

This document outlines the database schema and API endpoints for the Integrations and Settings features.

## Database Schema

### 1. Integrations Table
Stores user integrations with external systems (CI/CD, Issue Trackers, Notifications, APIs).

```sql
CREATE TABLE "Integrations" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" TEXT NOT NULL,
    "Type" VARCHAR(50) NOT NULL,  -- CiCd, IssueTracker, Notification, Api
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "Status" VARCHAR(50) NOT NULL,  -- Connected, Disconnected
    "Credentials" JSONB,  -- Encrypted credentials
    "LastSync" TIMESTAMP WITH TIME ZONE,
    "Settings" JSONB,  -- Custom settings per integration
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX "IX_Integrations_UserId" ON "Integrations" ("UserId");
CREATE INDEX "IX_Integrations_UserId_Type" ON "Integrations" ("UserId", "Type");
```

### 2. TestEnvironments Table
Stores test environments (Development, Staging, Production, etc.).

```sql
CREATE TABLE "TestEnvironments" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" TEXT NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "BaseUrl" VARCHAR(500) NOT NULL,
    "IsDefault" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX "IX_TestEnvironments_UserId" ON "TestEnvironments" ("UserId");
CREATE INDEX "IX_TestEnvironments_UserId_IsDefault" ON "TestEnvironments" ("UserId", "IsDefault");
```

### 3. UserCredentials Table
Stores encrypted user credentials (API keys, tokens, passwords).

```sql
CREATE TABLE "UserCredentials" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" TEXT NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Type" VARCHAR(50) NOT NULL,  -- ApiKey, Token, Password, Certificate
    "EncryptedValue" TEXT NOT NULL,
    "LastUsed" TIMESTAMP WITH TIME ZONE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX "IX_UserCredentials_UserId" ON "UserCredentials" ("UserId");
```

### 4. AutomationSettings Table
Stores automation configuration per user (one record per user).

```sql
CREATE TABLE "AutomationSettings" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" TEXT NOT NULL UNIQUE,
    "DefaultTimeout" INTEGER NOT NULL DEFAULT 30000,
    "MaxRetries" INTEGER NOT NULL DEFAULT 3,
    "Parallelism" INTEGER NOT NULL DEFAULT 4,
    "ScreenshotOnFailure" BOOLEAN NOT NULL DEFAULT TRUE,
    "VideoRecording" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX "IX_AutomationSettings_UserId" ON "AutomationSettings" ("UserId");
```

### 5. NotificationSettings Table
Stores notification preferences per user (one record per user).

```sql
CREATE TABLE "NotificationSettings" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" TEXT NOT NULL UNIQUE,
    "EmailOnSuccess" BOOLEAN NOT NULL DEFAULT FALSE,
    "EmailOnFailure" BOOLEAN NOT NULL DEFAULT TRUE,
    "SlackEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "SlackWebhookUrl" VARCHAR(500),
    "ReportFormat" VARCHAR(50) NOT NULL DEFAULT 'Html',  -- Html, Pdf, Json
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX "IX_NotificationSettings_UserId" ON "NotificationSettings" ("UserId");
```

## API Endpoints

### Integrations API (`/api/integrations`)

#### GET /api/integrations
Get all integrations for the authenticated user.
- **Query Params**: `type` (optional) - Filter by integration type
- **Response**: Array of integrations

#### GET /api/integrations/{id}
Get a specific integration by ID.
- **Response**: Integration details

#### POST /api/integrations
Create a new integration.
- **Body**: `{ type, name, description?, settings? }`
- **Response**: Created integration

#### PUT /api/integrations/{id}
Update an integration.
- **Body**: `{ name?, description?, settings? }`
- **Response**: 204 No Content

#### POST /api/integrations/{id}/connect
Connect an integration (update status and store credentials).
- **Body**: `{ credentials? }`
- **Response**: `{ message, lastSync }`

#### POST /api/integrations/{id}/disconnect
Disconnect an integration.
- **Response**: `{ message }`

#### DELETE /api/integrations/{id}
Delete an integration.
- **Response**: 204 No Content

#### GET /api/integrations/stats
Get integration statistics.
- **Response**: `{ total, active, inactive, byType }`

### Settings API (`/api/settings`)

#### Environments
- **GET** `/api/settings/environments` - Get all environments
- **POST** `/api/settings/environments` - Create environment
- **PUT** `/api/settings/environments/{id}` - Update environment
- **POST** `/api/settings/environments/{id}/set-default` - Set as default
- **DELETE** `/api/settings/environments/{id}` - Delete environment

#### Credentials
- **GET** `/api/settings/credentials` - Get all credentials (values masked)
- **POST** `/api/settings/credentials` - Create credential
- **PUT** `/api/settings/credentials/{id}` - Update credential
- **DELETE** `/api/settings/credentials/{id}` - Delete credential

#### Automation Settings
- **GET** `/api/settings/automation` - Get automation settings
- **PUT** `/api/settings/automation` - Update automation settings

#### Notification Settings
- **GET** `/api/settings/notifications` - Get notification settings
- **PUT** `/api/settings/notifications` - Update notification settings

## Running the Migration

```bash
# Navigate to the API project
cd apis/TestAutomation.Api

# Apply the migration
dotnet ef database update

# Or if you need to create a new migration
dotnet ef migrations add AddUserSettingsAndIntegrations
```

## Security Considerations

### Credential Encryption
**✅ IMPLEMENTED**: Encryption for sensitive data using ASP.NET Core Data Protection API:
- Integration credentials (stored in `Integrations.Credentials`) - Encrypted as JSON
- User credentials (stored in `UserCredentials.EncryptedValue`) - Encrypted
- Slack webhook URLs (stored in `NotificationSettings.SlackWebhookUrl`) - Stored as-is (consider encrypting)

**Implementation Details:**
1. **EncryptionService** (`Services/EncryptionService.cs`)
   - Uses `IDataProtectionProvider` for encryption/decryption
   - Purpose string: `"TestAutomation.Credentials.v1"`
   - Registered as singleton in DI container

2. **Key Storage**
   - Keys persisted to `keys/` directory in application root
   - Application name: `"TestAutomation.Api"`
   - Keys are machine-specific by default

3. **Usage**
   - Credentials encrypted before saving to database
   - Decryption only when needed (not exposed in API responses)
   - Values masked in all API responses (`••••••••••••`)

**Production Considerations:**
- Store keys in a secure location (Azure Key Vault, AWS KMS, etc.)
- Use distributed key storage for multi-server deployments
- Implement key rotation policy
- Consider encrypting Slack webhook URLs as well

### Authentication
All endpoints require authentication via JWT Bearer token.
User ID is extracted from the JWT claims (`ClaimTypes.NameIdentifier`).

## Frontend Integration

### Service Files
- `src/services/integrationsService.ts` - API client for integrations
- `src/services/settingsService.ts` - API client for settings

### Components
- `src/pages/IntegrationsPage.tsx` - Integrations management UI
- `src/pages/SettingsPage.tsx` - Settings management UI

Both components support:
- **Preview mode** for anonymous users (promotional view)
- **Full mode** for authenticated users (functional interface)

## Testing

### Manual Testing
1. Start the API: `dotnet run --project apis/TestAutomation.Api`
2. Start the UI: `npm run dev` (in apps/test-automation-ui)
3. Login to access full functionality
4. Test CRUD operations for integrations and settings

### API Testing with Swagger
Navigate to: `http://testautomation.asafarim.local:5102/swagger`

## Next Steps

1. **Implement Encryption**: Add proper encryption for sensitive data
2. **Add Validation**: Enhance input validation on both client and server
3. **Error Handling**: Improve error messages and user feedback
4. **Audit Logging**: Log all changes to integrations and settings
5. **Integration Testing**: Add automated tests for API endpoints
6. **Real Integrations**: Implement actual integration logic (e.g., GitHub API, Slack webhooks)
