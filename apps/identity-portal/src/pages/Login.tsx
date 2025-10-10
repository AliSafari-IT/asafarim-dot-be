import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginHero from '../components/LoginHero';

export const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
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
      
      console.log('Already authenticated, redirecting to:', redirectTo);
      // If returnUrl is a full URL (external), perform a hard redirect so cookies and
      // cross-origin navigation behave correctly. Otherwise, use SPA navigation.
      if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
        window.location.href = redirectTo;
      } else {
        navigate(redirectTo, { replace: true });
      }
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
