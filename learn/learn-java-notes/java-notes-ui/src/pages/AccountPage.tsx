import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useAccountSettings } from '../contexts/useAccountSettings';
import { ButtonComponent as Button, useNotifications } from '@asafarim/shared-ui-react';
import './AccountPage.css';

type TabId = 'profile' | 'security' | 'preferences' | 'activity' | 'danger';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'activity', label: 'Activity', icon: '📊' },
  { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
];

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const {
    preferences,
    activeSessions,
    accountActivity,
    isLoading,
    error,
    updateUserProfile,
    uploadAvatar,
    changePassword,
    logoutSession,
    logoutAllSessions,
    updatePreferences,
    exportAccountData,
    deactivateAccount,
    deleteAccount,
    clearError,
  } = useAccountSettings();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Delete account confirmation
  const [deletePassword, setDeletePassword] = useState('');

  // Initialize form state when entering edit mode or when user changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isEditing) {
      setDisplayName(user?.displayName || user?.username || '');
      setEmail(user?.email || '');
    }
  }, [isEditing, user?.displayName, user?.email, user?.username]);

  if (!user) {
    return (
      <div className="account-page">
        <div className="account-empty">
          <p>Please log in to view your account settings.</p>
        </div>
      </div>
    );
  }

  const isAdmin = user.roles?.includes('ROLE_ADMIN');

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({ displayName, email });
      setIsEditing(false);
      addNotification('success','Your profile has been updated successfully.', 5000 );
    } catch {
      // Error handled by hook
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
        addNotification('success', 'Your profile picture has been updated.',5000);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      addNotification('error', 'New passwords do not match.',5000);
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      addNotification('success','Your password has been changed successfully.',5000);
    } catch {
      // Error handled by hook
    }
  };

  const handleExportData = async () => {
    try {
      const result = await exportAccountData();
      addNotification(
        'success',
        'Your data has been exported successfully.',
        5000
      );
      
      // Decode base64 data URL and download as file
      const dataUrl = result.downloadUrl;
      if (dataUrl.startsWith('data:')) {
        const data = dataUrl.split(',')[1];
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `study-notes-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Fallback: open in new tab if it's a server URL
        window.open(dataUrl, '_blank');
      }
    } catch {
      // Error handled by hook
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(deletePassword);
      addNotification(
        'warning',
        'Your account has been permanently deleted.',
        10000
      );
      // Logout and redirect after a short delay
      setTimeout(() => {
        logout();
        navigate('/');
      }, 1000);
    } catch {
      // Error handled by hook
    }
  };

  const renderProfileTab = () => (
    <div className="account-section">
      <div className="account-section__header">
        <h2 className="account-section__title">Profile Information</h2>
        {!isEditing && (
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)} disabled={isLoading}>
            ✏️ Edit
          </Button>
        )}
      </div>

      {error && (
        <div className="account-error" onClick={clearError}>
          ❌ {error}
        </div>
      )}

      {/* Avatar Section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar">
          <div className="profile-avatar__image">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} />
            ) : (
              user.username?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="profile-avatar__change"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            📷 Change Photo
          </Button>
        </div>
        <div className="profile-avatar__info">
          <h3 className="profile-avatar__name">{user.displayName || user.username}</h3>
          <p className="profile-avatar__email">{user.email}</p>
          {isAdmin && (
            <span className="profile-badge profile-badge--admin">
              ✓ Administrator
            </span>
          )}
          {user.locked && (
            <span className="profile-badge profile-badge--locked">
              🔒 Account Locked
            </span>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="profile-form">
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-input"
            value={user.username}
            disabled
            title="Username cannot be changed"
          />
          <span className="form-hint">Username cannot be changed</span>
        </div>

        <div className="form-group">
          <label className="form-label">Display Name</label>
          <input
            type="text"
            className="form-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={!isEditing || isLoading}
            placeholder="Enter your display name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing || isLoading}
            placeholder="Enter your email"
          />
        </div>

        {isEditing && (
          <div className="form-actions">
            <Button variant="primary" onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading ? '⏳ Saving...' : '💾 Save Changes'}
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="account-section">
      <div className="account-section__header">
        <h2 className="account-section__title">Security Settings</h2>
      </div>

      {/* Password Change */}
      <div className="security-card">
        <div className="security-card__icon">🔑</div>
        <div className="security-card__content">
          <h3 className="security-card__title">Password</h3>
          <p className="security-card__description">
            Change your password to keep your account secure
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>
          {showPasswordForm ? 'Cancel' : 'Change Password'}
        </Button>
      </div>

      {showPasswordForm && (
        <div className="security-form">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <div className="form-actions">
            <Button variant="primary" onClick={handleChangePassword} disabled={isLoading}>
              {isLoading ? '⏳ Updating...' : '🔐 Update Password'}
            </Button>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication */}
      <div className="security-card">
        <div className="security-card__icon">📱</div>
        <div className="security-card__content">
          <h3 className="security-card__title">Two-Factor Authentication</h3>
          <p className="security-card__description">
            Add an extra layer of security to your account
          </p>
          <span className="security-status security-status--disabled">
            Not enabled
          </span>
        </div>
        <Button variant="secondary" size="sm" disabled>
          Enable 2FA (Coming Soon)
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="security-card">
        <div className="security-card__icon">💻</div>
        <div className="security-card__content">
          <h3 className="security-card__title">Active Sessions ({activeSessions.length})</h3>
          <p className="security-card__description">
            Manage devices where you're currently logged in
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowSessions(!showSessions)}>
          {showSessions ? 'Hide Sessions' : 'View Sessions'}
        </Button>
      </div>

      {showSessions && activeSessions.length > 0 && (
        <div className="sessions-list">
          {activeSessions.map((session) => (
            <div key={session.id} className="session-item">
              <div className="session-item__info">
                <p className="session-item__device">{session.deviceName}</p>
                <p className="session-item__meta">
                  {session.ipAddress} • Last active: {new Date(session.lastActive).toLocaleString()}
                </p>
                {session.isCurrent && <span className="session-item__current">Current session</span>}
              </div>
              {!session.isCurrent && (
                <Button variant="ghost" size="sm" onClick={() => logoutSession(session.id)}>
                  Logout
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="account-section">
      <div className="account-section__header">
        <h2 className="account-section__title">Preferences</h2>
      </div>

      {/* Theme */}
      <div className="preference-item">
        <div className="preference-item__info">
          <h3 className="preference-item__title">🎨 Theme</h3>
          <p className="preference-item__description">
            Choose your preferred color scheme
          </p>
        </div>
        <select 
          className="form-select"
          value={preferences?.theme || 'system'}
          onChange={(e) => updatePreferences({ theme: e.target.value as 'system' | 'light' | 'dark' })}
        >
          <option value="system">System Default</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Language */}
      <div className="preference-item">
        <div className="preference-item__info">
          <h3 className="preference-item__title">🌐 Language</h3>
          <p className="preference-item__description">
            Select your preferred language
          </p>
        </div>
        <select 
          className="form-select"
          value={preferences?.language || 'en'}
          onChange={(e) => updatePreferences({ language: e.target.value as 'en' | 'nl' | 'de' | 'fr' })}
        >
          <option value="en">English</option>
          <option value="nl">Nederlands</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {/* Notifications */}
      <div className="preference-item">
        <div className="preference-item__info">
          <h3 className="preference-item__title">🔔 Email Notifications</h3>
          <p className="preference-item__description">
            Receive email updates about your account
          </p>
        </div>
        <label className="toggle">
          <input 
            type="checkbox" 
            checked={preferences?.emailNotifications ?? true}
            onChange={(e) => updatePreferences({ emailNotifications: e.target.checked })}
          />
          <span className="toggle__slider"></span>
        </label>
      </div>

      {/* Editor Preferences */}
      <div className="preference-item">
        <div className="preference-item__info">
          <h3 className="preference-item__title">📝 Default Editor</h3>
          <p className="preference-item__description">
            Choose your preferred note editor
          </p>
        </div>
        <select 
          className="form-select"
          value={preferences?.defaultEditor || 'markdown'}
          onChange={(e) => updatePreferences({ defaultEditor: e.target.value as 'markdown' | 'rich' | 'code' })}
        >
          <option value="markdown">Markdown</option>
          <option value="rich">Rich Text</option>
          <option value="code">Code</option>
        </select>
      </div>
    </div>
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔐';
      case 'logout': return '🚪';
      case 'password_change': return '🔑';
      case 'email_change': return '📧';
      case 'profile_update': return '👤';
      default: return '📝';
    }
  };

  const renderActivityTab = () => (
    <div className="account-section">
      <div className="account-section__header">
        <h2 className="account-section__title">Account Activity</h2>
      </div>

      {/* Activity Stats */}
      <div className="activity-stats">
        <div className="activity-stat">
          <span className="activity-stat__value">{formatDate(user.lastLogin)}</span>
          <span className="activity-stat__label">Last Login</span>
        </div>
        <div className="activity-stat">
          <span className="activity-stat__value">{user.lastLoginIp || '-'}</span>
          <span className="activity-stat__label">Last IP</span>
        </div>
        <div className="activity-stat">
          <span className="activity-stat__value">{user.failedLoginAttempts || 0}</span>
          <span className="activity-stat__label">Failed Attempts</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-list">
        <h3 className="activity-list__title">Recent Activity</h3>
        {accountActivity.length > 0 ? (
          accountActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-item__icon">{getActivityIcon(activity.type)}</div>
              <div className="activity-item__content">
                <p className="activity-item__title">{activity.description}</p>
                <p className="activity-item__meta">
                  {formatDate(activity.timestamp)}
                  {activity.ipAddress && ` • ${activity.ipAddress}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="activity-item">
              <div className="activity-item__icon">🔐</div>
              <div className="activity-item__content">
                <p className="activity-item__title">Logged in</p>
                <p className="activity-item__meta">Just now • Current session</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-item__icon">📝</div>
              <div className="activity-item__content">
                <p className="activity-item__title">Account created</p>
                <p className="activity-item__meta">Account registration</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderDangerTab = () => (
    <div className="account-section">
      <div className="account-section__header">
        <h2 className="account-section__title account-section__title--danger">
          ⚠️ Danger Zone
        </h2>
      </div>

      <div className="danger-zone">
        {/* Logout All Devices */}
        <div className="danger-card">
          <div className="danger-card__content">
            <h3 className="danger-card__title">Logout All Devices</h3>
            <p className="danger-card__description">
              This will log you out from all devices and sessions, including this one.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={logoutAllSessions} disabled={isLoading}>
            {isLoading ? '⏳...' : 'Logout Everywhere'}
          </Button>
        </div>

        {/* Export Data */}
        <div className="danger-card">
          <div className="danger-card__content">
            <h3 className="danger-card__title">Export Your Data</h3>
            <p className="danger-card__description">
              Download a copy of all your notes and account data.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExportData} disabled={isLoading}>
            {isLoading ? '⏳...' : 'Export Data'}
          </Button>
        </div>

        {/* Deactivate Account */}
        <div className="danger-card danger-card--destructive">
          <div className="danger-card__content">
            <h3 className="danger-card__title">Deactivate Account</h3>
            <p className="danger-card__description">
              Temporarily disable your account. You can reactivate it later.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={deactivateAccount} disabled={isLoading}>
            {isLoading ? '⏳...' : 'Deactivate'}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="danger-card danger-card--destructive">
          <div className="danger-card__content">
            <h3 className="danger-card__title">Delete Account</h3>
            <p className="danger-card__description">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          {!showDeleteConfirm ? (
            <Button 
              variant="secondary" 
              size="sm" 
              className="danger-btn"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          ) : (
            <div className="delete-confirm">
              <input
                type="password"
                className="form-input"
                placeholder="Enter password to confirm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <div className="delete-confirm__actions">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="danger-btn"
                  onClick={handleDeleteAccount}
                  disabled={isLoading || !deletePassword}
                >
                  {isLoading ? '⏳...' : 'Confirm Delete'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'activity':
        return renderActivityTab();
      case 'danger':
        return renderDangerTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="account-page">
      <div className="account-header">
        <h1 className="account-title">Account Settings</h1>
        <p className="account-subtitle">
          Manage your profile, security, and preferences
        </p>
      </div>

      <div className="account-layout">
        {/* Sidebar Navigation */}
        <nav className="account-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`account-nav__item ${activeTab === tab.id ? 'account-nav__item--active' : ''} ${tab.id === 'danger' ? 'account-nav__item--danger' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="account-nav__icon">{tab.icon}</span>
              <span className="account-nav__label">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="account-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
