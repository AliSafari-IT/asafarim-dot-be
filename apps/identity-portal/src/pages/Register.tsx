import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import RegisterHero from '../components/RegisterHero';

export const Register = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, loading]);

  return (
    <div data-testid="register-page">
      <AuthLayout>
        <RegisterHero />
      </AuthLayout>
    </div>
  );
};

export default Register;
