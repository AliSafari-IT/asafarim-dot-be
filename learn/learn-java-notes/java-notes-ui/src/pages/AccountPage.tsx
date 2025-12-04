import { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { ButtonComponent as Button } from '@asafarim/shared-ui-react';
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
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

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

  const handleSaveProfile = () => {
    // TODO: Implement API call to update profile
    console.log('Saving profile:', { displayName, email });
    setIsEditing(false);
  };

  const renderProfileTab = () => (
    <div className="account-section">
      <div className="account-section__header">
        <h2 className="account-section__title">Profile Information</h2>
        {!isEditing && (
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            ✏️ Edit
          </Button>
        )}
      </div>

      {/* Avatar Section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar">
          <div className="profile-avatar__image">
            {user.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <Button variant="ghost" size="sm" className="profile-avatar__change">
            📷 Change Photo
          </Button>
        </div>
        <div className="profile-avatar__info">
          <h3 className="profile-avatar__name">{user.username}</h3>
          <p className="profile-avatar__email">{user.email}</p>
          {isAdmin && (
            <span className="profile-badge profile-badge--admin">
              ✓ Administrator
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
            disabled={!isEditing}
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
            disabled={!isEditing}
            placeholder="Enter your email"
          />
        </div>

        {isEditing && (
          <div className="form-actions">
            <Button variant="primary" onClick={handleSaveProfile}>
              💾 Save Changes
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
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
        <Button variant="secondary" size="sm">
          Change Password
        </Button>
      </div>

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
        <Button variant="secondary" size="sm">
          Enable 2FA
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="security-card">
        <div className="security-card__icon">💻</div>
        <div className="security-card__content">
          <h3 className="security-card__title">Active Sessions</h3>
          <p className="security-card__description">
            Manage devices where you're currently logged in
          </p>
        </div>
        <Button variant="secondary" size="sm">
          View Sessions
        </Button>
      </div>
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
        <select className="form-select">
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
        <select className="form-select">
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
          <input type="checkbox" defaultChecked />
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
        <select className="form-select">
          <option value="markdown">Markdown</option>
          <option value="rich">Rich Text</option>
          <option value="code">Code</option>
        </select>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="account-section">
      <div className="account-section__header">
        <h2 className="account-section__title">Account Activity</h2>
      </div>

      {/* Activity Stats */}
      <div className="activity-stats">
        <div className="activity-stat">
          <span className="activity-stat__value">-</span>
          <span className="activity-stat__label">Last Login</span>
        </div>
        <div className="activity-stat">
          <span className="activity-stat__value">-</span>
          <span className="activity-stat__label">Last IP</span>
        </div>
        <div className="activity-stat">
          <span className="activity-stat__value">0</span>
          <span className="activity-stat__label">Failed Attempts</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-list">
        <h3 className="activity-list__title">Recent Activity</h3>
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
          <Button variant="secondary" size="sm" onClick={logout}>
            Logout Everywhere
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
          <Button variant="secondary" size="sm">
            Export Data
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
          <Button variant="secondary" size="sm">
            Deactivate
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
          <Button variant="secondary" size="sm" className="danger-btn">
            Delete Account
          </Button>
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
