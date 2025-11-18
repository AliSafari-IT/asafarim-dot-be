# Testora UI

## Overview

Testora UI is a modern, interactive test automation dashboard built with React and TypeScript. It provides a comprehensive view of test automation metrics, recent runs, and analytics for TestCafe E2E testing, including live execution logs and persisted test statuses.

## Features

- 📊 **Interactive Dashboard** — Modern UI with KPI cards, charts, and progress bars  
- 📈 **Analytics** — Success rate trends and test distribution visualizations  
- 📋 **Recent Runs** — Detailed table of recent test runs with status and results  
- 🌓 **Dark Mode** — Full dark mode support with system preference detection  
- 📱 **Responsive Design** — Optimized for 768–1428px width range  
- ♿ **Accessibility** — WCAG compliant with proper contrast and keyboard navigation  
- 🎨 **Modern UI** — Inspired by Datadog, Linear, and Grafana  
- 🔄 **Real-time Updates** — Automatic data refresh and hot reload  
- ✅ **Persisted Test Status** — Nullable `Passed` status stored on test suites and test cases to reflect the last run result  
- 🔁 **Auto-Refreshing Runs** — `/run` page automatically polls the API while runs are active and updates suite/test case statuses  
- 📜 **Execution Logs View** — `/test-runs/:id` details page shows real-time execution logs from the runner via SignalR  
- 🧩 **Suite & Case-Level Status** — Aggregated status for suites plus per-test-case badges based on the latest run  

## Tech Stack

- Framework: React 18 with TypeScript  
- Styling: CSS modules / page-level CSS using shared design tokens from `@asafarim/shared-tokens`  
- State Management: React Hooks  
- API Integration: Axios (`api.ts` wrapper + auth interceptors)  
- Real-time: SignalR (test run hub)  
- Build Tool: Vite  
- Package Manager: pnpm  

## Prerequisites

- Node.js 18+  
- pnpm 8+  
- TestAutomation.Api running on port 5106  
- Identity.Api running on port 5101  

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AliSafari-IT/asafarim-dot-be.git
   cd asafarim-dot-be/apps/test-automation-ui

```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your API URLs
   ```

4. **Start development server**

   ```bash
   pnpm start
   ```

## Usage

### Dashboard Overview

The main dashboard provides a comprehensive view of your test automation metrics:

1. **KPI Cards**

   - Total Test Runs
   - Passed Tests
   - Failed Tests
   - In Progress Tests

2. **Analytics**

   - Success Rate Gauge
   - Test Distribution

3. **Recent Runs**

   - Detailed table of recent test runs
   - Status badges
   - Results count
   - Date/time

### Example Workflow

1. **View Dashboard**

   - Navigate to `/dashboard`
   - View KPI cards and analytics
   - Monitor recent test runs

2. **Analyze Metrics**

   - Check success rate gauge
   - Review test distribution
   - Monitor in-progress tests

3. **Recent Runs**

   - View detailed run information
   - Check test results
   - Monitor test status

### API Integration

The UI integrates with the `TestAutomation.Api`:

```typescript
// API endpoints
const endpoints = {
  stats: '/dashboard/stats',
  recentRuns: '/dashboard/recent-runs'
};

// Data format
interface DashboardStats {
  totalRuns: number;
  passedCount: number;
  failedCount: number;
  inProgressCount: number;
  passRate: number;
  failRate: number;
}

interface TestRun {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'in_progress';
  date: string;
  passed: number;
  failed: number;
}
```

# Test Automation System - Complete Guide

## 🎯 Overview

A comprehensive test automation platform built with:

- **Backend**: ASP.NET Core 8.0 (TestAutomation.Api)
- **Test Runner**: Node.js + TestCafe (TestRunner)
- **Frontend**: React + TypeScript (test-automation-ui)
- **Database**: PostgreSQL
- **Real-time**: SignalR

---

## 📁 Project Structure

