// AdminUsers.tsx
import { useEffect, useState } from "react";
import { useToast } from "@asafarim/toast";
import { useNavigate } from "react-router-dom";
import { Trash2, Key, Plus, X, Edit, Save, UserPlus } from "lucide-react";
import "./admin-components.css";

type AdminUser = {
  id: string;
  email?: string;
  userName?: string;
  roles: string[];
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
// Add this state near the top of the component with other states
const [editingUserId, setEditingUserId] = useState<string | null>(null);
const [editForm, setEditForm] = useState<{ email?: string; userName?: string }>({ email: '', userName: '' });

// Add these functions before the return statement
const startEditing = (user: AdminUser) => {
  setEditingUserId(user.id);
  setEditForm({
    email: user.email || '',
    userName: user.userName || ''
  });
};

const cancelEditing = () => {
  setEditingUserId(null);
  setEditForm({ email: '', userName: '' });
};

const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setEditForm(prev => ({ ...prev, [name]: value }));
};

const saveUserChanges = async (userId: string) => {
  const current = users.find(u => u.id === userId);
  if (!current) return;
  
  try {
    await saveUser({
      ...current,
      email: editForm.email,
      userName: editForm.userName
    });
    setUsers(prev => 
      prev.map(u => 
        u.id === userId 
          ? { ...u, email: editForm.email, userName: editForm.userName }
          : u
      )
    );
    setEditingUserId(null);
    toast.success('User updated successfully');
  } catch (err) {
    toast.error('Failed to update user', {
      description: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const base =
          import.meta.env.VITE_IDENTITY_API_URL || "http://localhost:5101";
        const [usersRes, rolesRes] = await Promise.all([
          fetch(`${base}/admin/users`, { credentials: "include" }),
          fetch(`${base}/admin/roles`, { credentials: "include" }),
        ]);

        if (!usersRes.ok || !rolesRes.ok) {
          const status = !usersRes.ok ? usersRes.status : rolesRes.status;
          let message = "Failed to load users and roles";
          if (status === 401)
            message = "You are not authenticated. Please sign in.";
          if (status === 403)
            message =
              "You are not authorized to view this page (admin role required).";
          const body = !usersRes.ok
            ? await usersRes.text()
            : await rolesRes.text();
          throw new Error(`${message}${body ? `: ${body}` : ""}`);
        }

        const usersJson = await usersRes.json();
        const rolesJson = await rolesRes.json();
        setUsers(usersJson);
        setRoles(rolesJson.map((r: { name: string }) => r.name));
      } catch (err) {
        const description =
          err instanceof Error ? err.message : "Unknown error";
        toast.error("Failed to load admin data", {
          description,
          durationMs: 6000,
        });
        if (description.toLowerCase().includes("not authenticated")) {
          navigate(`/login?returnUrl=${encodeURIComponent("/admin/users")}`);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveUser = async (u: AdminUser) => {
    const res = await fetch(
      `${
        import.meta.env.VITE_IDENTITY_API_URL || "http://localhost:5101"
      }/admin/users/${u.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: u.email, userName: u.userName }),
      }
    );
    if (!res.ok) throw new Error((await res.text()) || "Failed to save user");
  };

  const setUserRoles = async (u: AdminUser, nextRoles: string[]) => {
    const res = await fetch(
      `${
        import.meta.env.VITE_IDENTITY_API_URL || "http://localhost:5101"
      }/admin/users/${u.id}/roles`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roles: nextRoles }),
      }
    );
    if (!res.ok)
      throw new Error((await res.text()) || "Failed to update roles");
  };

  const deleteUser = async (u: AdminUser) => {
    const res = await fetch(
      `${
        import.meta.env.VITE_IDENTITY_API_URL || "http://localhost:5101"
      }/admin/users/${u.id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error((await res.text()) || "Failed to delete user");
  };

  const resetUserPassword = async (u: AdminUser) => {
    const res = await fetch(
      `${
        import.meta.env.VITE_IDENTITY_API_URL || "http://localhost:5101"
      }/admin/users/${u.id}/reset-password`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!res.ok)
      throw new Error((await res.text()) || "Failed to reset password");
    return res.json();
  };

  if (loading)
    return <div className="admin-loading">Loading users and roles...</div>;

return (
    <div className="admin-container">
      {/* Header Section */}
      <header className="admin-header">
        <div>
          <h1>User Management</h1>
          <p className="admin-subtitle">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/users/add")}
        >
          <UserPlus size={16} />
          <span>Add New User</span>
          <Plus size={16} />
        </button>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Today</h3>
          <p className="stat-number">-</p>
        </div>
        <div className="stat-card">
          <h3>Admin Users</h3>
          <p className="stat-number">
            {users.filter(u => u.roles.includes('Admin')).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Roles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="user-cell">
  <div className="user-avatar">
    {user.userName?.[0]?.toUpperCase() || 'U'}
  </div>
  <div>
    {editingUserId === user.id ? (
      <div className="edit-fields">
        <input
          type="email"
          name="email"
          value={editForm.email}
          onChange={handleEditFormChange}
          className="edit-input"
          placeholder="Email"
        />
        <input
          type="text"
          name="userName"
          value={editForm.userName}
          onChange={handleEditFormChange}
          className="edit-input"
          placeholder="Username"
        />
      </div>
    ) : (
      <>
        <div className="user-email">{user.email}</div>
        <div className="user-name">
          {user.userName || 'No username'}
        </div>
      </>
    )}
  </div>
  {editingUserId === user.id ? (
    <div className="edit-actions">
      <button 
        className="btn-icon success" 
        onClick={() => saveUserChanges(user.id)}
        title="Save changes"
      >
        <Save size={16} />
      </button>
      <button 
        className="btn-icon" 
        onClick={cancelEditing}
        title="Cancel"
      >
        <X size={16} />
      </button>
    </div>
  ) : (
    <button 
      className="btn-icon" 
      onClick={() => startEditing(user)}
      title="Edit user"
    >
      <Edit size={16} />
    </button>
  )}
</td>
                <td>
                  <div className="roles-container">
                    {user.roles.map((role) => (
                      <span key={role} className="role-tag">
                        {role}
                        <button
                          className="role-remove"
                          onClick={async () => {
                            const nextRoles = user.roles.filter(r => r !== role);
                            setUsers(prev => 
                              prev.map(u => 
                                u.id === user.id ? { ...u, roles: nextRoles } : u
                              )
                            );
                            try {
                              await setUserRoles(user, nextRoles);
                              toast.success('Role removed', {
                                description: `${role} removed from user`
                              });
                            } catch (err) {
                              toast.error('Failed to update roles', {
                                description: err instanceof Error ? err.message : 'Unknown error'
                              });
                            }
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <div className="add-role-dropdown">
                      <select
                        value=""
                        onChange={async (e) => {
                          const role = e.target.value;
                          if (!role) return;
                          
                          const nextRoles = [...user.roles, role];
                          setUsers(prev => 
                            prev.map(u => 
                              u.id === user.id ? { ...u, roles: nextRoles } : u
                            )
                          );
                          
                          try {
                            await setUserRoles(user, nextRoles);
                            toast.success('Role added', {
                              description: `${role} added to user`
                            });
                          } catch (err) {
                            toast.error('Failed to add role', {
                              description: err instanceof Error ? err.message : 'Unknown error'
                            });
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">Add role...</option>
                        {roles
                          .filter(r => !user.roles.includes(r))
                          .map(role => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon"
                      title="Reset Password"
                      onClick={async () => {
                        if (!window.confirm(`Reset password for ${user.email}?`)) return;
                        try {
                          await resetUserPassword(user);
                          toast.success('Password reset email sent');
                        } catch (err) {
                          toast.error('Failed to reset password', {
                            description: err instanceof Error ? err.message : 'Unknown error'
                          });
                        }
                      }}
                    >
                      <Key size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Delete User"
                      onClick={async () => {
                        if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
                        try {
                          await deleteUser(user);
                          setUsers(prev => prev.filter(u => u.id !== user.id));
                          toast.success('User deleted');
                        } catch (err) {
                          toast.error('Failed to delete user', {
                            description: err instanceof Error ? err.message : 'Unknown error'
                          });
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
