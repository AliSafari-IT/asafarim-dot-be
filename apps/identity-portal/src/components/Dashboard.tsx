import { useAuth } from '../hooks/useAuth';
import identityService from '../api/identityService';
import { useEffect, useState } from 'react';
import './dashboard.css';

export const Dashboard = () => {
  const { isAuthenticated, user, reloadProfile } = useAuth();
  const [busy, setBusy] = useState(false);

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
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = (user?.roles || []).some(r => /^(admin|superadmin)$/i.test(r)) ? '/admin/user-profile' : '/me')}
            >
              Edit profile
            </button>

            <button
              className="btn btn-outline"
              disabled={busy}
              onClick={async () => {
                const currentPassword = prompt('Current password') ?? '';
                const newPassword = prompt('New password') ?? '';
                const confirmPassword = prompt('Confirm new password') ?? '';
                if (!currentPassword || !newPassword) return;
                setBusy(true);
                try {
                  await identityService.changePassword({ currentPassword, newPassword, confirmPassword });
                  alert('Password changed successfully');
                } catch (e: unknown) {
                  alert((e as Error)?.message ?? 'Failed to change password');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Change password
            </button>

            {(user?.roles || []).some(r => /^(admin|superadmin)$/i.test(r)) && (
              <button className="btn" onClick={() => (window.location.href = '/admin/users')}>
                Manage users
              </button>
            )}

            <button className="btn" onClick={() => window.open('http://blog.asafarim.local:3000', '_blank')}>
              Open blog
            </button>
            <button className="btn" onClick={() => window.open('http://web.asafarim.local:5175', '_blank')}>
              Web portal
            </button>
            <button className="btn" onClick={() => window.open('http://ai.asafarim.local:5173', '_blank')}>
              AI portal
            </button>
            <button className="btn" onClick={() => window.open('http://core.asafarim.local:5174', '_blank')}>
              Core portal
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
