import { type ReactNode, useRef } from 'react';
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
  const hasShownNotificationRef = useRef(false);
  
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
  if (requireAuth && !isAuthenticated && !loading) {
    console.log('[ProtectedRoute] Access denied (no auth). Redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated, redirect appropriately
  if (!requireAuth && isAuthenticated) {
    // Check for returnUrl in query params (for login/register pages)
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl');
    
    let finalRedirect = redirectTo;
    
    if (returnUrl) {
      // Prevent infinite loop: if returnUrl points to login/register page, use dashboard instead
      const isReturnUrlAuthPage = 
        returnUrl === '/login' || 
        returnUrl === '/register' ||
        returnUrl.endsWith('/login') ||
        returnUrl.endsWith('/register') ||
        returnUrl.includes('/login?') ||
        returnUrl.includes('/register?') ||
        returnUrl.includes('/login#') ||
        returnUrl.includes('/register#');
      
      if (isReturnUrlAuthPage) {
        console.log('[ProtectedRoute] returnUrl points to auth page, using default redirect:', redirectTo);
        finalRedirect = redirectTo;
      } else {
        console.log('[ProtectedRoute] Using returnUrl for redirect:', returnUrl);
        finalRedirect = returnUrl;
      }
    }
    
    console.log('[ProtectedRoute] Already authenticated but on public route, redirecting to', finalRedirect);
    
    // Show notification ONCE when redirecting from login page
    if ((location.pathname === '/login' || location.pathname === '/register') && !hasShownNotificationRef.current) {
      hasShownNotificationRef.current = true;
      setTimeout(() => {
        addNotification(`You are already signed in. Redirecting...`, 'info', 2000);
      }, 100);
    }
    
    // If finalRedirect is an external URL, use window.location
    if (finalRedirect.startsWith('http://') || finalRedirect.startsWith('https://')) {
      console.log('[ProtectedRoute] External redirect:', finalRedirect);
      window.location.href = finalRedirect;
      return null; // Return null while redirecting
    }
    
    return <Navigate to={finalRedirect} replace />;
  }

  // Render children if conditions are met
  console.log('[ProtectedRoute] Conditions met, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
