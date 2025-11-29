import { useState, useEffect, useCallback } from 'react';
import { adminRolesApi } from '../../api/adminApi';
import type { AdminRole } from '../../api/adminApi';
import './AdminPages.css';

const AdminRolesPage = () => {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminRolesApi.getAll();
      setRoles(response.data);
    } catch (err) {
      setError('Failed to load roles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Roles Management</h1>
          <p>Manage user roles and their permissions</p>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-cards-grid">
        {loading ? (
          <div className="admin-loading">Loading...</div>
        ) : roles.length === 0 ? (
          <div className="admin-empty">No roles found</div>
        ) : (
          roles.map(role => (
            <div key={role.id} className="admin-card">
              <div className="admin-card-header">
                <span 
                  className="admin-role-color" 
                  style={{ backgroundColor: role.color || '#6b7280' }}
                />
                <h3>{role.name}</h3>
                {role.system && <span className="admin-badge system">System</span>}
              </div>
              <p className="admin-card-desc">{role.description || 'No description'}</p>
              <div className="admin-card-meta">
                <span>{role.userCount || 0} users</span>
                <span>{role.permissions?.length || 0} permissions</span>
              </div>
              <div className="admin-card-permissions">
                {role.permissions?.slice(0, 5).map(p => (
                  <span key={p} className="admin-permission-badge">{p}</span>
                ))}
                {(role.permissions?.length || 0) > 5 && (
                  <span className="admin-permission-more">+{role.permissions!.length - 5} more</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminRolesPage;
