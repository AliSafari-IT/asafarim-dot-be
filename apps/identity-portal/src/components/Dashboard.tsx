import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import './dashboard.css';
import { Button } from '@asafarim/shared-ui-react';
import ChangePasswordModal from './ChangePasswordModal';

export const Dashboard = () => {
  const { isAuthenticated, user, reloadProfile } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = 'http://identity.asafarim.local:5177/login';
    }
  }, [isAuthenticated]);

  // Refresh profile on mount and when tab becomes visible
  useEffect(() => {
    void reloadProfile();
    const onVis = () => {
      if (!document.hidden) void reloadProfile();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [reloadProfile]);

  const roles = (user?.roles || ['Viewer']).join(', ');

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-header-inner">
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">{user?.firstName || user?.email}</p>
        </div>
      </header>

      <main className="dash-main">
        <section className="dash-grid">
          <article className="card">
            <h2 className="card-title">Account</h2>
            <div className="field">
              <label>Email</label>
              <input className="field-input" value={user?.email || ''} readOnly />
            </div>
            <div className="field">
              <label>Username</label>
              <input className="field-input" value={user?.userName || ''} readOnly />
            </div>
          </article>

          <article className="card">
            <h2 className="card-title">Access</h2>
            <div className="field">
              <label>Roles</label>
              <input className="field-input" value={roles} readOnly />
            </div>
          </article>
        </section>

        <section className="card actions">
          <h2 className="card-title">Actions</h2>
          <div className="actions-row">
            <Button
              onClick={() => (window.location.href = (user?.roles || []).some(r => /^(admin|superadmin)$/i.test(r)) ? '/admin/user-profile' : '/me')}
              variant="success"
            >
              Edit profile
            </Button>

            <Button
              onClick={() => setIsPasswordModalOpen(true)}
              variant="warning"
            >
              Change password
            </Button>

            {(user?.roles || []).some(r => /^(admin|superadmin)$/i.test(r)) && (
              <Button onClick={() => (window.location.href = '/admin/users')} variant="info">
                Manage users
              </Button>
            )}

            <Button onClick={() => window.open('http://blog.asafarim.local:3000', '_blank')} variant="info">
              Open blog
            </Button>
            <Button onClick={() => window.open('http://web.asafarim.local:5175', '_blank')} variant="info">
              Web portal
            </Button>
            <Button onClick={() => window.open('http://ai.asafarim.local:5173', '_blank')} variant="info">
              AI portal
            </Button>
            <Button onClick={() => window.open('http://core.asafarim.local:5174', '_blank')} variant="info">
              Core portal
            </Button>
          </div>
        </section>
      </main>
      
      {/* Password Change Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
