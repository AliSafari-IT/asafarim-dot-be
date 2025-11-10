import React, { useState, useEffect } from 'react';
import { useAuth, isProduction } from '@asafarim/shared-ui-react';
import { 
  settingsService, 
  TestEnvironment as ApiEnvironment,
  UserCredential as ApiCredential,
  AutomationSettings as ApiAutomationSettings,
  NotificationSettings as ApiNotificationSettings
} from '../services/settingsService';
import './SettingsPage.css';

interface Environment {
  id: string;
  name: string;
  url: string;
  isDefault: boolean;
}

interface Credential {
  id?: string;
  name: string;
  type: 'api-key' | 'token' | 'password';
  value?: string;
  lastUsed?: string;
}

interface AutomationSettings {
  defaultTimeout: number;
  maxRetries: number;
  parallelism: number;
  screenshotOnFailure: boolean;
  videoRecording: boolean;
}

// Preview component for non-authenticated users
const SettingsPreview: React.FC = () => {
  const identityLoginUrl = isProduction
    ? 'https://identity.asafarim.be/login'
    : 'http://identity.asafarim.local:5177/login';

  const handleLogin = () => {
    window.location.href = `${identityLoginUrl}?redirect=${encodeURIComponent(window.location.href)}`;
  };

  const handleSignUp = () => {
    window.location.href = `${identityLoginUrl.replace('/login', '/register')}?redirect=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <div className="settings-preview">
      <div className="preview-header">
        <div className="preview-icon">⚙️</div>
        <h1 className="preview-title">Settings</h1>
        <p className="preview-subtitle">
          Manage environments, credentials, and automation configurations for your tests.
        </p>
      </div>

      <div className="preview-features">
        <div className="preview-feature-card">
          <div className="feature-icon">🌍</div>
          <h3>Test Environments</h3>
          <p>Configure multiple test environments (Development, Staging, Production) with custom base URLs. Set default environments for quick test execution.</p>
        </div>

        <div className="preview-feature-card">
          <div className="feature-icon">🔑</div>
          <h3>Credentials Management</h3>
          <p>Securely store API keys, tokens, and passwords. All credentials are encrypted and accessible only to your test automation workflows.</p>
        </div>

        <div className="preview-feature-card">
          <div className="feature-icon">🤖</div>
          <h3>Automation Configuration</h3>
          <p>Control test execution behavior with timeout settings, retry logic, parallel execution, screenshot capture, and video recording options.</p>
        </div>

        <div className="preview-feature-card">
          <div className="feature-icon">🔔</div>
          <h3>Notification Preferences</h3>
          <p>Choose how and when to receive test results. Configure email notifications, Slack alerts, and customize report formats.</p>
        </div>
      </div>

      <div className="preview-cta">
        <h2>Ready to configure your testing environment?</h2>
        <p>Sign in to access settings and personalize your test automation experience.</p>
        <div className="preview-actions">
          <button className="btn-cta-primary" onClick={handleLogin}>
            Login to Access Settings
          </button>
          <button className="btn-cta-secondary" onClick={handleSignUp}>
            Sign Up Free
          </button>
        </div>
      </div>
    </div>
  );
};

// Full functional component for authenticated users
const SettingsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'environments' | 'credentials' | 'automation' | 'notifications'>('environments');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Environments
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [newEnv, setNewEnv] = useState({ name: '', url: '', isDefault: false });

  // Credentials
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showCredModal, setShowCredModal] = useState(false);
  const [isEditingCred, setIsEditingCred] = useState(false);
  const [currentCred, setCurrentCred] = useState<Credential | null>(null);
  const [newCred, setNewCred] = useState<Credential | null>({ name: '', type: 'api-key' as const, value: '' } );

  // Automation Settings
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>({
    defaultTimeout: 30000,
    maxRetries: 3,
    parallelism: 4,
    screenshotOnFailure: true,
    videoRecording: false,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnFailure: true,
    emailOnSuccess: false,
    slackNotifications: false,
    slackWebhookUrl: '',
    reportFormat: 'html',
  });

  // Load data on mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      switch (activeTab) {
        case 'environments':
          await loadEnvironments();
          break;
        case 'credentials':
          await loadCredentials();
          break;
        case 'automation':
          await loadAutomationSettings();
          break;
        case 'notifications':
          await loadNotificationSettings();
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEnvironments = async () => {
    const data = await settingsService.getEnvironments();
    setEnvironments(data.map(env => ({
      id: env.id.toString(),
      name: env.name,
      url: env.baseUrl,
      isDefault: env.isDefault
    })));
  };

  const loadCredentials = async () => {
    const data = await settingsService.getCredentials();
    setCredentials(data.map(cred => ({
      id: cred.id.toString(),
      name: cred.name,
      type: cred.type.toLowerCase() as 'api-key' | 'token' | 'password',
      value: cred.value,
      lastUsed: cred.lastUsed ? formatLastUsed(cred.lastUsed) : undefined
    })));
  };

  const loadAutomationSettings = async () => {
    const data = await settingsService.getAutomationSettings();
    setAutomationSettings({
      defaultTimeout: data.defaultTimeout,
      maxRetries: data.maxRetries,
      parallelism: data.parallelism,
      screenshotOnFailure: data.screenshotOnFailure,
      videoRecording: data.videoRecording
    });
  };

  const loadNotificationSettings = async () => {
    const data = await settingsService.getNotificationSettings();
    setNotificationSettings({
      emailOnSuccess: data.emailOnSuccess,
      emailOnFailure: data.emailOnFailure,
      slackNotifications: data.slackEnabled,
      slackWebhookUrl: data.slackWebhookUrl || '',
      reportFormat: data.reportFormat.toLowerCase()
    });
  };

  const formatLastUsed = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleSaveAutomation = async () => {
    try {
      setSaving(true);
      await settingsService.updateAutomationSettings({
        defaultTimeout: automationSettings.defaultTimeout,
        maxRetries: automationSettings.maxRetries,
        parallelism: automationSettings.parallelism,
        screenshotOnFailure: automationSettings.screenshotOnFailure,
        videoRecording: automationSettings.videoRecording
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save automation settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await settingsService.updateNotificationSettings({
        emailOnSuccess: notificationSettings.emailOnSuccess,
        emailOnFailure: notificationSettings.emailOnFailure,
        slackEnabled: notificationSettings.slackNotifications,
        slackWebhookUrl: notificationSettings.slackWebhookUrl || undefined,
        reportFormat: notificationSettings.reportFormat.charAt(0).toUpperCase() + notificationSettings.reportFormat.slice(1) as 'Html' | 'Pdf' | 'Json'
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save notification settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEnvironment = async () => {
    if (!newEnv.name || !newEnv.url) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await settingsService.createEnvironment({
        name: newEnv.name,
        baseUrl: newEnv.url,
        isDefault: newEnv.isDefault
      });
      await loadEnvironments();
      setNewEnv({ name: '', url: '', isDefault: false });
      setShowEnvModal(false);
    } catch (err) {
      console.error('Failed to add environment:', err);
      alert('Failed to add environment. Please try again.');
    }
  };

  const handleRemoveEnvironment = async (id: string) => {
    if (confirm('Are you sure you want to remove this environment?')) {
      try {
        await settingsService.deleteEnvironment(parseInt(id));
        await loadEnvironments();
      } catch (err) {
        console.error('Failed to remove environment:', err);
        alert('Failed to remove environment. Please try again.');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await settingsService.setDefaultEnvironment(parseInt(id));
      await loadEnvironments();
    } catch (err) {
      console.error('Failed to set default environment:', err);
      alert('Failed to set default environment. Please try again.');
    }
  };

  const handleAddCredential = async () => {
    if (newCred && (!newCred.name || !newCred.value)) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const typeMap: Record<string, 'ApiKey' | 'Token' | 'Password'> = {
        'api-key': 'ApiKey',
        'token': 'Token',
        'password': 'Password'
      };

      await settingsService.createCredential({
        name: newCred?.name || '',
        type: typeMap[newCred?.type || 'api-key'],
        value: newCred?.value || ''
      });
      await loadCredentials();
      setNewCred({ name: '', type: 'api-key', value: '' });
      setShowCredModal(false);
    } catch (err) {
      console.error('Failed to add credential:', err);
      alert('Failed to add credential. Please try again.');
    }
  };

  const handleRemoveCredential = async (id: string) => {
    if (confirm('Are you sure you want to remove this credential?')) {
      try {
        await settingsService.deleteCredential(parseInt(id));
        await loadCredentials();
      } catch (err) {
        console.error('Failed to remove credential:', err);
        alert('Failed to remove credential. Please try again.');
      }
    }
  };

  const handleEditCredential = async () => {
    if (!currentCred?.id || !currentCred.name || !currentCred.value) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const typeMap: Record<string, 'ApiKey' | 'Token' | 'Password'> = {
        'api-key': 'ApiKey',
        'token': 'Token',
        'password': 'Password'
      };

      await settingsService.updateCredential(parseInt(currentCred.id), {
        name: currentCred.name,
        type: typeMap[currentCred.type],
        value: currentCred.value
      });
      await loadCredentials();
      setCurrentCred(null);
      setIsEditingCred(false);
      setShowCredModal(false);
    } catch (err) {
      console.error('Failed to edit credential:', err);
      alert('Failed to edit credential. Please try again.');
    }
  };

  const openEditCredentialModal = (cred: Credential) => {
    setCurrentCred(cred);
    setIsEditingCred(true);
    setShowCredModal(true);
  };

  const closeCredentialModal = () => {
    setShowCredModal(false);
    setIsEditingCred(false);
    setCurrentCred(null);
    setNewCred({ name: '', type: 'api-key', value: '' });
  };

  if (loading && environments.length === 0 && credentials.length === 0) {
    return (
      <div className="settings-page">
        <div className="loading-state">
          <div className="loading-spinner">⟳</div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">⚙️</div>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Configure your test automation environment</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="btn-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs">
        <button 
          className={`tab ${activeTab === 'environments' ? 'active' : ''}`}
          onClick={() => setActiveTab('environments')}
        >
          🌍 Environments
        </button>
        <button 
          className={`tab ${activeTab === 'credentials' ? 'active' : ''}`}
          onClick={() => setActiveTab('credentials')}
        >
          🔑 Credentials
        </button>
        <button 
          className={`tab ${activeTab === 'automation' ? 'active' : ''}`}
          onClick={() => setActiveTab('automation')}
        >
          🤖 Automation
        </button>
        <button 
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
      </div>

      {/* Content */}
      <div className="settings-content">
        {/* Environments Tab */}
        {activeTab === 'environments' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>Test Environments</h2>
              <button className="btn-primary" onClick={() => setShowEnvModal(true)}>
                + Add Environment
              </button>
            </div>
            <p className="section-description">
              Manage the environments where your tests will run. Set a default environment for quick test execution.
            </p>
            
            <div className="env-list">
              {environments.map(env => (
                <div key={env.id} className={`env-card ${env.isDefault ? 'default' : ''}`}>
                  <div className="env-info">
                    <div className="env-name">
                      {env.name}
                      {env.isDefault && <span className="default-badge">Default</span>}
                    </div>
                    <div className="env-url">{env.url}</div>
                  </div>
                  <div className="env-actions">
                    {!env.isDefault && (
                      <button className="btn-set-default" onClick={() => handleSetDefault(env.id)}>
                        Set as Default
                      </button>
                    )}
                    <button className="btn-remove" onClick={() => handleRemoveEnvironment(env.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>API Keys & Credentials</h2>
              <button className="btn-primary" onClick={() => setShowCredModal(true)}>
                + Add Credential
              </button>
            </div>
            <p className="section-description">
              Securely store API keys, tokens, and credentials used in your test automation.
            </p>
            
            <div className="cred-list">
              {credentials.map(cred => (
                <div key={cred.id} className="cred-card">
                  <div className="cred-info">
                    <div className="cred-name">{cred.name}</div>
                    <div className="cred-meta">
                      <span className="cred-type">{cred.type}</span>
                      {cred.lastUsed && <span className="cred-last-used">Last used: {cred.lastUsed}</span>}
                    </div>
                    <div className="cred-value">{cred.value}</div>
                  </div>
                  <div className="cred-actions">
                    <button className="btn-edit" onClick={() => openEditCredentialModal(cred)}>Edit</button>
                    <button className="btn-remove" onClick={() => handleRemoveCredential(cred.id!)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="settings-section">
            <h2>Automation Configuration</h2>
            <p className="section-description">
              Configure global settings for test execution behavior.
            </p>
            
            <div className="settings-form">
              <div className="form-group">
                <label>Default Timeout (ms)</label>
                <input
                  type="number"
                  value={automationSettings.defaultTimeout}
                  onChange={(e) => setAutomationSettings({...automationSettings, defaultTimeout: parseInt(e.target.value)})}
                />
                <span className="form-hint">Maximum time to wait for elements and actions</span>
              </div>

              <div className="form-group">
                <label>Max Retries</label>
                <input
                  type="number"
                  value={automationSettings.maxRetries}
                  onChange={(e) => setAutomationSettings({...automationSettings, maxRetries: parseInt(e.target.value)})}
                />
                <span className="form-hint">Number of times to retry failed tests</span>
              </div>

              <div className="form-group">
                <label>Parallel Execution</label>
                <input
                  type="number"
                  value={automationSettings.parallelism}
                  onChange={(e) => setAutomationSettings({...automationSettings, parallelism: parseInt(e.target.value)})}
                />
                <span className="form-hint">Number of tests to run in parallel</span>
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={automationSettings.screenshotOnFailure}
                    onChange={(e) => setAutomationSettings({...automationSettings, screenshotOnFailure: e.target.checked})}
                  />
                  <span>Capture screenshot on failure</span>
                </label>
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={automationSettings.videoRecording}
                    onChange={(e) => setAutomationSettings({...automationSettings, videoRecording: e.target.checked})}
                  />
                  <span>Record video of test execution</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h2>Notification Preferences</h2>
            <p className="section-description">
              Choose how and when you want to be notified about test results.
            </p>
            
            <div className="settings-form">
              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailOnFailure}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailOnFailure: e.target.checked})}
                  />
                  <span>Email notification on test failure</span>
                </label>
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailOnSuccess}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailOnSuccess: e.target.checked})}
                  />
                  <span>Email notification on test success</span>
                </label>
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.slackNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, slackNotifications: e.target.checked})}
                  />
                  <span>Send notifications to Slack</span>
                </label>
              </div>

              <div className="form-group">
                <label>Report Format</label>
                <select
                  value={notificationSettings.reportFormat}
                  onChange={(e) => setNotificationSettings({...notificationSettings, reportFormat: e.target.value})}
                >
                  <option value="html">HTML</option>
                  <option value="pdf">PDF</option>
                  <option value="json">JSON</option>
                </select>
                <span className="form-hint">Format for test reports</span>
              </div>
            </div>
          </div>
        )}

        {/* Save Button - Only show for automation and notifications tabs */}
        {(activeTab === 'automation' || activeTab === 'notifications') && (
          <div className="settings-footer">
            <button 
              className="btn-save" 
              onClick={activeTab === 'automation' ? handleSaveAutomation : handleSaveNotifications}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
            {saved && <span className="save-confirmation">✓ Settings saved successfully!</span>}
          </div>
        )}
      </div>

      {/* Add Environment Modal */}
      {showEnvModal && (
        <div className="modal-overlay" onClick={() => setShowEnvModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Environment</h2>
              <button className="btn-close" onClick={() => setShowEnvModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Environment Name</label>
                <input
                  type="text"
                  placeholder="e.g., Production"
                  value={newEnv.name}
                  onChange={(e) => setNewEnv({...newEnv, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Base URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newEnv.url}
                  onChange={(e) => setNewEnv({...newEnv, url: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowEnvModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleAddEnvironment}>Add Environment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credential Modal - Add/Edit */}
      {showCredModal && (
        <div className="modal-overlay" onClick={closeCredentialModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditingCred ? 'Edit Credential' : 'Add Credential'}</h2>
              <button className="btn-close" onClick={closeCredentialModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Credential Name</label>
                <input
                  type="text"
                  placeholder="e.g., API Key - Production"
                  value={isEditingCred ? currentCred?.name || '' : newCred?.name || ''}
                  onChange={(e) => isEditingCred && currentCred
                    ? setCurrentCred({...currentCred, name: e.target.value})
                    : setNewCred({...newCred, name: e.target.value || '', type: currentCred?.type || 'api-key'})
                  }
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={isEditingCred ? currentCred?.type || 'api-key' : newCred?.type || 'api-key'}
                  onChange={(e) => isEditingCred && currentCred
  ? setCurrentCred((prevCred): Credential | null => {
      if (prevCred === null) return null;
      
      // Make sure every required field is provided; do not return 'undefined'
      return {
        ...prevCred,
        type: e.target.value as 'api-key' | 'token' | 'password',
        name: prevCred.name || '', // Provide a default empty string for `name`
        // Add similar defaults for other required properties
      };
    })
  : setNewCred({
      ...newCred, 
      type: e.target.value as 'api-key' | 'token' | 'password',
      name: newCred?.name || '',       // Provide a default empty string for `name`
      value: newCred?.value || '',
      // Assume any other fields that need to be handled are managed here.
    })
}
                >
                  <option value="api-key">API Key</option>
                  <option value="token">Token</option>
                  <option value="password">Password</option>
                </select>
              </div>
              <div className="form-group">
                <label>Value</label>
                <input
                  type="password"
                  placeholder="Enter credential value"
                  value={isEditingCred ? currentCred?.value || '' : newCred?.value || ''}
                 onChange={(e) => isEditingCred && currentCred
  ? setCurrentCred({...currentCred, name: e.target.value})
  : setNewCred({
      ...newCred,
      name: e.target.value || '', 
      type: currentCred?.type || 'api-key',
      value: newCred?.value || '' // Ensure value is always a string
    })
}
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeCredentialModal}>Cancel</button>
                <button className="btn-primary" onClick={isEditingCred ? handleEditCredential : handleAddCredential}>
                  {isEditingCred ? 'Save Changes' : 'Add Credential'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component with conditional rendering
const SettingsPage: React.FC = () => {
  const authApiBase = isProduction
    ? 'https://identity.asafarim.be/auth'
    : 'http://identity.asafarim.local:5101/auth';

  const { isAuthenticated, loading } = useAuth({
    authApiBase,
    identityLoginUrl: isProduction
      ? 'https://identity.asafarim.be/login'
      : 'http://identity.asafarim.local:5177/login'
  });

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-state">
          <div className="loading-spinner">⟳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <SettingsContent /> : <SettingsPreview />;
};

export default SettingsPage;
