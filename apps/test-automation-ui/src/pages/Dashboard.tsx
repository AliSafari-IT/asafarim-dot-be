import React, { useEffect, useState } from 'react';
import { api } from '../config/api';
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
  name: string;
  status: 'passed' | 'failed' | 'in_progress';
  date: string;
  passed: number;
  failed: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRuns, setRecentRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, runsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-runs'),
        ]);

        setStats(statsRes.data);
        setRecentRuns(runsRes.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-empty">
        <p>No data available</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { icon: string; label: string; className: string }> = {
      passed: { icon: '✓', label: 'Passed', className: 'badge-success' },
      failed: { icon: '✗', label: 'Failed', className: 'badge-error' },
      in_progress: { icon: '⟳', label: 'Running', className: 'badge-warning' },
    };
    const s = statusMap[status] || { icon: '?', label: 'Unknown', className: 'badge-neutral' };
    return <span className={`status-badge ${s.className}`}>{s.icon} {s.label}</span>;
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Test automation metrics and recent activity</p>
        </div>
        <button className="btn-refresh">↻ Refresh</button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Total Runs Card */}
        <div className="kpi-card kpi-primary">
          <div className="kpi-header">
            <h3 className="kpi-title">Total Test Runs</h3>
            <div className="kpi-icon">📊</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;