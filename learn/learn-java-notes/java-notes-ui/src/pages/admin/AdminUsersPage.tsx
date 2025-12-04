import { useState, useEffect, useCallback } from 'react';
import { adminUsersApi } from '../../api/adminApi';
import type { AdminUser, PageResponse } from '../../api/adminApi';
import './AdminPages.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'locked' | 'disabled' | 'admin'>('all');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      let response: { data: PageResponse<AdminUser> };
      
      if (searchQuery) {
        response = await adminUsersApi.search(searchQuery, page);
      } else if (filter === 'locked') {
        response = await adminUsersApi.getLocked(page);
      } else if (filter === 'disabled') {
        response = await adminUsersApi.getDisabled(page);
      } else if (filter === 'admin') {
        response = await adminUsersApi.getByRole('ADMIN', page);
      } else {
        response = await adminUsersApi.getAll(page);
      }
      
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadUsers();
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await adminUsersApi.unlock(userId);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to unlock user');
    }
  };

  const handleToggleEnabled = async (user: AdminUser) => {
    try {
      if (user.enabled) {
        await adminUsersApi.disable(user.id);
      } else {
        await adminUsersApi.enable(user.id);
      }
      loadUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to update user status');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Users Management</h1>
          <p>Manage user accounts and roles</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="admin-search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
          <button type="submit" className="admin-btn admin-btn-secondary">Search</button>
        </form>

        <div className="admin-filters">
          {(['all', 'admin', 'locked', 'disabled'] as const).map(f => (
            <button
              key={f}
              className={`admin-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => { setFilter(f); setPage(0); }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading">Loading...</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="admin-user-name">{user.displayName || user.username}</div>
                          <div className="admin-user-username">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.roles.map(role => (
                        <span key={role} className={`admin-role-badge ${role.toLowerCase()}`}>
                          {role}
                        </span>
                      ))}
                    </td>
                    <td>
                      {user.locked && <span className="admin-status-badge locked">Locked</span>}
                      {!user.enabled && <span className="admin-status-badge disabled">Disabled</span>}
                      {!user.locked && user.enabled && <span className="admin-status-badge active">Active</span>}
                    </td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td>
                      <div className="admin-actions">
                        {user.locked && (
                          <button className="admin-action-btn" onClick={() => handleUnlockUser(user.id)}>
                            Unlock
                          </button>
                        )}
                        <button className="admin-action-btn" onClick={() => handleToggleEnabled(user)}>
                          {user.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

export default AdminUsersPage;
