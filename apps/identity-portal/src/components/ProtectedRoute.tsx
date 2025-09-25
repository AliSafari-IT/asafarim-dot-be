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
  
  // CRITICAL: Double-check auth token exists when page is refreshed
  // This is needed because context might say authenticated=false while token is still loading
  const authToken = localStorage.getItem("auth_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const storedUser = localStorage.getItem("user_info");
  
  // Consider authenticated if ANY of these conditions are true
  const hasAuthToken = !!authToken;
  const hasRefreshToken = !!refreshToken;
  const hasStoredUser = !!storedUser;
  
  // Access is allowed if authenticated via context OR any token/user exists in localStorage
  const canAccess = isAuthenticated || hasAuthToken || hasRefreshToken || hasStoredUser;
  
  console.log('[ProtectedRoute] DETAILED AUTH CHECK:', { 
    isAuthenticated, 
    hasAuthToken, 
    hasRefreshToken,
    hasStoredUser,
    authTokenValue: authToken ? authToken.substring(0, 10) + '...' : 'null',
    canAccess,
    requireAuth,
    path: location.pathname,
    isLoading
  });

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('[ProtectedRoute] Auth is loading, showing spinner...');
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  console.log('[ProtectedRoute] Auth state:', { 
    isAuthenticated, 
    requireAuth, 
    path: location.pathname,
    authToken: localStorage.getItem('auth_token') ? 'exists' : 'missing',
    hasAuthToken,
    isLoading
  });

  // If authentication is required but access is not allowed, redirect to login
  if (requireAuth && !canAccess) {
    console.log('[ProtectedRoute] Access denied (no auth). Redirecting to /login');
    console.log('[ProtectedRoute] Auth factors:', {
      authToken,
      refreshToken,
      storedUser: storedUser ? storedUser.substring(0, 30) + '...' : 'null',
      allLocalStorageKeys: Object.keys(localStorage)
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated, redirect to dashboard
  if (!requireAuth && canAccess) {
    console.log('[ProtectedRoute] Already authenticated but on public route, redirecting to', redirectTo);
    console.log('[ProtectedRoute] Auth details for redirect:', { isAuthenticated, hasAuthToken, requireAuth });
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
