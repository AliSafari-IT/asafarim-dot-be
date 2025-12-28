import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Calendar } from 'lucide-react';
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
  const [searchText, setSearchText] = useState('');
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/test-runs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in to view test runs.');
          return;
        }
        
        if (response.status === 403) {
          setError('You do not have permission to view test runs.');
          return;
        }

        throw new Error('Failed to fetch test runs');
      }

      const data = await response.json();
      setRuns(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleBulkDelete = async (status?: string, olderThan?: string, all = false) => {
    const confirmMessage = all
      ? 'Are you sure you want to delete ALL test runs? This action cannot be undone.'
      : status
      ? `Are you sure you want to delete all ${status} test runs?`
      : olderThan
      ? `Are you sure you want to delete all test runs older than ${olderThan}?`
      : 'Are you sure you want to delete these test runs?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setDeleteLoading(true);
      const params = new URLSearchParams();
      if (all) params.append('all', 'true');
      if (status) params.append('status', status);
      if (olderThan) params.append('olderThan', olderThan);

      const response = await fetch(`${API_BASE}/api/test-runs/bulk?${params}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Authentication required. Please log in to delete test runs.');
          // Optionally redirect to login
          // navigate('/login');
          return;
        }
        
        if (response.status === 403) {
          alert('You do not have permission to delete test runs. This action requires Tester role.');
          return;
        }

        // Try to get error message from response
        let errorMessage = 'Failed to delete test runs';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use default message
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      alert(result.message || `Deleted ${result.deleted} test runs`);
      
      // Refresh the list
      await fetchRuns();
      setShowDeleteMenu(false);
      setShowDatePicker(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

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

  const filteredRuns = runs.filter((run) => {
    const searchLower = searchText.toLowerCase();
    return (
      run.runName.toLowerCase().includes(searchLower) ||
      run.status.toLowerCase().includes(searchLower)
    );
  });

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

  // Show empty state if search returns no results
  if (filteredRuns.length === 0 && searchText) {
    return (
      <div className="test-runs-container" data-testid="test-runs-page">
        <div className="test-runs-content">
          <div className="test-runs-header">
            <div>
              <h1 className="test-runs-title" data-testid="page-title">Test Runs</h1>
              <p className="test-runs-subtitle">View and manage all test run executions</p>
            </div>
          </div>

          <div className="test-runs-search-container">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search test runs by name or status..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
                aria-label="Search test runs"
              />
            </div>
          </div>

          <div className="test-runs-empty">
            <div className="test-runs-empty-icon">🔍</div>
            <h2 className="test-runs-empty-title">No Test Runs Found</h2>
            <p className="test-runs-empty-description">
              No test runs match your search criteria
            </p>
            <button
              className="test-runs-empty-action"
              onClick={() => setSearchText('')}
            >
              Clear Search
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
          <div className="test-runs-actions">
            <button
              className="btn-delete-menu"
              onClick={() => setShowDeleteMenu(!showDeleteMenu)}
              disabled={deleteLoading}
            >
              <Trash2 size={18} />
              Bulk Delete
            </button>
            {showDeleteMenu && (
              <div className="delete-menu">
                <button
                  onClick={() => handleBulkDelete('failed')}
                  disabled={deleteLoading}
                  className="delete-menu-item"
                >
                  Delete Failed
                </button>
                <button
                  onClick={() => handleBulkDelete('completed')}
                  disabled={deleteLoading}
                  className="delete-menu-item"
                >
                  Delete Completed
                </button>
                <button
                  onClick={() => handleBulkDelete('cancelled')}
                  disabled={deleteLoading}
                  className="delete-menu-item"
                >
                  Delete Cancelled
                </button>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  disabled={deleteLoading}
                  className="delete-menu-item"
                >
                  <Calendar size={16} />
                  Delete Older Than...
                </button>
                {showDatePicker && (
                  <div className="date-picker-container">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="date-picker-input"
                    />
                    <button
                      onClick={() => {
                        if (selectedDate) {
                          handleBulkDelete(undefined, selectedDate);
                        } else {
                          alert('Please select a date');
                        }
                      }}
                      disabled={deleteLoading || !selectedDate}
                      className="btn-date-delete"
                    >
                      Delete
                    </button>
                  </div>
                )}
                <hr className="delete-menu-divider" />
                <button
                  onClick={() => handleBulkDelete(undefined, undefined, true)}
                  disabled={deleteLoading}
                  className="delete-menu-item danger"
                >
                  Delete All Test Runs
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="test-runs-search-container">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search test runs by name or status..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
              aria-label="Search test runs"
            />
          </div>
          {searchText && (
            <div className="search-results-info">
              Showing {filteredRuns.length} of {runs.length} test run{runs.length !== 1 ? 's' : ''}
            </div>
          )}
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
              {filteredRuns.map(run => (
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
