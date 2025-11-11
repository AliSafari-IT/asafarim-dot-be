import { createRoot } from 'react-dom/client'
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
import ProtectedRoute from './components/ProtectedRoute'
// import { Portfolio } from './components/Portfolio'
// import { PortfolioPublicView } from './pages/Portfolio/PortfolioPublicView'
// import { PortfolioDashboard } from './pages/Portfolio/PortfolioDashboard'
import './index.css';

// Initialize i18n before rendering
initI18n();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <CoreAppHome /> },
      { path: "jobs", element: (
        <ProtectedRoute>
          <JobTracker />
        </ProtectedRoute>
      ) },
      { path: "jobs/:jobId/edit", element: (
        <ProtectedRoute>
          <JobEdit />
        </ProtectedRoute>
      ) },
      { path: "jobs/:jobId/view", element: (
        <ProtectedRoute>
          <JobView />
        </ProtectedRoute>
      ) },
      // { path: "portfolio", element: <Portfolio /> },
      // { path: "u/:username", element: <PortfolioPublicView /> },
      // { path: "dashboard/portfolio", element: <PortfolioDashboard /> },
      { path: "*", element: <NotFound /> },
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <NotificationProvider>
    <ToastProvider>
    <RouterProvider router={router} />
    </ToastProvider>
  </NotificationProvider>
</React.StrictMode>,
)
