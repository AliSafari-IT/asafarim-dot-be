// App.tsx
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isProduction, useAuth, ThemeProvider } from '@asafarim/shared-ui-react';
import { ToastProvider, Toaster } from '@asafarim/toast';
import '@asafarim/toast/styles.css';
import Dashboard from './pages/Dashboard';
import TestRunPage from './pages/TestRunPage';
import FunctionalRequirementsPage from './pages/FunctionalRequirementsPage';
import FixturesPage from './pages/FixturesPage';
import TestSuitesPage from './pages/TestSuitesPage';
import TestCasesPage from './pages/TestCasesPage';
import TestDataSetsPage from './pages/TestDataSetsPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const authApiBase = isProduction 
    ? 'https://identity.asafarim.be/auth'
    : 'http://identity.asafarim.local:5101/auth';
  
  const { user, loading, isAuthenticated } = useAuth({
    authApiBase,
    identityLoginUrl: isProduction
      ? 'https://identity.asafarim.be/login'
      : 'http://identity.asafarim.local:5177/login'
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      const redirectUrl = isProduction ? 
        'https://identity.asafarim.be/login?redirect=' + encodeURIComponent(window.location.href) : 
        'http://identity.asafarim.local:5177/login?redirect=' + encodeURIComponent(window.location.href);
      window.location.href = redirectUrl;
    }
  }, [isAuthenticated, loading]);

  if (loading || !isAuthenticated) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
      <ToastProvider>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Sidebar />
            <div className="content-wrapper">
              <Toaster />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/run" element={<TestRunPage />} />
                <Route path="/functional-requirements" element={<FunctionalRequirementsPage />} />
                <Route path="/fixtures" element={<FixturesPage />} />
                <Route path="/test-suites" element={<TestSuitesPage />} />
                <Route path="/test-cases" element={<TestCasesPage />} />
                <Route path="/test-data-sets" element={<TestDataSetsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </ToastProvider>
  );
}

export default App;