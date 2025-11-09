import React, { useState, useEffect } from 'react';
import { useAuth, isProduction } from '@asafarim/shared-ui-react';
import { integrationsService, Integration as ApiIntegration, IntegrationStats } from '../services/integrationsService';
import './IntegrationsPage.css';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'ci-cd' | 'issue-tracker' | 'notification' | 'api';
  status: 'connected' | 'disconnected';
  lastSync?: string;
  config?: Record<string, string>;
}

interface GitHubConfig {
  repository: string; // owner/repo format
  workflowPath: string; // .github/workflows/test.yml
  token: string; // GitHub personal access token
}

const AVAILABLE_INTEGRATIONS: Omit<Integration, 'id' | 'status'>[] = [
  {
    name: 'GitHub Actions',
    description: 'Trigger test runs from GitHub workflows and report results back to pull requests.',
    icon: '🐙',
    category: 'ci-cd',
  },
  {
    name: 'GitLab CI',
    description: 'Integrate with GitLab pipelines for continuous testing and deployment.',
    icon: '🦊',
    category: 'ci-cd',
  },
  {
    name: 'Jenkins',
    description: 'Connect with Jenkins for automated test execution in your CI/CD pipeline.',
    icon: '🔧',
    category: 'ci-cd',
  },
  {
    name: 'Jira',
    description: 'Link test results to Jira issues and automatically update ticket status.',
    icon: '📋',
    category: 'issue-tracker',
  },
  {
    name: 'Trello',
    description: 'Create cards for failed tests and track test automation progress.',
    icon: '📌',
    category: 'issue-tracker',
  },
  {
    name: 'Slack',
    description: 'Receive real-time notifications about test runs in your Slack channels.',
    icon: '💬',
    category: 'notification',
  },
  {
    name: 'Microsoft Teams',
    description: 'Get test results and alerts delivered to your Teams channels.',
    icon: '👥',
    category: 'notification',
  },
  {
    name: 'Email',
    description: 'Send detailed test reports and failure notifications via email.',
    icon: '📧',
    category: 'notification',
  },
  {
    name: 'Custom Webhook',
    description: 'Send test events to any HTTP endpoint for custom integrations.',
    icon: '🔗',
    category: 'api',
  },
  {
    name: 'REST API',
    description: 'Use our REST API to integrate Testora with your custom workflows.',
    icon: '⚡',
    category: 'api',
  },
];