```
asafarim-dot-be/
├── apis/
│   ├── TestAutomation.Api/          # Main API
│   │   ├── Controllers/
│   │   │   ├── TestRunsController.cs       # ✅ Test runs & reports
│   │   │   ├── TestExecutionController.cs  # ✅ Start/stop runs
│   │   │   ├── RunnerWebhookController.cs  # ✅ Webhook from TestRunner
│   │   │   ├── TestSuitesController.cs     # ✅ Test suites CRUD
│   │   │   ├── TestCasesController.cs      # Test cases CRUD
│   │   │   └── TestDataSetsController.cs   # Test data sets CRUD
│   │   ├── Services/
│   │   │   ├── TestExecutionService.cs     # Orchestrates test runs
│   │   │   └── TestCafeGeneratorService.cs # ✅ Generates TestCafe code
│   │   └── Hubs/
│   │       └── TestRunHub.cs               # ✅ SignalR hub
│   └── TestRunner/                  # Node.js test executor
│       └── src/
│           ├── services/
│           │   └── TestRunnerService.ts    # ✅ Runs tests, reports results
│           └── index.ts                    # Express API
└── apps/
    └── test-automation-ui/          # React frontend
        └── src/
            ├── pages/
            │   ├── Dashboard.tsx           # 🚧 Needs enhancement
            │   ├── TestSuitesPage.tsx      # ✅ Working
            │   ├── TestCasesPage.tsx       # ✅ Working
            │   └── TestDataSetsPage.tsx    # ✅ Working
            └── components/
                └── TestCafeFileViewer.tsx  # ✅ View & run tests
```

---

## ✅ What's Working (Backend Complete)

### 1. Test Execution Flow

```
User clicks "Run Test"
    ↓
Frontend creates TestRun (gets runId)
    ↓
Frontend calls TestRunner with runId
    ↓
TestRunner:
  - Counts tests in generated file
  - Runs tests with TestCafe JSON reporter
  - Captures each test result
  - Sends to /api/runner-webhook/result (with retry)
  - Sends status to /api/runner-webhook/status (with retry)
    ↓
Backend:
  - Saves results to TestResults table
  - Broadcasts via SignalR (TestResultAdded)
  - Updates TestRun status
    ↓
Frontend can:
  - Fetch results via /api/test-runs/{id}/results
  - Download reports (HTML/JSON)
  - Re-run failed tests
  - Stop running tests
```

### 2. API Endpoints

#### Test Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/test-runs/{id}` | Get test run details |
| GET | `/api/test-runs/{id}/results?status=failed` | Get test results (filterable) |
| GET | `/api/test-runs/{id}/download?format=html` | Download HTML report |
| GET | `/api/test-runs/{id}/download?format=json` | Download JSON report |
| POST | `/api/test-runs/{id}/rerun-failed` | Create new run for failed tests |
| POST | `/api/test-runs/{id}/stop` | Stop running test |

#### Test Execution

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/test-execution/run` | Start test run |
| POST | `/api/test-execution/{id}/cancel` | Cancel test run |
| GET | `/api/test-execution/{id}/status` | Get run status |

#### SignalR Events

| Event | When | Data |
|-------|------|------|
| `TestRunUpdated` | Status changes | `{ status, totalTests, passedTests, failedTests }` |
| `TestRunCompleted` | Run finishes | `{ status, totalTests, passedTests, failedTests }` |
| `TestResultAdded` | Test completes | `{ id, testCaseId, status, durationMs, errorMessage }` |

### 3. Features Implemented

✅ **Test Results Capture**

- TestCafe JSON reporter captures detailed results
- Each test reports: name, status, duration, errors, stack traces
- Results saved to database
- Real-time SignalR broadcasts

✅ **Report Generation**

- HTML reports with beautiful styling
- JSON reports with complete data
- Downloadable via API

✅ **Re-run Failed Tests**

- Creates new test run with only failed tests
- Maintains link to original run
- Returns test case IDs for frontend

✅ **Stop Running Tests**

- Marks run as cancelled in database
- Sets completion timestamp
- (Note: TestRunner doesn't yet abort execution)

✅ **Retry Logic**

- Webhook updates retry 3x with exponential backoff
- Test results retry 3x with exponential backoff
- 10-second timeout on all requests
- Detailed logging

✅ **Test Counts Tracking**

- Accurate total/passed/failed counts
- Functional requirement tracking
- Success rate calculation

✅ **TestCafe Generation**

- Proper JSON serialization (camelCase)
- `{ replace: true }` to prevent duplicate text
- Comprehensive error handling

---

## 🚧 Frontend Design Notes / Roadmap

> Note: Most of the core frontend functionality is now implemented. This section serves as design notes and reference code for future enhancements.

### Priority 1: Test Run Details Page

**File**: `apps/test-automation-ui/src/pages/TestRunDetailsPage.tsx`

**Route**: `/test-runs/:id`

**Features**:

```tsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

