# Testora UI - Test Automation Dashboard

> A modern, interactive test automation dashboard built with React and TypeScript. Provides comprehensive test management, real-time execution monitoring, and analytics for TestCafe E2E testing with SignalR integration.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![SignalR](https://img.shields.io/badge/SignalR-8.0-blue.svg)](https://dotnet.microsoft.com/apps/aspnet/signalr)

## 🚀 Features

### 📊 Dashboard & Analytics
- **Interactive Dashboard**: Modern UI with KPI cards, charts, and progress bars
- **Real-time Metrics**: Live test execution statistics and success rates
- **Test Distribution**: Visual analytics of test results
- **Recent Runs**: Detailed table of recent test runs with status badges
- **Trend Analysis**: Success rate trends over time

### 🧪 Test Management
- **Test Suites**: Organize tests into logical suites with CRUD operations
- **Test Cases**: Define individual test cases with steps and assertions
- **Test Data Sets**: Manage test data for data-driven testing
- **Fixtures**: Group related tests with setup/teardown logic
- **TestCafe Code Viewer**: View and edit generated TestCafe code

### ⚡ Test Execution
- **One-Click Execution**: Run tests directly from the UI
- **Real-time Progress**: Live updates via SignalR during test execution
- **Stop Capability**: Ability to stop running tests
- **Re-run Failed Tests**: Quickly re-execute failed test cases
- **Parallel Execution**: Support for concurrent test runs

### 📈 Reporting & Results
- **Test Results View**: Detailed test results with status, duration, and errors
- **Screenshot Capture**: View screenshots from failed tests
- **Report Downloads**: Export reports in HTML and JSON formats
- **Execution Logs**: Real-time execution logs from TestRunner
- **Status Tracking**: Track test run status (queued, running, completed, failed)

### 🎨 User Experience
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Accessibility**: WCAG compliant with proper contrast and keyboard navigation
- **Modern UI**: Inspired by Datadog, Linear, and Grafana
- **Toast Notifications**: Real-time feedback for user actions

### 🔄 Real-time Features
- **SignalR Integration**: Live test execution updates via WebSocket
- **Auto-refresh**: Automatic data refresh while tests are running
- **Live Status Updates**: Real-time test run status changes
- **Progress Tracking**: Live progress bars during test execution

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 18.3 with TypeScript 5.6
- **Build Tool**: Vite 5.4
- **Routing**: React Router DOM 6.26
- **Styling**: CSS with Design Tokens (@asafarim/design-tokens)
- **Icons**: Lucide React, React Icons
- **Real-time**: SignalR Client 8.0
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Notifications**: React Hot Toast, @asafarim/toast
- **UI Components**: Shared UI library (@asafarim/shared-ui-react)
- **Theming**: React Themes (@asafarim/react-themes)
- **i18n**: Shared i18n (@asafarim/shared-i18n)
- **Utilities**: @asafarim/helpers

### Project Structure
```
test-automation-ui/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx              # Main dashboard with metrics
│   │   ├── TestSuitesPage.tsx         # Test suites management
│   │   ├── TestCasesPage.tsx          # Test cases management
│   │   ├── TestDataSetsPage.tsx       # Test data management
│   │   ├── TestRunDetailsPage.tsx     # Test run details & results
│   │   └── FixturesPage.tsx           # Fixtures management
│   ├── components/
│   │   ├── TestCafeFileViewer.tsx     # View & edit TestCafe code
│   │   ├── TestResultRow.tsx          # Test result display
│   │   ├── StatusBadge.tsx            # Status indicator
│   │   ├── KPICard.tsx                # Dashboard KPI cards
│   │   └── TestRunTable.tsx           # Test runs table
│   ├── hooks/
│   │   ├── useTestRunUpdates.ts       # SignalR updates hook
│   │   ├── useTestExecution.ts        # Test execution hook
│   │   └── useAuth.ts                 # Authentication hook
│   ├── services/
│   │   ├── api.ts                     # API client wrapper
│   │   ├── signalr.ts                 # SignalR service
│   │   └── auth.ts                    # Auth service
│   ├── types/
│   │   ├── TestSuite.ts               # Type definitions
│   │   ├── TestCase.ts
│   │   ├── TestRun.ts
│   │   └── TestResult.ts
│   ├── utils/
│   │   ├── formatters.ts              # Data formatters
│   │   └── validators.ts              # Validation utilities
│   ├── App.tsx                        # Main app component
│   └── main.tsx                       # Entry point
├── public/                            # Static assets
├── dist/                              # Production build
└── vite.config.ts                     # Vite configuration
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- pnpm 8+
- TestAutomation.Api running on port 5106
- Identity.Api running on port 5101
- TestRunner service running on port 4000

### Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5106
   VITE_IDENTITY_URL=http://localhost:5101
   VITE_TESTRUNNER_URL=http://localhost:4000
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   # or
   pnpm start  # Runs on testora.asafarim.local:5180
   ```

4. **Build for production**:
   ```bash
   pnpm build
   ```

5. **Preview production build**:
   ```bash
   pnpm preview
   ```

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server on default port |
| `pnpm start` | Start development server on testora.asafarim.local:5180 |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build |

### Configuration

#### Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:5106              # TestAutomation.Api URL
VITE_IDENTITY_URL=http://localhost:5101         # Identity.Api URL
VITE_TESTRUNNER_URL=http://localhost:4000       # TestRunner URL

# Feature Flags
VITE_ENABLE_DARK_MODE=true                      # Enable dark mode
VITE_ENABLE_ANALYTICS=true                      # Enable analytics
```

## 🌐 API Integration

The UI integrates with TestAutomation.Api:

### Test Suites
- `GET /api/test-suites` - Get all test suites
- `POST /api/test-suites` - Create test suite
- `PUT /api/test-suites/{id}` - Update test suite
- `DELETE /api/test-suites/{id}` - Delete test suite

### Test Cases
- `GET /api/test-cases` - Get all test cases
- `GET /api/test-cases?suiteId={id}` - Get test cases by suite
- `POST /api/test-cases` - Create test case
- `PUT /api/test-cases/{id}` - Update test case
- `DELETE /api/test-cases/{id}` - Delete test case

### Test Execution
- `POST /api/test-execution/start` - Start test run
- `POST /api/test-execution/stop/{runId}` - Stop test run
- `POST /api/test-execution/rerun-failed/{runId}` - Re-run failed tests

### Test Runs
- `GET /api/test-runs/{id}` - Get test run details
- `GET /api/test-runs/{id}/results` - Get test results
- `GET /api/test-runs/{id}/download?format=html` - Download HTML report
- `GET /api/test-runs/{id}/download?format=json` - Download JSON report

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-runs` - Get recent test runs

## 🔄 SignalR Integration

### Connection Setup
```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:5106/hubs/testrun', {
    accessTokenFactory: () => getAccessToken()
  })
  .withAutomaticReconnect()
  .build();

await connection.start();
```

### Event Handlers
```typescript
// Join test run group
await connection.invoke('JoinRunGroup', runId);

// Listen for test run updates
connection.on('TestRunStarted', (runId: string) => {
  console.log('Test run started:', runId);
});

connection.on('TestResultAdded', (result: TestResult) => {
  console.log('Test result:', result);
  // Update UI with new result
});

connection.on('TestRunCompleted', (runId: string, status: string) => {
  console.log('Test run completed:', runId, status);
  // Show completion notification
});
```

### Custom Hook
```typescript
// hooks/useTestRunUpdates.ts
export function useTestRunUpdates(runId: string) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/testrun`)
      .withAutomaticReconnect()
      .build();

    newConnection.start().then(() => {
      newConnection.invoke('JoinRunGroup', runId);
      
      newConnection.on('TestRunUpdated', (data) => {
        setTestRun(prev => ({ ...prev, ...data }));
      });
      
      newConnection.on('TestResultAdded', (result) => {
        setResults(prev => [...prev, result]);
      });
    });

    setConnection(newConnection);
    return () => newConnection?.stop();
  }, [runId]);

  return { connection, testRun, results };
}
```

## 📱 Pages & Features

### Dashboard (`/dashboard`)
- **KPI Cards**: Total runs, passed tests, failed tests, in-progress tests
- **Success Rate Gauge**: Visual representation of pass rate
- **Test Distribution Chart**: Breakdown of test results
- **Recent Runs Table**: Clickable rows to view details

### Test Suites (`/test-suites`)
- **Suite List**: All test suites with status indicators
- **Create Suite**: Add new test suite
- **Edit Suite**: Update suite details
- **Delete Suite**: Remove test suite
- **Run Suite**: Execute all tests in suite

### Test Cases (`/test-cases`)
- **Case List**: All test cases with suite grouping
- **Create Case**: Add new test case with steps
- **Edit Case**: Update test case details
- **Delete Case**: Remove test case
- **View Code**: See generated TestCafe code

### Test Run Details (`/test-runs/:id`)
- **Run Summary**: Total tests, passed, failed, duration
- **Results Table**: Individual test results with status
- **Filter Results**: View all, passed only, or failed only
- **Download Reports**: Export HTML or JSON reports
- **Re-run Failed**: Create new run with failed tests
- **Stop Run**: Stop currently running tests
- **Real-time Updates**: Live progress via SignalR

### Test Data Sets (`/test-data-sets`)
- **Dataset List**: All test data sets
- **Create Dataset**: Add new test data
- **Edit Dataset**: Update test data
- **Delete Dataset**: Remove test data
- **Link to Tests**: Associate data with test cases

## 🎨 Theming

The application uses a comprehensive design token system:

- **Colors**: Semantic color scales (primary, success, warning, danger, info, neutral)
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Motion**: Standardized transitions and animations
- **Shadows**: Elevation system for depth
- **Radius**: Border radius tokens

Theme switching is handled automatically based on system preferences or user selection.

## 🔐 Authentication

The application uses JWT-based authentication:
- Tokens are obtained from Identity.Api
- Tokens are stored in HTTP-only cookies or localStorage
- Protected routes require valid authentication
- Automatic token refresh on expiration

## 🚢 Deployment

### Production Build
```bash
pnpm build
```

The build output will be in the `dist/` directory.

### Environment Configuration

For production deployment:

```env
VITE_API_URL=https://testautomation.asafarim.be
VITE_IDENTITY_URL=https://identity.asafarim.be
VITE_TESTRUNNER_URL=https://testrunner.asafarim.be
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name testora.asafarim.be;
    
    root /var/www/testora-ui;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
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

1. **API Connection Errors**
   - Verify TestAutomation.Api is running on port 5106
   - Check environment variables
   - Ensure CORS is properly configured

2. **SignalR Connection Issues**
   - Verify WebSocket support is enabled
   - Check authentication token is valid
   - Review browser console for connection errors

3. **Build Errors**
   - Clear `node_modules` and reinstall: `pnpm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`
   - Rebuild workspace packages: `pnpm -r build`

4. **Authentication Issues**
   - Verify Identity API is running
   - Check JWT configuration
   - Clear browser cookies and try again

## 📊 Performance Optimization

- **Code Splitting**: Dynamic imports for heavy components
- **Lazy Loading**: Routes loaded on demand
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large test result lists
- **Debouncing**: Search and filter inputs

## 📄 License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 0.2.0  
**Port**: 5180  
**Last Updated**: December 2025
