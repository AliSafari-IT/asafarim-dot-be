// src/pages/admin-area/RoleCrudOperations.tsx
import { useEffect, useState } from 'react';
import { useToast } from '@asafarim/toast';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import './admin-dashboard.css';
import { ButtonComponent } from '@asafarim/shared-ui-react';

interface Role {
  id: string;
  name: string;
}

export default function RoleCrudOperations() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchRoles = async () => {
  try {
    setLoading(true);
    const base = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5101';
    console.log('Fetching roles from:', `${base}/api/roles`); // Debug log
    
    const response = await fetch(`${base}/api/roles`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Response status:', response.status); // Debug log
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText); // Debug log
      throw new Error(errorText || 'Failed to fetch roles');
    }
    
    const data = await response.json();
    console.log('Roles data received:', data); // Debug log
    
    // Ensure we have an array before setting state
    if (Array.isArray(data)) {
      // Map the response to match our Role interface
      const formattedRoles = data.map(role => ({
        id: role.id || '',
        name: role.name || role.Name || ''
      }));
      setRoles(formattedRoles);
    } else {
      console.error('Unexpected response format:', data);
      setRoles([]);
    }
  } catch (error) {
    console.error('Error in fetchRoles:', error); // Debug log
    const message = error instanceof Error ? error.message : 'Failed to load roles';
    toast.error('Error', { description: message, durationMs: 5000 });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('Validation Error', { description: 'Role name is required', durationMs: 4000 });
      return;
    }

    try {
      const base = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5101';
      const response = await fetch(`${base}/api/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newRoleName.trim() }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create role');
      }

      setNewRoleName('');
      await fetchRoles();
      toast.success('Success', { description: 'Role created successfully', durationMs: 3000 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create role';
      toast.error('Error', { description: message, durationMs: 5000 });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !editingRole.name.trim()) {
      toast.error('Validation Error', { description: 'Role name is required', durationMs: 4000 });
      return;
    }

    try {
      const base = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5101';
      const response = await fetch(`${base}/api/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editingRole.name.trim() }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update role');
      }

      setEditingRole(null);
      await fetchRoles();
      toast.success('Success', { description: 'Role updated successfully', durationMs: 3000 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update role';
      toast.error('Error', { description: message, durationMs: 5000 });
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    try {
      const base = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5101';
      const response = await fetch(`${base}/api/roles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete role');
      }

      await fetchRoles();
      toast.success('Success', { description: 'Role deleted successfully', durationMs: 3000 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete role';
      toast.error('Error', { description: message, durationMs: 5000 });
    }
  };

  return (
    <div data-testid="role-crud-operations-page" className="admin-container">
      <div className="admin-header">
        <h1>Role Management</h1>
        <p className="admin-subtitle">Manage user roles and permissions</p>
      </div>

      <div className="admin-form-container">
        <div className="form-group">
          <label htmlFor="newRole" className="form-label">
            Create New Role
          </label>
          <div className="flex gap-2">
            <input
              id="newRole"
              type="text"
              className="form-input flex-1"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Enter role name"
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={handleCreateRole}
              disabled={loading || !newRoleName.trim()}
            >
              <Plus size={16} className="mr-2" />
              Add Role
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Existing Roles</h2>
          {loading && !roles.length ? (
            <div className="loading-state">
              <span>Loading roles...</span>
            </div>
          ) : roles.length === 0 ? (
            <div className="empty-state">No roles found</div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th className="w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>
                        {editingRole?.id === role.id ? (
                          <input
                            type="text"
                            className="form-input"
                            value={editingRole.name}
                            onChange={(e) =>
                              setEditingRole({ ...editingRole, name: e.target.value })
                            }
                          />
                        ) : (
                          role.name
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingRole?.id === role.id ? (
                            <>
                              <ButtonComponent
                                onClick={handleUpdateRole}
                                disabled={loading}
                                variant="success"
                                title="Save"
                              >
                                <Save size={16} />
                              </ButtonComponent>
                              <ButtonComponent
                                onClick={() => setEditingRole(null)}
                                disabled={loading}
                                variant="danger"
                                title="Cancel"
                              >
                                <X size={16} />
                              </ButtonComponent>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn-icon"
                                onClick={() => setEditingRole({ ...role })}
                                disabled={!!editingRole}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="btn-icon danger"
                                onClick={() => handleDeleteRole(role.id)}
                                disabled={!!editingRole}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}