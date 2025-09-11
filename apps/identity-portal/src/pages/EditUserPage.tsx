import AuthLayout from '../components/AuthLayout';
import EditUser from '../components/EditUser';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditUserPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect non-admin users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/admin/users');
      return;
    }
    
    // Check if user has admin role (case-insensitive)
    const userRoles = user?.roles || [];
    const isAdmin = userRoles.some(role => role.toLowerCase() === 'admin');
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <AuthLayout 
      title="Admin: Edit User" 
      subtitle="Manage user account details and permissions"
    >
      <EditUser />
    </AuthLayout>
  );
}
