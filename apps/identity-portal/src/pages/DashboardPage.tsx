// DashboardPage.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from "../components/AuthLayout";
import { Dashboard } from "../components/Dashboard";
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login...');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout
      title="Dashboard"
      subtitle="Welcome to the dashboard"
    >
      <Dashboard />
    </AuthLayout>
  );
}