export function TestRunDetailsPage() {
  const { id } = useParams();
  const [testRun, setTestRun] = useState(null);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('all');
  const [connection, setConnection] = useState(null);

  // Fetch test run details
  useEffect(() => {
    fetch(`/api/test-runs/${id}`)
      .then(res => res.json())
      .then(setTestRun);
  }, [id]);

  // Fetch results
  useEffect(() => {
    const url = filter === 'all' 
      ? `/api/test-runs/${id}/results`
      : `/api/test-runs/${id}/results?status=${filter}`;
    
    fetch(url)
      .then(res => res.json())
      .then(setResults);
  }, [id, filter]);

  // SignalR connection
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('/hubs/testrun')
      .withAutomaticReconnect()
      .build();

    newConnection.start().then(() => {
      newConnection.invoke('JoinTestRun', id);
      
      newConnection.on('TestRunUpdated', (data) => {
        setTestRun(prev => ({ ...prev, ...data }));
      });
      
      newConnection.on('TestResultAdded', (data) => {
        setResults(prev => [...prev, data]);
      });
      
      newConnection.on('TestRunCompleted', (data) => {
        toast.success('Test run completed!');
      });
    });

    setConnection(newConnection);
    return () => newConnection?.stop();
  }, [id]);

  const downloadReport = (format) => {
    window.open(`/api/test-runs/${id}/download?format=${format}`);
  };

  const rerunFailed = async () => {
    const res = await fetch(`/api/test-runs/${id}/rerun-failed`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { runId } = await res.json();
    navigate(`/test-runs/${runId}`);
  };

  const stopRun = async () => {
    await fetch(`/api/test-runs/${id}/stop`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    toast.success('Test run stopped');
  };

  return (
    <div className="test-run-details">
      {/* Summary Cards */}
      <div className="summary-grid">
        <Card title="Total Tests" value={testRun?.totalTests} />
        <Card title="Passed" value={testRun?.passedTests} color="green" />
        <Card title="Failed" value={testRun?.failedTests} color="red" />
        <Card title="Success Rate" value={`${testRun?.successRate}%`} />
      </div>

      {/* Actions */}
      <div className="actions">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Tests</option>
          <option value="passed">Passed Only</option>
          <option value="failed">Failed Only</option>
        </select>
        
        <button onClick={() => downloadReport('html')}>
          Download HTML
        </button>
        <button onClick={() => downloadReport('json')}>
          Download JSON
        </button>
        
        {testRun?.failedTests > 0 && (
          <button onClick={rerunFailed}>
            Re-run Failed Tests
          </button>
        )}
        
        {testRun?.status === 'Running' && (
          <button onClick={stopRun}>
            Stop Run
          </button>
        )}
      </div>

      {/* Results Table */}
      <table>
        <thead>
          <tr>
            <th>Test Case</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Run At</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <TestResultRow key={result.id} result={result} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### Priority 2: Enhanced Dashboard

**File**: `apps/test-automation-ui/src/pages/Dashboard.tsx`

**Features to Add**:

```tsx
// Add recent runs table
const [recentRuns, setRecentRuns] = useState([]);

useEffect(() => {
  fetch('/dashboard/recent-runs')
    .then(res => res.json())
    .then(setRecentRuns);
}, []);

// Make rows clickable
<table>
  <tbody>
    {recentRuns.map(run => (
      <tr 
        key={run.id} 
        onClick={() => navigate(`/test-runs/${run.id}`)}
        style={{ cursor: 'pointer' }}
      >
        <td>{run.runName}</td>
        <td><StatusBadge status={run.status} /></td>
        <td>{run.passedTests}/{run.totalTests}</td>
        <td>{run.startedAt}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### Priority 3: SignalR Hook

**File**: `apps/test-automation-ui/src/hooks/useTestRunUpdates.ts`

```typescript
import { useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

export function useTestRunUpdates(runId: string) {
  const [connection, setConnection] = useState(null);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('/hubs/testrun')
      .withAutomaticReconnect()
      .build();

    newConnection.start().then(() => {
      newConnection.invoke('JoinTestRun', runId);
      
      newConnection.on('TestRunUpdated', (data) => {
        setUpdates(prev => [...prev, { type: 'updated', data }]);
      });
      
      newConnection.on('TestResultAdded', (data) => {
        setUpdates(prev => [...prev, { type: 'result', data }]);
      });
      
      newConnection.on('TestRunCompleted', (data) => {
        setUpdates(prev => [...prev, { type: 'completed', data }]);
      });
    });

    setConnection(newConnection);
    return () => newConnection?.stop();
  }, [runId]);

  return { connection, updates };
}
```

---

## 🧪 Testing Guide

### 1. Test the Backend

```bash
# Start TestAutomation API
cd apis/TestAutomation.Api
dotnet run

# Start TestRunner
cd apis/TestRunner
pnpm api

# Start Frontend
cd apps/test-automation-ui
pnpm dev
```

### 2. Run a Test

1. Go to <http://testora.asafarim.local:5180/test-suites>
2. Click on a test suite
3. Click "Run Test"
4. Check browser console for SignalR messages
5. Check database: `TestResults` table should have data

### 3. Verify Features

```bash
# Check test run details
curl http://localhost:5200/api/test-runs/{runId}

# Get failed tests
curl http://localhost:5200/api/test-runs/{runId}/results?status=failed

# Download HTML report
curl http://localhost:5200/api/test-runs/{runId}/download?format=html -o report.html

# Re-run failed tests
curl -X POST http://localhost:5200/api/test-runs/{runId}/rerun-failed \
  -H "Authorization: Bearer {token}"

# Stop running test
curl -X POST http://localhost:5200/api/test-runs/{runId}/stop \
  -H "Authorization: Bearer {token}"
```

---

## 📚 Documentation

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete backend implementation details
- **[FUNCTIONAL_GAPS_IMPLEMENTATION.md](./FUNCTIONAL_GAPS_IMPLEMENTATION.md)** - Detailed guide for remaining features
- **This file** - Quick reference and overview

---

## 🎯 Next Steps

1. **Implement Test Run Details Page** (2-3 hours)
   - Display test run summary
   - Show test results table
   - Add filter and download buttons

2. **Enhance Dashboard** (2-3 hours)
   - Make recent runs clickable
   - Add KPI cards
   - Integrate SignalR updates

3. **Add SignalR Integration** (1-2 hours)
   - Create custom hook
   - Subscribe to events
   - Show real-time updates

4. **Test Data Sets Integration** (3-4 hours)
   - Link datasets to test runs
   - Inject variables into tests
   - Show dataset in results

5. **Polish & Testing** (2-3 hours)
   - Add loading states
   - Error handling
   - Empty states
   - E2E testing

---

## 🐛 Known Issues

1. **Stop Run**: Only updates database, doesn't abort TestRunner execution
2. **Test Case Matching**: Results don't include testCaseId (matched by name)
3. **No Scheduled Runs**: Background service not implemented
4. **No Notifications**: Email/Slack integration missing

---

## 🚀 Production Readiness

### Before Deploying

- [ ] Implement frontend pages
- [ ] Add comprehensive error handling
- [ ] Set up monitoring/logging
- [ ] Add rate limiting
- [ ] Security audit
- [ ] Performance testing
- [ ] Documentation for end users

---

**Status**: Backend 100% Complete ✅ | Frontend ~75% Complete 🚧

**Last Updated**: November 18, 2025

### Environment Variables

```env
VITE_API_URL=http://testora.asafarim.local:5200
VITE_IDENTITY_URL=http://identity.asafarim.local:5101
```

## Deployment

1. **Build the application**

   ```bash
   pnpm build
   ```

2. **Deploy to production**

   ```bash
   pnpm deploy
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the **MIT License** — see the LICENSE file for details.
