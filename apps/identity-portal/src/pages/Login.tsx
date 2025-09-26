import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginHero from '../components/LoginHero';

export const Login = () => {
  const { isAuthenticated, isLoading, passwordSetupRequired } = useAuth();
  const navigate = useNavigate();
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && !passwordSetupRequired) {
      console.log('[Login] Already authenticated, redirecting to:', returnUrl || '/dashboard');
      
      // Check if returnUrl is an external URL
      if (returnUrl && (returnUrl.startsWith('http://') || returnUrl.startsWith('https://'))) {
        console.log('[Login] Redirecting to external URL:', returnUrl);
        window.location.href = returnUrl;
      } else {
        // Internal navigation using React Router
        console.log('[Login] Navigating to internal path:', returnUrl || '/dashboard');
        navigate(returnUrl || '/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, returnUrl, isLoading, passwordSetupRequired, navigate]);

  return (
    <LoginHero 
      passwordSetupRequired={passwordSetupRequired}
      returnUrl={returnUrl}
    />
  );
};

export default Login;