// Preview component for non-authenticated users
const IntegrationsPreview: React.FC = () => {
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
    <div className="integrations-preview">
      <div className="preview-header">
        <div className="preview-icon">🔗</div>
        <h1 className="preview-title">Integrations</h1>
        <p className="preview-subtitle">
          Connect your account with CI/CD tools, issue trackers, notifications, and APIs to automate workflows.
        </p>
      </div>

      <div className="preview-features">
        <div className="preview-feature-card">
          <div className="feature-icon">🔄</div>
          <h3>CI/CD Integration</h3>
          <p>Trigger test runs from GitHub Actions, GitLab CI, Jenkins, and more. Automatically report results back to your pipelines.</p>
        </div>

        <div className="preview-feature-card">
          <div className="feature-icon">📋</div>
          <h3>Issue Tracking</h3>
          <p>Link test results to Jira issues and Trello cards. Automatically update ticket status based on test outcomes.</p>
        </div>

        <div className="preview-feature-card">
          <div className="feature-icon">🔔</div>
          <h3>Notifications</h3>
          <p>Receive real-time alerts via Slack, Microsoft Teams, or Email when tests fail or complete successfully.</p>
        </div>

        <div className="preview-feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Custom APIs</h3>
          <p>Use webhooks and REST APIs to integrate Testora with your custom workflows and internal tools.</p>
        </div>
      </div>

      <div className="preview-cta">
        <h2>Ready to connect your tools?</h2>
        <p>Sign in to configure integrations and automate your testing workflow.</p>
        <div className="preview-actions">
          <button className="btn-cta-primary" onClick={handleLogin}>
            Login to Configure Integrations
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
const IntegrationsContent: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // GitHub connect modal state
  const [showGitHubConnectModal, setShowGitHubConnectModal] = useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);
  const [gitHubConfig, setGitHubConfig] = useState<GitHubConfig>({
    repository: '',
    workflowPath: '.github/workflows/testora-cicd.yml',
    token: ''
  });
  const [connectingGitHub, setConnectingGitHub] = useState(false);

  // Map API integration type to UI category
  const mapTypeToCategory = (type: string): 'ci-cd' | 'issue-tracker' | 'notification' | 'api' => {
    const mapping: Record<string, 'ci-cd' | 'issue-tracker' | 'notification' | 'api'> = {
      'CiCd': 'ci-cd',
      'IssueTracker': 'issue-tracker',
      'Notification': 'notification',
      'Api': 'api'
    };
    return mapping[type] || 'api';
  };

  // Map API integration to UI integration
  const mapApiToUi = (apiIntegration: ApiIntegration): Integration => {
    const iconMap: Record<string, string> = {
      'GitHub Actions': '🐙',
      'GitLab CI': '🦊',
      'Jenkins': '🔧',
      'Jira': '📋',
      'Trello': '📊',
      'Slack': '💬',
      'Microsoft Teams': '👥',
      'Email': '📧',
      'Custom Webhook': '🔗',
      'REST API': '⚡'
    };

    return {
      id: apiIntegration.id.toString(),
      name: apiIntegration.name,
      description: AVAILABLE_INTEGRATIONS.find(i => i.name === apiIntegration.name)?.description || '',
      icon: iconMap[apiIntegration.name] || '🔗',
      category: mapTypeToCategory(apiIntegration.type),
      status: apiIntegration.status.toLowerCase() as 'connected' | 'disconnected',
      lastSync: apiIntegration.lastSync ? formatLastSync(apiIntegration.lastSync) : undefined
    };
  };

  const formatLastSync = (dateString: string): string => {
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

  // Load integrations from API
  useEffect(() => {
    loadIntegrations();
    loadStats();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await integrationsService.getIntegrations();
      setIntegrations(data.map(mapApiToUi));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await integrationsService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'ci-cd': 'CI/CD',
      'issue-tracker': 'Issue Tracking',
      'notification': 'Notifications',
      'api': 'API & Webhooks',
    };
    return labels[category] || category;
  };

  const handleAddIntegration = async (integration: Omit<Integration, 'id' | 'status'>) => {
    try {
      const categoryToType: Record<string, 'CiCd' | 'IssueTracker' | 'Notification' | 'Api'> = {
        'ci-cd': 'CiCd',
        'issue-tracker': 'IssueTracker',
        'notification': 'Notification',
        'api': 'Api'
      };

      await integrationsService.createIntegration({
        type: categoryToType[integration.category],
        name: integration.name,
        description: integration.description
      });

      await loadIntegrations();
      await loadStats();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add integration:', err);
      alert('Failed to add integration. Please try again.');
    }
  };

  const handleRemoveIntegration = async (id: string) => {
    if (confirm('Are you sure you want to remove this integration?')) {
      try {
        await integrationsService.deleteIntegration(parseInt(id));
        await loadIntegrations();
        await loadStats();
      } catch (err) {
        console.error('Failed to remove integration:', err);
        alert('Failed to remove integration. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    try {
      if (integration.status === 'connected') {
        await integrationsService.disconnectIntegration(parseInt(id));
        await loadIntegrations();
        await loadStats();
      } else {
        // For GitHub Actions, show config modal
        if (integration.name === 'GitHub Actions') {
          setSelectedIntegrationId(id);
          setGitHubConfig({
            repository: '',
            workflowPath: '.github/workflows/testora-cicd.yml',
            token: ''
          });
          setShowGitHubConnectModal(true);
        } else {
          // For other integrations, just connect
          await integrationsService.connectIntegration(parseInt(id), {});
          await loadIntegrations();
          await loadStats();
        }
      }
    } catch (err) {
      console.error('Failed to toggle integration status:', err);
      alert('Failed to update integration status. Please try again.');
    }
  };

  const handleGitHubConnect = async () => {
    // Validate all required fields are filled
    if (!gitHubConfig.repository?.trim()) {
      alert('Repository is required (format: owner/repo)');
      return;
    }
    if (!gitHubConfig.token?.trim()) {
      alert('GitHub Personal Access Token is required');
      return;
    }
    if (!gitHubConfig.workflowPath?.trim()) {
      alert('Workflow file path is required');
      return;
    }
    if (!selectedIntegrationId) {
      alert('Integration ID is missing');
      return;
    }

    try {
      setConnectingGitHub(true);
      const configObj = {
        repository: gitHubConfig.repository.trim(),
        workflowPath: gitHubConfig.workflowPath.trim(),
        token: gitHubConfig.token.trim()
      };
      console.log('GitHub config object:', configObj);
      const credentialsJson = JSON.stringify(configObj);
      console.log('Sending GitHub config as JSON:', credentialsJson);
      console.log('Integration ID:', selectedIntegrationId);
      
      const result = await integrationsService.connectIntegration(parseInt(selectedIntegrationId), {
        credentials: credentialsJson
      });
      console.log('Connection result:', result);
      await loadIntegrations();
      await loadStats();
      setShowGitHubConnectModal(false);
      alert('GitHub Actions connected successfully!');
    } catch (err) {
      console.error('Failed to connect GitHub Actions:', err);
      alert('Failed to connect GitHub Actions. Please check your credentials and try again.');
    } finally {
      setConnectingGitHub(false);
    }
  };

  const filteredAvailableIntegrations = AVAILABLE_INTEGRATIONS.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const notAlreadyAdded = !integrations.some(i => i.name === integration.name);
    return matchesCategory && matchesSearch && notAlreadyAdded;
  });

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    const category = integration.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  if (loading) {
    return (
      <div className="integrations-page">
        <div className="loading-state">
          <div className="loading-spinner">⟳</div>
          <p>Loading integrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="integrations-page">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="btn-primary" onClick={loadIntegrations}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="integrations-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">🔗</div>
          <div>
            <h1 className="page-title">Integrations</h1>
            <p className="page-subtitle">Connect Testora with your favorite tools and services</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <span className="btn-icon">+</span>
          Add Integration
        </button>
      </div>

      {/* Stats */}
      <div className="integration-stats">
        <div className="stat-card">
          <div className="stat-value">{stats?.total || 0}</div>
          <div className="stat-label">Total Integrations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.active || 0}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.inactive || 0}</div>
          <div className="stat-label">Inactive</div>
        </div>
      </div>

      {/* Integrations List */}
      {integrations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>No integrations yet</h3>
          <p>Connect Testora with external tools to enhance your testing workflow</p>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            Add Your First Integration
          </button>
        </div>
      ) : (
        <div className="integrations-list">
          {Object.entries(groupedIntegrations).map(([category, items]) => (
            <div key={category} className="integration-category">
              <h2 className="category-title">{getCategoryLabel(category)}</h2>
              <div className="integration-grid">
                {items.map(integration => (
                  <div key={integration.id} className={`integration-card ${integration.status}`}>
                    <div className="integration-header">
                      <div className="integration-icon">{integration.icon}</div>
                      <div className="integration-status">
                        <span className={`status-badge ${integration.status}`}>
                          {integration.status === 'connected' ? '● Connected' : '○ Disconnected'}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="integration-name">{integration.name}</h3>
                    <p className="integration-description">{integration.description}</p>
                    
                    {integration.lastSync && integration.status === 'connected' && (
                      <div className="integration-meta">
                        <span className="meta-label">Last sync:</span>
                        <span className="meta-value">{integration.lastSync}</span>
                      </div>
                    )}
                    
                    <div className="integration-actions">
                      <button 
                        className={`btn-toggle ${integration.status}`}
                        onClick={() => handleToggleStatus(integration.id)}
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </button>
                      <button 
                        className="btn-configure"
                        onClick={() => alert('Configuration modal would open here')}
                      >
                        ⚙️ Configure
                      </button>
                      <button 
                        className="btn-remove"
                        onClick={() => handleRemoveIntegration(integration.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Integration</h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <div className="modal-filters">
              <input
                type="text"
                placeholder="Search integrations..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                className="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="ci-cd">CI/CD</option>
                <option value="issue-tracker">Issue Tracking</option>
                <option value="notification">Notifications</option>
                <option value="api">API & Webhooks</option>
              </select>
            </div>

            <div className="modal-body">
              <div className="available-integrations">
                {filteredAvailableIntegrations.length === 0 ? (
                  <div className="no-results">
                    <p>No integrations found matching your criteria</p>
                  </div>
                ) : (
                  filteredAvailableIntegrations.map((integration, index) => (
                    <div key={index} className="available-integration-card">
                      <div className="available-integration-icon">{integration.icon}</div>
                      <div className="available-integration-info">
                        <h4>{integration.name}</h4>
                        <p>{integration.description}</p>
                        <span className="category-badge">{getCategoryLabel(integration.category)}</span>
                      </div>
                      <button 
                        className="btn-add"
                        onClick={() => handleAddIntegration(integration)}
                      >
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Actions Connect Modal */}
      {showGitHubConnectModal && (
        <div className="modal-overlay" onClick={() => setShowGitHubConnectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🐙 Connect GitHub Actions</h2>
              <button className="btn-close" onClick={() => setShowGitHubConnectModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p className="modal-description">
                Configure your GitHub repository and workflow to enable test triggering via GitHub Actions.
              </p>

              <div className="form-group">
                <label htmlFor="repository">Repository *</label>
                <input
                  id="repository"
                  type="text"
                  placeholder="owner/repo (e.g., mycompany/e2e-tests)"
                  value={gitHubConfig.repository}
                  onChange={(e) => setGitHubConfig({...gitHubConfig, repository: e.target.value})}
                  disabled={connectingGitHub}
                />
                <small>Format: GitHub username or organization / repository name</small>
              </div>

              <div className="form-group">
                <label htmlFor="workflowPath">Workflow File Path *</label>
                <input
                  id="workflowPath"
                  type="text"
                  placeholder=".github/workflows/e2e-tests.yml"
                  value={gitHubConfig.workflowPath}
                  onChange={(e) => setGitHubConfig({...gitHubConfig, workflowPath: e.target.value})}
                  disabled={connectingGitHub}
                />
                <small>Path to your GitHub Actions workflow file relative to repository root</small>
              </div>

              <div className="form-group">
                <label htmlFor="token">GitHub Personal Access Token *</label>
                <input
                  id="token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={gitHubConfig.token}
                  onChange={(e) => setGitHubConfig({...gitHubConfig, token: e.target.value})}
                  disabled={connectingGitHub}
                />
                <small>
                  <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                    Create a token
                  </a>
                  {' '}with repo and workflow scopes
                </small>
              </div>

              <div className="info-box">
                <strong>ℹ️ Token Permissions Required:</strong>
                <ul>
                  <li><code>repo</code> - Full control of private repositories</li>
                  <li><code>workflow</code> - Update GitHub Action workflows</li>
                </ul>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-cancel" 
                  onClick={() => setShowGitHubConnectModal(false)}
                  disabled={connectingGitHub}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleGitHubConnect}
                  disabled={connectingGitHub}
                >
                  {connectingGitHub ? 'Connecting...' : 'Connect GitHub Actions'}
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
const IntegrationsPage: React.FC = () => {
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
      <div className="integrations-page">
        <div className="loading-state">
          <div className="loading-spinner">⟳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <IntegrationsContent /> : <IntegrationsPreview />;
};

export default IntegrationsPage;
