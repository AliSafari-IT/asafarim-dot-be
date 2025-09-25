import { useState } from 'react';
import './dashboard.css';
import { Button } from '@asafarim/shared-ui-react';
import { BLOG_URL, WEB_URL, AI_URL, CORE_URL, openInNewTab } from '../utils/appUrls';
import ChangePasswordModal from './ChangePasswordModal';
import useAuth from '../hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
              onClick={() => (window.location.href = (user?.roles || []).some((r: string) => /^(admin|superadmin)$/i.test(r)) ? '/admin/user-profile' : '/me')}
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

            {(user?.roles || []).some((r: string) => /^(admin|superadmin)$/i.test(r)) && (
              <Button onClick={() => (window.location.href = '/admin/users')} variant="info">
                Manage users
              </Button>
            )}

            <Button onClick={() => openInNewTab(BLOG_URL)} variant="info">
              Open blog
            </Button>
            <Button onClick={() => openInNewTab(WEB_URL)} variant="info">
              Web portal
            </Button>
            <Button onClick={() => openInNewTab(AI_URL)} variant="info">
              AI portal
            </Button>
            <Button onClick={() => openInNewTab(CORE_URL)} variant="info">
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
