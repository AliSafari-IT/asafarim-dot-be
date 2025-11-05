# Testora UI

## Overview

Testora UI is a modern, interactive test automation dashboard built with React, TypeScript, and TailwindCSS. It provides a comprehensive view of test automation metrics, recent runs, and analytics for TestCafe E2E testing.

## Features

- 📊 **Interactive Dashboard** — Modern UI with KPI cards, charts, and progress bars  
- 📈 **Analytics** — Success rate trends and test distribution visualizations  
- 📋 **Recent Runs** — Detailed table of recent test runs with status and results  
- 🌓 **Dark Mode** — Full dark mode support with system preference detection  
- 📱 **Responsive Design** — Optimized for 768–1428px width range  
- ♿ **Accessibility** — WCAG compliant with proper contrast and keyboard navigation  
- 🎨 **Modern UI** — Inspired by Datadog, Linear, and Grafana  
- 🔄 **Real-time Updates** — Automatic data refresh and hot reload  

## Tech Stack

- Framework: React 18 with TypeScript  
- Styling: TailwindCSS with custom CSS  
- State Management: React Hooks  
- API Integration: Axios  
- Build Tool: Vite  
- Package Manager: pnpm  

## Prerequisites

- Node.js 18+  
- pnpm 8+  
- TestAutomation.Api running on port 5200  
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

## Development

### Project Structure

```
src/
├── components/     # Reusable components
├── pages/          # Page components
│   ├── Dashboard.tsx
│   └── Dashboard.css
├── config/         # Configuration
│   └── api.ts
└── App.tsx         # Root component
```

### Available Scripts

```bash
# Start development server
pnpm start

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

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
