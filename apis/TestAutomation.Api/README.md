# TestAutomation API - E2E Test Automation Platform Backend

> A comprehensive ASP.NET Core Web API providing backend services for end-to-end test automation with TestCafe, including test suite management, test execution orchestration, real-time reporting via SignalR, and integration with TestRunner.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4.svg)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-12-239120.svg)](https://docs.microsoft.com/en-us/dotnet/csharp/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![SignalR](https://img.shields.io/badge/SignalR-8.0-blue.svg)](https://dotnet.microsoft.com/apps/aspnet/signalr)
[![TestCafe](https://img.shields.io/badge/TestCafe-3.7-36B6E0.svg)](https://testcafe.io/)

## 🚀 Features

### 🧪 Test Management
- **Test Suites**: Organize tests into logical suites with CRUD operations
- **Test Cases**: Define individual test cases with steps, assertions, and data
- **Test Data Sets**: Manage test data for data-driven testing
- **Fixtures**: Group related tests with setup/teardown logic
- **Functional Requirements**: Link tests to business requirements

### ⚡ Test Execution
- **TestCafe Code Generation**: Automatically generate TestCafe test files from test cases
- **Test Orchestration**: Coordinate test execution with TestRunner
- **Parallel Execution**: Support for concurrent test runs
- **Run Management**: Start, stop, and monitor test runs
- **Re-run Failed Tests**: Quickly re-execute failed test cases

### 📊 Real-time Reporting
- **SignalR Hub**: Live test execution updates via WebSocket
- **Test Results**: Detailed test results with screenshots and logs
- **Dashboard Metrics**: Real-time statistics and KPIs
- **Report Downloads**: HTML and JSON report generation
- **Status Tracking**: Track test run status (queued, running, completed, failed)

### 🔗 Integrations
- **TestRunner Integration**: Webhook-based communication with Node.js test runner
- **Identity API Integration**: JWT-based authentication and authorization
- **Role-based Access**: Tester-only policies for sensitive operations

### 🗄️ Database Management
- **PostgreSQL**: Primary database with EF Core
- **Automatic Migrations**: Database schema updates on startup
- **Audit Trails**: Track test execution history
- **Data Persistence**: Store test results, screenshots, and logs

## 🏗️ Architecture

### Tech Stack
- **Framework**: ASP.NET Core 8.0
- **Language**: C# 12 with nullable reference types
- **Database**: PostgreSQL with Entity Framework Core 8.0
- **Authentication**: JWT Bearer tokens
- **Real-time**: SignalR for WebSocket communication
- **Validation**: FluentValidation
- **Mapping**: AutoMapper
- **Logging**: Serilog with console and file sinks
- **Documentation**: Swagger/OpenAPI
- **Patterns**: MediatR for CQRS

### Project Structure
```
TestAutomation.Api/
├── Controllers/
│   ├── TestSuitesController.cs        # Test suite CRUD
│   ├── TestCasesController.cs         # Test case CRUD
│   ├── TestDataSetsController.cs      # Test data management
│   ├── FixturesController.cs          # Fixture management
│   ├── TestExecutionController.cs     # Start/stop test runs
│   ├── TestRunsController.cs          # Test run management
│   ├── ResultsController.cs           # Test results API
│   ├── RunnerWebhookController.cs     # TestRunner webhooks
│   ├── DashboardController.cs         # Dashboard metrics
│   ├── IntegrationsController.cs      # Integration settings
│   ├── SettingsController.cs          # Configuration
│   └── FunctionalRequirementsController.cs
├── Services/
│   ├── TestExecutionService.cs        # Orchestrates test runs
│   ├── TestCafeGeneratorService.cs    # Generates TestCafe code
│   ├── TestRunnerClient.cs            # HTTP client for TestRunner
│   └── ReportGeneratorService.cs      # HTML/JSON reports
├── Hubs/
│   └── TestRunHub.cs                  # SignalR hub
├── Models/
│   ├── TestSuite.cs
│   ├── TestCase.cs
│   ├── TestDataSet.cs
│   ├── TestRun.cs
│   ├── TestResult.cs
│   ├── Fixture.cs
│   └── FunctionalRequirement.cs
├── DTOs/
│   ├── TestSuiteDto.cs
│   ├── TestCaseDto.cs
│   ├── TestRunDto.cs
│   └── TestResultDto.cs
├── Data/
│   └── TestAutomationDbContext.cs
├── Database/
│   └── Migrations/
└── Program.cs
```

## 🛠️ Installation

### Prerequisites
- .NET 8.0 SDK
- PostgreSQL 16+
- Identity API running (for authentication)
- TestRunner service (Node.js)

### Setup

1. **Restore dependencies**:
   ```bash
   dotnet restore
   ```

2. **Configure database**:
   Update `appsettings.json` or use environment variables:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=testautomation;Username=postgres;Password=your_password"
     }
   }
   ```

3. **Configure Identity API**:
   ```json
   {
     "IdentityApi": {
       "BaseUrl": "https://identity.asafarim.be",
       "JwtSecret": "your-jwt-secret-key-min-32-chars",
       "Issuer": "IdentityApi",
       "Audience": "TestAutomationClient"
     }
   }
   ```

4. **Configure TestRunner**:
   ```json
   {
     "TestRunner": {
       "BaseUrl": "http://localhost:4000",
       "ApiKey": "test-runner-api-key-2024"
     },
     "ApiBaseUrl": "http://localhost:5106"
   }
   ```

5. **Run database migrations**:
   ```bash
   dotnet ef database update
   ```

6. **Start the API**:
   ```bash
   dotnet run --urls http://localhost:5106
   ```
   The API will be available at `http://localhost:5106`

## 🔧 Development

### Available Commands

| Command | Description |
|---------|-------------|
| `dotnet run` | Start the API server on port 5106 |
| `dotnet build` | Build the project |
| `dotnet test` | Run tests |
| `dotnet ef migrations add <Name>` | Create new migration |
| `dotnet ef database update` | Apply migrations |
| `dotnet watch run` | Run with hot reload |

### Configuration

#### Environment Variables
```bash
# Database
ConnectionStrings__DefaultConnection="Host=localhost;Database=testautomation;..."

# Identity API
IdentityApi__BaseUrl="https://identity.asafarim.be"
IdentityApi__JwtSecret="your-secret-key"
IdentityApi__Issuer="IdentityApi"
IdentityApi__Audience="TestAutomationClient"

# TestRunner
TestRunner__BaseUrl="http://localhost:4000"
TestRunner__ApiKey="test-runner-api-key-2024"
ApiBaseUrl="http://localhost:5106"
```

#### CORS Configuration
The API automatically configures CORS for:
- `http://localhost:5180` (test-automation-ui dev)
- `http://testora.asafarim.local:5180` (test-automation-ui local)
- `https://testora.asafarim.be` (production)

## 📡 API Endpoints

### Test Suites

#### GET /api/test-suites
Get all test suites.

**Response**:
```json
[
  {
    "id": 1,
    "name": "Login Tests",
    "description": "Test suite for login functionality",
    "testCases": [],
    "passed": true,
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

#### POST /api/test-suites
Create a new test suite.

**Request**:
```json
{
  "name": "Login Tests",
  "description": "Test suite for login functionality"
}
```

#### PUT /api/test-suites/{id}
Update a test suite.

#### DELETE /api/test-suites/{id}
Delete a test suite.

### Test Cases

#### GET /api/test-cases
Get all test cases.

**Query Parameters**:
- `suiteId`: Filter by test suite ID

#### POST /api/test-cases
Create a new test case.

**Request**:
```json
{
  "name": "Valid Login",
  "description": "Test successful login with valid credentials",
  "testSuiteId": 1,
  "steps": [
    {
      "order": 1,
      "action": "Navigate to login page",
      "selector": "#login-page"
    },
    {
      "order": 2,
      "action": "Enter username",
      "selector": "#username",
      "value": "testuser"
    },
    {
      "order": 3,
      "action": "Enter password",
      "selector": "#password",
      "value": "password123"
    },
    {
      "order": 4,
      "action": "Click login button",
      "selector": "#login-btn"
    }
  ],
  "assertions": [
    {
      "type": "exists",
      "selector": "#dashboard",
      "expectedValue": "true"
    }
  ]
}
```

### Test Execution

#### POST /api/test-execution/start
Start a test run.

**Request**:
```json
{
  "testSuiteId": 1,
  "browser": "chrome",
  "headless": true,
  "parallel": false
}
```

**Response**:
```json
{
  "runId": "abc123",
  "status": "queued",
  "startedAt": "2025-01-01T00:00:00Z"
}
```

#### POST /api/test-execution/stop/{runId}
Stop a running test.

#### POST /api/test-execution/rerun-failed/{runId}
Re-run failed tests from a previous run.

### Test Runs

#### GET /api/test-runs/{id}
Get test run details.

**Response**:
```json
{
  "id": "abc123",
  "testSuiteId": 1,
  "status": "completed",
  "startedAt": "2025-01-01T00:00:00Z",
  "completedAt": "2025-01-01T00:05:00Z",
  "totalTests": 10,
  "passedTests": 8,
  "failedTests": 2,
  "duration": 300000
}
```

#### GET /api/test-runs/{id}/results
Get test results for a run.

**Query Parameters**:
- `status`: Filter by status (passed, failed, skipped)

#### GET /api/test-runs/{id}/download
Download test report.

**Query Parameters**:
- `format`: Report format (html, json)

### Runner Webhook

#### POST /api/runner-webhook/result
Receive test result from TestRunner (internal use).

**Request**:
```json
{
  "runId": "abc123",
  "testName": "Valid Login",
  "status": "passed",
  "duration": 5000,
  "error": null,
  "screenshot": "base64-encoded-image"
}
```

#### POST /api/runner-webhook/status
Receive test run status update from TestRunner (internal use).

### Dashboard

#### GET /api/dashboard/stats
Get dashboard statistics.

**Response**:
```json
{
  "totalRuns": 100,
  "passedCount": 85,
  "failedCount": 15,
  "inProgressCount": 2,
  "passRate": 85.0,
  "failRate": 15.0
}
```

#### GET /api/dashboard/recent-runs
Get recent test runs.

**Query Parameters**:
- `limit`: Number of runs to return (default: 10)

## 🔄 SignalR Hub

### Connection
```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:5106/hubs/testrun')
  .build();

await connection.start();
```

### Events

#### TestRunStarted
Emitted when a test run starts.
```typescript
connection.on('TestRunStarted', (runId: string) => {
  console.log('Test run started:', runId);
});
```

#### TestResultAdded
Emitted when a test result is received.
```typescript
connection.on('TestResultAdded', (result: TestResult) => {
  console.log('Test result:', result);
});
```

#### TestRunCompleted
Emitted when a test run completes.
```typescript
connection.on('TestRunCompleted', (runId: string, status: string) => {
  console.log('Test run completed:', runId, status);
});
```

### Join Run Group
```typescript
await connection.invoke('JoinRunGroup', runId);
```

## 🗄️ Database Schema

### TestSuites Table
- `Id` (int, PK)
- `Name` (string)
- `Description` (string)
- `Passed` (bool?, nullable)
- `CreatedAt` (datetime)
- `UpdatedAt` (datetime)

### TestCases Table
- `Id` (int, PK)
- `Name` (string)
- `Description` (string)
- `TestSuiteId` (int, FK)
- `Steps` (json)
- `Assertions` (json)
- `Passed` (bool?, nullable)
- `CreatedAt` (datetime)

### TestRuns Table
- `Id` (string, PK)
- `TestSuiteId` (int, FK)
- `Status` (enum: queued, running, completed, failed, stopped)
- `StartedAt` (datetime)
- `CompletedAt` (datetime?)
- `TotalTests` (int)
- `PassedTests` (int)
- `FailedTests` (int)
- `Duration` (long)

### TestResults Table
- `Id` (int, PK)
- `TestRunId` (string, FK)
- `TestName` (string)
- `Status` (enum: passed, failed, skipped)
- `Duration` (long)
- `Error` (string?)
- `Screenshot` (string?)
- `CreatedAt` (datetime)

## 🔐 Authentication

The API uses JWT Bearer authentication:

1. **Token Sources**:
   - Authorization header: `Bearer <token>`
   - Generated by Identity API

2. **Token Validation**:
   - Issuer: `IdentityApi`
   - Audience: `TestAutomationClient`
   - Signature validation with shared secret

3. **Authorization Policies**:
   - `TesterOnly`: Requires `Tester` role for test execution
   - Most endpoints require authentication

## 🔗 TestRunner Integration

The API communicates with TestRunner via:

1. **HTTP Requests**:
   - `POST /run-test` - Start test execution
   - `POST /stop-test` - Stop running test

2. **Webhooks**:
   - TestRunner sends results to `/api/runner-webhook/result`
   - TestRunner sends status to `/api/runner-webhook/status`

3. **API Key Authentication**:
   - TestRunner uses `X-API-Key` header
   - Configured in `TestRunner:ApiKey` setting

## 📊 Logging

Structured logging with Serilog:
- **Console Sink**: Development logging
- **File Sink**: Production logging
- **Log Levels**: Information, Warning, Error
- **Request Logging**: HTTP request/response logging
- **Error Tracking**: Exception logging with stack traces

## 🚢 Deployment

### Production Configuration

1. **Database**:
   ```bash
   export ConnectionStrings__DefaultConnection="Host=prod-db;Database=testautomation;..."
   ```

2. **Identity API**:
   ```bash
   export IdentityApi__BaseUrl="https://identity.asafarim.be"
   export IdentityApi__JwtSecret="production-secret-key"
   ```

3. **TestRunner**:
   ```bash
   export TestRunner__BaseUrl="http://testrunner:4000"
   export TestRunner__ApiKey="production-api-key"
   ```

4. **Build and Run**:
   ```bash
   dotnet publish -c Release -o ./publish
   cd publish
   dotnet TestAutomation.Api.dll
   ```

### Systemd Service
```ini
[Unit]
Description=TestAutomation API Service
After=network.target postgresql.service

[Service]
Type=notify
WorkingDirectory=/var/www/testautomation-api
ExecStart=/usr/bin/dotnet /var/www/testautomation-api/TestAutomation.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=testautomation-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://0.0.0.0:5106

[Install]
WantedBy=multi-user.target
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name testautomation.asafarim.be;
    
    location / {
        proxy_pass http://localhost:5106;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /hubs/ {
        proxy_pass http://localhost:5106;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check connection string
   dotnet ef database update
   # Verify PostgreSQL is running
   systemctl status postgresql
   ```

2. **TestRunner Communication Failures**
   - Verify TestRunner is running on port 4000
   - Check API key matches in both services
   - Review TestRunner logs for errors

3. **SignalR Connection Issues**
   - Ensure WebSocket support is enabled
   - Check CORS configuration
   - Verify firewall allows WebSocket connections

4. **Authentication Failures**
   - Verify JWT configuration matches Identity API
   - Check token expiration
   - Ensure user has required roles

## 📄 License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 1.0.0  
**Port**: 5106  
**Last Updated**: December 2025
