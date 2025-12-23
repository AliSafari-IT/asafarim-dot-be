# TestRunner - TestCafe Test Execution Service

> A Node.js-based test execution service that runs TestCafe E2E tests, reports results to TestAutomation.Api via webhooks, and provides real-time updates through SignalR.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg)](https://www.typescriptlang.org/)
[![TestCafe](https://img.shields.io/badge/TestCafe-3.7-36B6E0.svg)](https://testcafe.io/)
[![Express](https://img.shields.io/badge/Express-4.18-000000.svg)](https://expressjs.com/)

## 🚀 Features

### 🧪 Test Execution
- **TestCafe Integration**: Execute E2E tests using TestCafe framework
- **Multiple Browsers**: Support for Chrome, Firefox, Safari, Edge (headless and headed)
- **Parallel Execution**: Run tests concurrently for faster results
- **Video Recording**: Capture test execution videos with FFmpeg
- **Screenshot Capture**: Automatic screenshots on test failures
- **JSON Reporter**: Structured test results in JSON format

### 📡 Real-time Communication
- **SignalR Client**: Connect to TestAutomation.Api SignalR hub
- **Live Updates**: Broadcast test progress in real-time
- **Event Broadcasting**: Emit test start, progress, and completion events
- **Group Messaging**: Send updates to specific test run groups

### 🔗 API Integration
- **Webhook Reporting**: Send test results to TestAutomation.Api
- **Retry Logic**: Automatic retry on webhook failures
- **Status Updates**: Report test run status changes
- **Error Handling**: Graceful error handling with detailed logging

### 🛠️ Test Management
- **Dynamic Test Generation**: Accept test code from API
- **Temporary File Management**: Create and clean up test files
- **Test Isolation**: Each run uses isolated test files
- **Stop Capability**: Ability to stop running tests

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3
- **Test Framework**: TestCafe 3.7
- **Web Framework**: Express 4.18
- **Real-time**: SignalR Client 8.0
- **HTTP Client**: Axios
- **Logging**: Winston
- **Video Processing**: FFmpeg

### Project Structure
```
TestRunner/
├── src/
│   ├── index.ts                    # Express server entry point
│   ├── services/
│   │   ├── TestRunnerService.ts    # Core test execution logic
│   │   └── SignalRService.ts       # SignalR client wrapper
│   └── utils/
│       └── logger.ts               # Winston logger configuration
├── tests/                          # Sample test files
│   └── fixtures/
│       └── example.js
├── dist/                           # Compiled JavaScript
├── .env                            # Environment configuration
├── package.json
└── tsconfig.json
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- Chrome browser (for headless testing)
- FFmpeg (for video recording)
- TestAutomation.Api running

### Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=4000
   
   # API Configuration
   API_URL=http://localhost:5106
   API_KEY=test-runner-api-key-2024
   API_TOKEN=your-jwt-token-from-identity-api
   
   # Test Configuration
   TEMP_TESTS_DIR=/var/tmp/testrunner-tests
   BROWSER=chrome
   HEADLESS=true
   
   # Video Recording (optional)
   ENABLE_VIDEO=false
   VIDEO_PATH=./videos
   ```

3. **Install FFmpeg** (for video recording):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # macOS
   brew install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   ```

4. **Start the service**:
   ```bash
   pnpm dev
   ```
   The service will be available at `http://localhost:4000`

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm start` | Start production server |
| `pnpm build` | Compile TypeScript to JavaScript |
| `pnpm test` | Run sample tests with TestCafe |
| `pnpm test:headless` | Run tests in headless mode |
| `pnpm test:specific` | Run specific test file |
| `pnpm test:parallel` | Run tests in parallel (3 instances) |
| `pnpm api` | Start both TestRunner and TestAutomation.Api |

### Configuration

#### Environment Variables

```bash
# Server
PORT=4000                                    # Express server port

# API Integration
API_URL=http://localhost:5106                # TestAutomation.Api URL
API_KEY=test-runner-api-key-2024            # Shared API key
API_TOKEN=your-jwt-token                     # JWT token for authentication

# Test Execution
TEMP_TESTS_DIR=/var/tmp/testrunner-tests    # Temporary test files directory
BROWSER=chrome                               # Browser to use (chrome, firefox, safari, edge)
HEADLESS=true                                # Run in headless mode
CONCURRENCY=1                                # Number of parallel test instances

# Video Recording
ENABLE_VIDEO=false                           # Enable video recording
VIDEO_PATH=./videos                          # Video output directory
VIDEO_OPTIONS={"failedOnly":true}            # Video recording options

# Logging
LOG_LEVEL=info                               # Log level (debug, info, warn, error)
```

## 📡 API Endpoints

### POST /run-test
Execute a test run.

**Headers**:
```
X-API-Key: test-runner-api-key-2024
```

**Request**:
```json
{
  "runId": "abc123",
  "testCode": "import { Selector } from 'testcafe';\n\nfixture('Login Tests')\n  .page('https://example.com/login');\n\ntest('Valid login', async t => {\n  await t\n    .typeText('#username', 'testuser')\n    .typeText('#password', 'password123')\n    .click('#login-btn')\n    .expect(Selector('#dashboard').exists).ok();\n});",
  "browser": "chrome",
  "headless": true
}
```

**Response**:
```json
{
  "success": true,
  "runId": "abc123",
  "message": "Test execution started"
}
```

### POST /stop-test
Stop a running test.

**Headers**:
```
X-API-Key: test-runner-api-key-2024
```

**Request**:
```json
{
  "runId": "abc123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Test stopped successfully"
}
```

### GET /health
Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "service": "TestRunner",
  "version": "1.2.0",
  "uptime": 3600
}
```

## 🔄 Test Execution Flow

```
1. TestAutomation.Api sends test code to /run-test
   ↓
2. TestRunner creates temporary test file
   ↓
3. TestRunner starts TestCafe with JSON reporter
   ↓
4. TestRunner connects to SignalR hub
   ↓
5. For each test:
   - Emit TestStarted event via SignalR
   - Execute test with TestCafe
   - Capture screenshot on failure
   - Send result to /api/runner-webhook/result
   - Emit TestCompleted event via SignalR
   ↓
6. After all tests:
   - Send final status to /api/runner-webhook/status
   - Emit TestRunCompleted event via SignalR
   - Clean up temporary files
```

## 📊 SignalR Integration

### Connection
The TestRunner automatically connects to the TestAutomation.Api SignalR hub on startup.

```typescript
// SignalR connection is established in SignalRService
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_URL}/hubs/testrun`, {
    accessTokenFactory: () => API_TOKEN
  })
  .withAutomaticReconnect()
  .build();
```

### Events Emitted

#### TestRunStarted
Emitted when a test run begins.
```typescript
await signalRService.emit('TestRunStarted', runId);
```

#### TestStarted
Emitted when an individual test starts.
```typescript
await signalRService.emit('TestStarted', {
  runId,
  testName,
  timestamp: new Date()
});
```

#### TestCompleted
Emitted when an individual test completes.
```typescript
await signalRService.emit('TestCompleted', {
  runId,
  testName,
  status: 'passed' | 'failed' | 'skipped',
  duration,
  timestamp: new Date()
});
```

#### TestRunCompleted
Emitted when the entire test run completes.
```typescript
await signalRService.emit('TestRunCompleted', {
  runId,
  status: 'completed' | 'failed',
  totalTests,
  passedTests,
  failedTests,
  duration
});
```

## 🔗 Webhook Integration

### Test Result Webhook
Sends individual test results to TestAutomation.Api.

**Endpoint**: `POST ${API_URL}/api/runner-webhook/result`

**Payload**:
```json
{
  "runId": "abc123",
  "testName": "Valid login",
  "status": "passed",
  "duration": 5000,
  "error": null,
  "screenshot": "base64-encoded-image-data"
}
```

**Retry Logic**:
- Retries up to 3 times on failure
- Exponential backoff: 1s, 2s, 4s
- Logs errors on final failure

### Status Update Webhook
Sends test run status updates to TestAutomation.Api.

**Endpoint**: `POST ${API_URL}/api/runner-webhook/status`

**Payload**:
```json
{
  "runId": "abc123",
  "status": "completed",
  "totalTests": 10,
  "passedTests": 8,
  "failedTests": 2,
  "duration": 60000
}
```

## 🎥 Video Recording

Enable video recording to capture test execution:

```env
ENABLE_VIDEO=true
VIDEO_PATH=./videos
VIDEO_OPTIONS={"failedOnly":true,"singleFile":false}
```

**Video Options**:
- `failedOnly`: Only record videos for failed tests
- `singleFile`: Combine all tests into a single video
- `pathPattern`: Custom path pattern for video files

Videos are saved in the specified directory with the naming pattern:
```
{VIDEO_PATH}/{runId}/{testName}.mp4
```

## 📝 Logging

The TestRunner uses Winston for structured logging:

```typescript
// Log levels
logger.info('Test execution started');
logger.warn('Retry attempt 2/3');
logger.error('Failed to send webhook', { error });
logger.debug('Test file created', { path });
```

**Log Output**:
- Console: Colored, formatted logs for development
- File: JSON-formatted logs for production (optional)

**Log Format**:
```
2025-12-23 16:00:00 [info]: Test execution started runId=abc123
2025-12-23 16:00:05 [error]: Webhook failed error="Connection refused"
```

## 🧪 TestCafe Configuration

### Browser Options
```typescript
const browserOptions = {
  chrome: 'chrome:headless',
  firefox: 'firefox:headless',
  safari: 'safari',
  edge: 'edge:headless'
};
```

### TestCafe Runner Options
```typescript
const runner = createTestCafe()
  .then(tc => tc.createRunner())
  .src(testFilePath)
  .browsers(browser)
  .reporter('json', {
    output: resultFilePath
  })
  .screenshots({
    path: screenshotPath,
    takeOnFails: true,
    fullPage: true
  })
  .video(videoPath, {
    failedOnly: true
  });
```

## 🚢 Deployment

### Production Configuration

1. **Environment Variables**:
   ```bash
   export PORT=4000
   export API_URL=https://testautomation.asafarim.be
   export API_KEY=production-api-key
   export API_TOKEN=production-jwt-token
   export TEMP_TESTS_DIR=/var/tmp/testrunner-tests
   export HEADLESS=true
   export ENABLE_VIDEO=true
   ```

2. **Build**:
   ```bash
   pnpm build
   ```

3. **Start**:
   ```bash
   pnpm start
   ```

### Systemd Service
```ini
[Unit]
Description=TestRunner Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/testrunner
ExecStart=/usr/bin/node /var/www/testrunner/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=testrunner
User=www-data
Environment=NODE_ENV=production
Environment=PORT=4000
Environment=API_URL=https://testautomation.asafarim.be
Environment=API_KEY=production-api-key
Environment=HEADLESS=true

[Install]
WantedBy=multi-user.target
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    ffmpeg

# Set Chrome path
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 4000

CMD ["pnpm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

1. **Chrome/Browser Not Found**
   ```bash
   # Install Chrome
   sudo apt-get install chromium-browser
   
   # Or set custom Chrome path
   export CHROME_BIN=/usr/bin/chromium-browser
   ```

2. **FFmpeg Not Found**
   ```bash
   # Install FFmpeg
   sudo apt-get install ffmpeg
   
   # Verify installation
   ffmpeg -version
   ```

3. **Webhook Failures**
   - Verify TestAutomation.Api is running
   - Check API_URL and API_KEY configuration
   - Review TestAutomation.Api logs for errors
   - Ensure network connectivity

4. **SignalR Connection Issues**
   - Verify API_TOKEN is valid
   - Check TestAutomation.Api SignalR hub is running
   - Review CORS configuration
   - Check firewall settings

5. **Test Execution Failures**
   - Check test code syntax
   - Verify selectors are correct
   - Review TestCafe logs
   - Ensure browser is installed

6. **Permission Errors**
   ```bash
   # Ensure temp directory is writable
   sudo mkdir -p /var/tmp/testrunner-tests
   sudo chown -R $USER:$USER /var/tmp/testrunner-tests
   sudo chmod 755 /var/tmp/testrunner-tests
   ```

## 📊 Performance Optimization

### Parallel Execution
Run tests in parallel for faster execution:
```bash
export CONCURRENCY=3
```

### Headless Mode
Use headless browsers for better performance:
```bash
export HEADLESS=true
```

### Video Recording
Disable video recording or record only failed tests:
```bash
export ENABLE_VIDEO=false
# or
export VIDEO_OPTIONS='{"failedOnly":true}'
```

## 📄 License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 1.2.0  
**Port**: 4000  
**Last Updated**: December 2025
