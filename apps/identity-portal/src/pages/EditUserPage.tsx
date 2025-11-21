import AuthLayout from '../components/AuthLayout';
import EditUser from '../components/EditUser';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditUserPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('[EditUserPage] Component rendered, auth state:', { isAuthenticated, loading, user });

  // Redirect non-admin users
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login?returnUrl=/admin/users');
      return;
    }

    // Check if user has admin role (case-insensitive)
    const userRoles = user?.roles || [];
    const isAdmin = userRoles.some((role: string) => role.toLowerCase() === 'admin');
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate, loading]);

  return (
    <div data-testid="edit-user-page">
      <AuthLayout>
        <EditUser />
      </AuthLayout>
    </div>
  );
}
