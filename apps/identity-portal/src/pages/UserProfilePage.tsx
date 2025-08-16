// UserProfilePage.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import UserProfile from '../components/UserProfile';
import { useAuth } from '../hooks/useAuth';

export const UserProfilePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(returnUrl || '/login');
    }
  }, [isAuthenticated, navigate, returnUrl]);

  return (
    <AuthLayout 
      title="User Profile" 
      subtitle="Manage your profile"
    >
      <UserProfile />
    </AuthLayout>
  );
};

export default UserProfilePage;
