import { useState, useEffect } from 'react';
import { adminSystemApi } from '../../api/adminApi';
import type { SystemStats } from '../../api/adminApi';
import './AdminPages.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminSystemApi.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load system statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-loading-spinner">⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <div className="admin-error-icon">⚠️</div>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadStats} className="admin-btn admin-btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>System Dashboard</h1>
        <p>Overview of your Study Notes application</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats?.totalUsers || 0}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-detail success">
              +{stats?.newUsersThisWeek || 0} this week
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📝</div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats?.totalNotes || 0}</span>
            <span className="admin-stat-label">Total Notes</span>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-detail">
              {stats?.publicNotes || 0} public
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🏷️</div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats?.totalTags || 0}</span>
            <span className="admin-stat-label">Total Tags</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">💾</div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{formatBytes(stats?.totalStorageBytes || 0)}</span>
            <span className="admin-stat-label">Storage Used</span>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-detail">
              {stats?.totalAttachments || 0} files
            </span>
          </div>
        </div>
      </div>

      {/* User Stats Row */}
      <div className="admin-row">
        <div className="admin-card">
          <h3>👤 User Status</h3>
          <div className="admin-mini-stats">
            <div className="admin-mini-stat">
              <span className="admin-mini-stat-value success">{stats?.activeUsers || 0}</span>
              <span className="admin-mini-stat-label">Active (7 days)</span>
            </div>
            <div className="admin-mini-stat">
              <span className="admin-mini-stat-value warning">{stats?.lockedUsers || 0}</span>
              <span className="admin-mini-stat-label">Locked</span>
            </div>
            <div className="admin-mini-stat">
              <span className="admin-mini-stat-value danger">{stats?.disabledUsers || 0}</span>
              <span className="admin-mini-stat-label">Disabled</span>
            </div>
            <div className="admin-mini-stat">
              <span className="admin-mini-stat-value danger">{stats?.failedLoginAttempts || 0}</span>
              <span className="admin-mini-stat-label">Failed Logins</span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3>📊 Note Visibility</h3>
          <div className="admin-mini-stats">
            <div className="admin-mini-stat">
              <span className="admin-mini-stat-value">{stats?.privateNotes || 0}</span>
              <span className="admin-mini-stat-label">Private</span>
            </div>
            <div className="admin-mini-stat">
              <span className="admin-mini-stat-value">{stats?.publicNotes || 0}</span>
              <span className="admin-mini-stat-label">Public</span>
            </div>
            <div className="admin-mini-stat">
              <span className="admin-mini-stat-value success">{stats?.featuredNotes || 0}</span>
              <span className="admin-mini-stat-label">Featured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Tags & Active Users */}
      <div className="admin-row">
        <div className="admin-card">
          <h3>🏷️ Top Tags</h3>
          <div className="admin-list">
            {stats?.topTags?.length ? (
              stats.topTags.map((tag, index) => (
                <div key={tag.name} className="admin-list-item">
                  <span className="admin-list-rank">#{index + 1}</span>
                  <span className="admin-list-name">{tag.name}</span>
                  <span className="admin-list-count">{tag.count} notes</span>
                </div>
              ))
            ) : (
              <p className="admin-empty">No tags found</p>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h3>👑 Most Active Users</h3>
          <div className="admin-list">
            {stats?.mostActiveUsers?.length ? (
              stats.mostActiveUsers.map((user, index) => (
                <div key={user.username} className="admin-list-item">
                  <span className="admin-list-rank">#{index + 1}</span>
                  <span className="admin-list-name">
                    {user.displayName || user.username}
                  </span>
                  <span className="admin-list-count">{user.noteCount} notes</span>
                </div>
              ))
            ) : (
              <p className="admin-empty">No active users</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
