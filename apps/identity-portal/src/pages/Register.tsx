import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '@asafarim/shared-ui-react';

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
    <AuthLayout 
      title="Create Account" 
      subtitle="Sign up to get started with ASafariM"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
