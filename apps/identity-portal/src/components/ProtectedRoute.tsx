import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected route component that handles authentication redirects
 * 
 * @param children - The child components to render if authenticated
 * @param requireAuth - Whether authentication is required (default: true)
 */
export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/dashboard'
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const { addNotification } = useNotification();
  
  console.log('[ProtectedRoute] Auth check:', { 
    isAuthenticated,
    loading,
    requireAuth,
    path: location.pathname
  });

  // Show loading state while checking authentication
  if (loading) {
    console.log('[ProtectedRoute] Auth is loading, showing spinner...');
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // If authentication is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    console.log('[ProtectedRoute] Access denied (no auth). Redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    console.log('[ProtectedRoute] Already authenticated but on public route, redirecting to', redirectTo);
    // Show notification when redirecting from login page to dashboard
    if (location.pathname === '/login') {
      // Use setTimeout to ensure notification is shown after navigation
      setTimeout(() => {
        addNotification(`You are signed in. Redirecting to ${redirectTo}`, 'info', 2000);
      }, 100);
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if conditions are met
  console.log('[ProtectedRoute] Conditions met, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
