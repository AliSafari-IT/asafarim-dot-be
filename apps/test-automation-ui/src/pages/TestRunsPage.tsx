import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import './TestRunsPage.css';

interface TestRun {
  id: string;
  runName: string;
  status: string;
  startedAt: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate?: number;
}

export function TestRunsPage() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/test-runs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch test runs');

        const data = await response.json();
        setRuns(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, []);

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return 'completed';
    if (s === 'running') return 'running';
    if (s === 'failed') return 'failed';
    if (s === 'cancelled') return 'cancelled';
    return 'pending';
  };

  const getSuccessRate = (run: TestRun) => {
    if (run.successRate !== undefined) return run.successRate;
    if (run.totalTests === 0) return 0;
    return (run.passedTests / run.totalTests) * 100;
  };

  // 🌀 Loading state
  if (loading) {
    return (
      <div className="test-runs-container" data-testid="test-runs-loading">
        <div className="test-runs-loading">
          <div className="test-runs-loading-spinner"></div>
          <span>Loading test runs...</span>
        </div>
      </div>
    );
  }

  // ⚠️ Error state
  if (error) {
    return (
      <div className="test-runs-container" data-testid="test-runs-error">
        <div className="test-runs-error">Error: {error}</div>
      </div>
    );
  }

  // 📋 Empty state
  if (runs.length === 0) {
    return (
      <div className="test-runs-container" data-testid="test-runs-empty">
        <div className="test-runs-content">
          <div className="test-runs-header">
            <div>
              <h1 className="test-runs-title" data-testid="page-title">Test Runs</h1>
              <p className="test-runs-subtitle">View and manage all test run executions</p>
            </div>
          </div>
          <div className="test-runs-empty">
            <div className="test-runs-empty-icon">📋</div>
            <h2 className="test-runs-empty-title">No Test Runs Yet</h2>
            <p className="test-runs-empty-description">
              Start by running a test suite to see results here
            </p>
            <button
              className="test-runs-empty-action"
              data-testid="go-to-run-tests-btn"
              onClick={() => navigate('/run-tests')}
            >
              Go to Run Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 📊 Runs table
  return (
    <div className="test-runs-container" data-testid="test-runs-page">
      <div className="test-runs-content">
        <div className="test-runs-header">
          <div>
            <h1 className="test-runs-title" data-testid="page-title">Test Runs</h1>
            <p className="test-runs-subtitle">View and manage all test run executions</p>
          </div>
        </div>

        <div className="test-runs-table-wrapper">
          <table className="test-runs-table" data-testid="test-runs-table">
            <thead>
              <tr>
                <th>Run Name</th>
                <th>Status</th>
                <th>Tests</th>
                <th>Success Rate</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr
                  key={run.id}
                  data-testid={`test-run-row-${run.id}`}
                  onClick={() => navigate(`/test-runs/${run.id}`)}
                >
                  <td data-testid="run-name">{run.runName}</td>
                  <td data-testid="run-status">
                    <span
                      className={`test-runs-status-badge ${getStatusBadgeClass(run.status)}`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td data-testid="run-tests-count">
                    {run.passedTests}/{run.totalTests}
                    <div className="test-runs-progress-bar">
                      <div
                        className="test-runs-progress-fill"
                        data-testid="run-progress-bar"
                        style={{ width: `${getSuccessRate(run)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td data-testid="run-success-rate">
                    {getSuccessRate(run).toFixed(1)}%
                  </td>
                  <td data-testid="run-started-at">
                    {new Date(run.startedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
