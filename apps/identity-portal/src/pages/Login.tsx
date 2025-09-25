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
      console.log('[Login] Already authenticated, navigating to:', returnUrl || '/dashboard');
      navigate(returnUrl || '/dashboard', { replace: true });
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
