import { useState, useEffect, useCallback } from 'react';
import { adminSystemApi } from '../../api/adminApi';
import type { AuditLog, PageResponse } from '../../api/adminApi';
import './AdminPages.css';

const AdminLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [severity, setSeverity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      let response: { data: PageResponse<AuditLog> };
      
      if (searchQuery) {
        response = await adminSystemApi.searchLogs(searchQuery, severity || undefined, page);
      } else if (severity) {
        response = await adminSystemApi.getLogsBySeverity(severity, page);
      } else {
        response = await adminSystemApi.getLogs(page);
      }
      
      setLogs(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to load audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, severity, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadLogs();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getSeverityClass = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'error': return 'severity-error';
      case 'warning': return 'severity-warning';
      case 'info': return 'severity-info';
      default: return '';
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Audit Logs</h1>
          <p>Track system activities and admin actions</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="admin-search">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
          <button type="submit" className="admin-btn admin-btn-secondary">Search</button>
        </form>

        <select 
          value={severity} 
          onChange={(e) => { setSeverity(e.target.value); setPage(0); }}
          className="admin-select"
        >
          <option value="">All Severities</option>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
        </select>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading">Loading...</div>
        ) : (
          <>
            <table className="admin-table admin-logs-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Entity</th>
                  <th>Severity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={6} className="admin-empty-row">No logs found</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td className="admin-log-time">{formatDate(log.createdAt)}</td>
                      <td><span className="admin-log-action">{log.action}</span></td>
                      <td>{log.userName || 'System'}</td>
                      <td>{log.entityType}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}</td>
                      <td>
                        <span className={`admin-severity-badge ${getSeverityClass(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="admin-log-details">{log.details || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span>Page {page + 1} of {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogsPage;
