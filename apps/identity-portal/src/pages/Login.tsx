import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginHero from '../components/LoginHero';

// Use sessionStorage to track if we just completed a login to prevent redirect loops
const LOGIN_COMPLETED_KEY = 'login_just_completed';

export const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
  const hasRedirectedRef = useRef(false);
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    // Prevent double redirects
    if (hasRedirectedRef.current) {
      return;
    }
    
    // Wait for initial load to complete
    if (loading) {
      return;
    }
    
    // Check if we just completed a login from the form
    // Don't remove the flag here - let it persist for Dashboard to use
    const justCompletedLogin = sessionStorage.getItem(LOGIN_COMPLETED_KEY) === 'true';
    if (justCompletedLogin) {
      console.log('🛑 Login just completed via form, LoginForm is handling redirect');
      // Don't return - let the redirect happen if isAuthenticated is true
      // The flag will be cleaned up by Dashboard
    }
    
    if (isAuthenticated && !justCompletedLogin) {
      // User is authenticated and didn't just login via form
      // This means they navigated to /login while already logged in
      let redirectTo = returnUrl || '/dashboard';
      
      // Prevent infinite loop: if returnUrl points to login page, use dashboard instead
      const isReturnUrlLoginPage = returnUrl && (
        returnUrl === '/login' || 
        returnUrl.endsWith('/login') ||
        returnUrl.includes('/login?') ||
        returnUrl.includes('/login#')
      );
      
      if (isReturnUrlLoginPage) {
        console.log('⚠️ returnUrl points to login page, redirecting to dashboard instead');
        redirectTo = '/dashboard';
      }
      
      console.log('Already authenticated (not from form), redirecting to:', redirectTo);
      hasRedirectedRef.current = true;
      
      // Slight delay to prevent flash
      setTimeout(() => {
        // If returnUrl is a full URL (external), perform a hard redirect so cookies and
        // cross-origin navigation behave correctly. Otherwise, use SPA navigation.
        if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
          window.location.href = redirectTo;
        } else {
          navigate(redirectTo, { replace: true });
        }
      }, 100);
    }
  }, [isAuthenticated, loading, navigate, returnUrl]);

  // Show loading state
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <LoginHero 
        returnUrl={returnUrl}
      />
    </div>
  );
};

export default Login;
