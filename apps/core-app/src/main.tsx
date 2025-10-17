import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import React from 'react'
import { 
  NotFound,
  NotificationProvider
} from '@asafarim/shared-ui-react'
import { RouterProvider } from 'react-router-dom'
import { initI18n } from '@asafarim/shared-i18n'
import JobEdit from './components/JobTracker/JobEdit'
import JobView from './components/JobTracker/JobView'
import CoreAppHome from './pages/CoreAppHome'
import { createBrowserRouter } from 'react-router-dom'
import JobTracker from './components/JobTracker/JobTracker'
import { ToastProvider } from '@asafarim/toast'
import { Portfolio } from './components/Portfolio'
import { PortfolioPublicView } from './pages/Portfolio/PortfolioPublicView'
import { PortfolioDashboard } from './pages/Portfolio/PortfolioDashboard'
import ErrorBoundary from './components/ErrorBoundary'

// Login redirect component
const LoginRedirect = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect') || '/';

  // Redirect to identity service
  const identityLoginUrl = `https://identity.asafarim.be/login?redirect=${encodeURIComponent(`https://core.asafarim.be${redirect}`)}`;
  window.location.href = identityLoginUrl;
  return null;
};

// Initialize i18n before rendering
initI18n();

// Error fallback component for router errors
const RouterErrorFallback = () => (
  <div style={{ maxWidth: '600px', margin: '100px auto', padding: '20px', textAlign: 'center' }}>
    <h1>Page Error</h1>
    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
      Something went wrong loading this page.
    </p>
    <button 
      onClick={() => window.location.href = '/'}
      style={{
        padding: '10px 20px',
        background: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      Go to Home
    </button>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouterErrorFallback />,
    children: [
      { index: true, element: <CoreAppHome /> },
      { path: "login", element: <LoginRedirect /> },
      { path: "jobs", element: <JobTracker /> },
      { path: "jobs/:jobId/edit", element: <JobEdit /> },
      { path: "jobs/:jobId/view", element: <JobView /> },
      { path: "portfolio", element: <Portfolio />, errorElement: <RouterErrorFallback /> },
      { path: "u/:username", element: <PortfolioPublicView />, errorElement: <RouterErrorFallback /> },
      { path: "dashboard/portfolio", element: <PortfolioDashboard />, errorElement: <RouterErrorFallback /> },
      { path: "*", element: <NotFound /> },
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <NotificationProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </NotificationProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
