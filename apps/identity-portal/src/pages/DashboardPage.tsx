// DashboardPage.tsx

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from "../components/AuthLayout";
import { Dashboard } from "../components/Dashboard";
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const hasCheckedAuth = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (loading || hasCheckedAuth.current) {
      return;
    }
    
    // Check if we just completed login - if so, give auth state time to stabilize
    const justCompletedLogin = sessionStorage.getItem('login_just_completed') === 'true';
    
    if (justCompletedLogin) {
      // We just logged in, wait a moment for auth state to fully stabilize
      console.log('🔄 Just logged in, waiting for auth to stabilize...');
      const checkTimeout = setTimeout(() => {
        sessionStorage.removeItem('login_just_completed');
        if (!isAuthenticated) {
          console.log('❌ Still not authenticated after login, redirecting back...');
          hasCheckedAuth.current = true;
          navigate('/login', { replace: true });
        } else {
          console.log('✅ Authenticated confirmed, dashboard accessible');
          hasCheckedAuth.current = true;
        }
      }, 1000); // Give 1 second for auth state to stabilize after login
      
      return () => clearTimeout(checkTimeout);
    }
    
    // Normal auth check for direct navigation to dashboard
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login...');
      hasCheckedAuth.current = true;
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
