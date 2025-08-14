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
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { addNotification } = useNotification();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    // Show notification when redirecting from login page to dashboard
    if (location.pathname === '/login') {
      // Use setTimeout to ensure notification is shown after navigation
      setTimeout(() => {
        addNotification(`You are signed in. Redirecting to ${redirectTo}`, 'info', 5000);
      }, 100);
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if conditions are met
  return <>{children}</>;
};

export default ProtectedRoute;
