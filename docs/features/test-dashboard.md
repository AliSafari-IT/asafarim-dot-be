# 🧪 Test Automation Dashboard & Run Details - Feature Specification

## 1. Overview
The **Test Automation Dashboard** and **Test Run Details Page** provide real-time monitoring and analysis of automated test runs.

- **Dashboard:** Key metrics, recent test runs, aggregated statistics
- **Run Details:** Live progress, results, logs via SignalR

---

## 2. Functional Requirements

### Dashboard
- Display KPI cards: Total Runs, Passed, Failed, In Progress
- Show last 10 test runs in table
- Navigate to run details by clicking rows
- Empty state with "Go to Test Suites" CTA

### Test Run Details
- Real-time SignalR updates (TestResultAdded, TestRunCompleted)
- Summary cards: Total, Passed, Failed, Success Rate, Duration, Status
- Filter results: All/Passed/Failed/Skipped
- Actions: Re-run Failed, Stop Run, Download Reports (HTML/JSON)
- Expandable error details with stack traces

---

## 3. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/test-runs` | All test runs (ordered by StartedAt desc) |
| GET | `/api/test-runs/{id}` | Run metadata |
| GET | `/api/test-runs/{id}/results?status=failed` | Test results with filter |
| POST | `/api/test-runs/{id}/rerun-failed` | Rerun failed tests |
| POST | `/api/test-runs/{id}/stop` | Stop running test |
| GET | `/api/test-runs/{id}/download?format=json` | Download report |

---

## 4. SignalR Integration

**Hub:** `/hubs/testrun`

**Events (Server → Client):**
- `TestResultAdded` - New result available
- `TestRunStatusChanged` - Status updated
- `TestRunCompleted` - Run finished
- `TestRunAborted` - Run stopped

**Events (Client → Server):**
- `JoinTestRun(runId)` - Subscribe to updates
- `LeaveTestRun(runId)` - Unsubscribe

---

## 5. Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | CSS Variables (shared design tokens) |
| SignalR | `@microsoft/signalr` v8.x |
| Backend | ASP.NET Core 8 + EF Core |
| Database | PostgreSQL |
| Auth | JWT Bearer tokens |

---

## 6. UI Components

### Dashboard
- **KPI Cards:** 4 gradient cards with icons
- **Recent Runs Table:** Name, Status, Tests, Success Rate (progress bar), Started, Actions
- **Status Badges:** Color-coded (green/red/blue/yellow/gray)

### Test Run Details
- **Summary Cards:** 6 cards showing metrics
- **Run Info Panel:** Environment, Browser, Timestamps
- **Actions Bar:** Filter, Re-run, Stop, Download buttons
- **Results Table:** Expandable rows with error details

---

## 7. Data Flow

1. Dashboard fetches `/api/test-runs` → calculates stats locally
2. Details page fetches run + results → connects to SignalR
3. SignalR events update UI in real-time
4. User actions trigger API calls → refresh data

---

## 8. Success Metrics

- Dashboard loads < 2s
- Details page loads < 1.5s
- SignalR updates < 500ms
- 95%+ SignalR uptime
- Re-run/Stop actions work reliably

---

## 9. Future Enhancements

- Email/Slack notifications
- Analytics charts (Recharts)
- Advanced filtering (date range, environment)
- PDF export
- Scheduled runs
- CI/CD integration
