import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import './Dashboard.css';

interface DashboardStats {
  totalRuns: number;
  passedCount: number;
  failedCount: number;
  inProgressCount: number;
  passRate: number;
  failRate: number;
}

interface TestRun {
  id: string;
  runName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRuns, setRecentRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE}/api/test-runs`);

        if (response.ok) {
          const runs = await response.json();
          setRecentRuns(runs.slice(0, 10));

          const totalRuns = runs.length;
          const passedCount = runs.filter((r: TestRun) => r.status === 'Completed' && r.failedTests === 0).length;
          const failedCount = runs.filter((r: TestRun) => r.status === 'Failed' || r.failedTests > 0).length;
          const inProgressCount = runs.filter((r: TestRun) => r.status === 'Running').length;

          setStats({
            totalRuns,
            passedCount,
            failedCount,
            inProgressCount,
            passRate: totalRuns > 0 ? (passedCount / totalRuns) * 100 : 0,
            failRate: totalRuns > 0 ? (failedCount / totalRuns) * 100 : 0
          });
        } else {
          setError('Failed to load test runs');
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return <span data-testid="status-completed" className="status-badge status-completed">✓ Completed</span>;
    if (statusLower === 'failed') return <span data-testid="status-failed" className="status-badge status-failed">✗ Failed</span>;
    if (statusLower === 'running') return <span data-testid="status-running" className="status-badge status-running">⟳ Running</span>;
    if (statusLower === 'cancelled') return <span data-testid="status-cancelled" className="status-badge status-cancelled">⊘ Cancelled</span>;
    return <span data-testid="status-pending" className="status-badge status-pending">○ {status}</span>;
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  const handleRefresh = () => window.location.reload();

  if (loading) {
    return (
      <div data-testid="dashboard-loading" className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="dashboard-error" className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <p data-testid="dashboard-error-message">{error}</p>
        <button
          data-testid="dashboard-retry"
          onClick={handleRefresh}
          className="btn-retry"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page" className="dashboard">
      {/* Header */}
      <div data-testid="dashboard-header" className="dashboard-header">
        <div id="dashboard-header-text">
          <h1 data-testid="dashboard-title" className="dashboard-title">Dashboard</h1>
          <p data-testid="dashboard-subtitle" className="dashboard-subtitle">Test automation metrics and recent activity</p>
        </div>
        <button
          data-testid="dashboard-refresh"
          className="btn-refresh"
          onClick={handleRefresh}
        >
          ↻ Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div data-testid="dashboard-kpi-grid" className="kpi-grid">
        <div data-testid="kpi-total" className="kpi-card kpi-primary">
          <div className="kpi-header">
            <h3 className="kpi-title">Total Test Runs</h3>
            <div className="kpi-icon">📊</div>
          </div>
          <div className="kpi-value">{stats?.totalRuns || 0}</div>
        </div>

        <div data-testid="kpi-passed" className="kpi-card kpi-success">
          <div className="kpi-header">
            <h3 className="kpi-title">Passed</h3>
            <div className="kpi-icon">✅</div>
          </div>
          <div className="kpi-value">{stats?.passedCount || 0}</div>
          <div className="kpi-subtitle">{stats?.passRate.toFixed(1) || 0}% success rate</div>
        </div>

        <div data-testid="kpi-failed" className="kpi-card kpi-error">
          <div className="kpi-header">
            <h3 className="kpi-title">Failed</h3>
            <div className="kpi-icon">❌</div>
          </div>
          <div className="kpi-value">{stats?.failedCount || 0}</div>
          <div className="kpi-subtitle">{stats?.failRate.toFixed(1) || 0}% failure rate</div>
        </div>

        <div data-testid="kpi-inprogress" className="kpi-card kpi-warning">
          <div className="kpi-header">
            <h3 className="kpi-title">In Progress</h3>
            <div className="kpi-icon">🔄</div>
          </div>
          <div className="kpi-value">{stats?.inProgressCount || 0}</div>
        </div>
      </div>

      {/* Recent Runs */}
      <div data-testid="recent-runs-section" className="recent-runs-section">
        <div className="section-header">
          <h2 data-testid="recent-runs-title">Recent Test Runs</h2>
          <button
            data-testid="btn-view-all-runs"
            className="btn-view-all"
            onClick={() => navigate('/test-runs')}
          >
            View All →
          </button>
        </div>

        {recentRuns.length === 0 ? (
          <div data-testid="empty-state" className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No test runs yet</h3>
            <p>Start by running your first test suite</p>
            <button
              data-testid="btn-go-to-test-suites"
              className="btn-primary"
              onClick={() => navigate('/test-suites')}
            >
              Go to Test Suites
            </button>
          </div>
        ) : (
          <div data-testid="runs-table-container" className="runs-table-container">
            <table data-testid="runs-table" className="runs-table">
              <thead>
                <tr>
                  <th>Run Name</th>
                  <th>Status</th>
                  <th>Tests</th>
                  <th>Success Rate</th>
                  <th>Started</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run) => (
                  <tr
                    key={run.id}
                    data-testid={`run-row-${run.id}`}
                    className="run-row"
                    onClick={() => navigate(`/test-runs/${run.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td data-testid={`run-name-${run.id}`} className="run-name">{run.runName}</td>
                    <td>{getStatusBadge(run.status)}</td>
                    <td>
                      <span className="test-count">
                        <span className="passed">{run.passedTests}</span>/
                        <span className="total">{run.totalTests}</span>
                      </span>
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div
                          data-testid={`progress-fill-${run.id}`}
                          className="progress-fill"
                          style={{ width: `${run.successRate}%` }}
                        ></div>
                        <span className="progress-text">{run.successRate.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td data-testid={`run-started-${run.id}`} className="run-date">
                      {formatDate(run.startedAt)}
                    </td>
                    <td>
                      <button
                        data-testid={`btn-view-details-${run.id}`}
                        className="btn-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/test-runs/${run.id}`);
                        }}
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
