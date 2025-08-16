import { useAuth } from '../hooks/useAuth';
import identityService from '../api/identityService';
import { useEffect, useState } from 'react';
import './dashboard.css';

export const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = 'http://identity.asafarim.local:5177/login';
    }
  }, [isAuthenticated]);

  return (
    <div className="dashboard-content">
      <div className="dashboard-card">
        {/* Premium Header Section */}
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1 className="dashboard-title" data-text="Welcome back!">
              Welcome back!
            </h1>
            <p className="dashboard-subtitle">{user?.firstName || user?.email}</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="dashboard-body">
          {/* Profile Information */}
          <section className="profile-section">
            <h2 className="section-title">Profile Information</h2>
            <div className="profile-grid">
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input 
                  className="profile-input" 
                  value={user?.email || ''} 
                  disabled 
                  readOnly
                />
              </div>
              <div className="input-group">
                <label className="input-label">Assigned Roles</label>
                <input 
                  className="profile-input" 
                  value={(user?.roles || ['Viewer']).join(' • ')} 
                  disabled 
                  readOnly
                />
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="action-grid">
              {user?.roles?.includes('Admin') ? (
                <button
                  className="action-button btn-primary"
                  onClick={() => (window.location.href = '/admin/user-profile')}
                >
                  <span className="icon">👤</span>
                  Edit Profile
                </button>
              ) : (
                <button
                  className="action-button btn-primary"
                  disabled={busy}
                  onClick={async () => {
                    const email = prompt('New email', user?.email ?? '');
                    if (email === null) return;
                    setBusy(true);
                    try {
                      await identityService.updateProfile({ email });
                      window.location.reload();
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <span className="icon">✏️</span>
                  Edit Profile
                </button>
              )}

              <button
                className="action-button btn-danger"
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
                <span className="icon">🔒</span>
                Change Password
              </button>

              {user?.roles?.includes('Admin') && (
                <button
                  className="action-button btn-admin"
                  onClick={() => (window.location.href = '/admin/users')}
                >
                  <span className="icon">⚙️</span>
                  Manage Users
                </button>
              )}

              <button 
                className="action-button btn-external" 
                onClick={() => window.open('http://blog.asafarim.local:3000', '_blank')}
              >
                <span className="icon">📝</span>
                Visit Blog
              </button>

              <button 
                className="action-button btn-external" 
                onClick={() => window.open('http://web.asafarim.local:5175', '_blank')}
              >
                <span className="icon">🌐</span>
                Web Portal
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
