import { useState, useEffect, useCallback } from 'react';
import { adminPermissionsApi } from '../../api/adminApi';
import type { Permission } from '../../api/adminApi';
import './AdminPages.css';

const AdminPermissionsPage = () => {
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminPermissionsApi.getByCategory();
      setPermissions(response.data);
    } catch (err) {
      setError('Failed to load permissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const categories = Object.keys(permissions);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Permissions Management</h1>
          <p>View and manage system permissions</p>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="admin-empty">No permissions found</div>
      ) : (
        <div className="admin-permissions-list">
          {categories.map(category => (
            <div key={category} className="admin-permissions-category">
              <h3 className="admin-category-title">{category || 'General'}</h3>
              <div className="admin-permissions-grid">
                {permissions[category].map(permission => (
                  <div key={permission.id} className="admin-permission-card">
                    <div className="admin-permission-name">{permission.name}</div>
                    <div className="admin-permission-desc">
                      {permission.description || 'No description'}
                    </div>
                    <div className="admin-permission-meta">
                      Used by {permission.roleCount} role(s)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPermissionsPage;
