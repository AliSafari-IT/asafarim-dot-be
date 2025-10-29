import { useEffect, useState } from 'react'
import { useAuth } from '@asafarim/shared-ui-react'
import { API_BASE_URL } from '../../api/config'
import './UserManagement.css'

interface UserPermission {
  id: string
  appUserId: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function UserManagement() {
  const { user, isAuthenticated } = useAuth()
  const [users, setUsers] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<string>('Member')

  useEffect(() => {
    if (!isAuthenticated) return
    fetchUsers()
  }, [isAuthenticated])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('🔐 Your session has expired. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('🔒 You don\'t have permission to access user management.')
        } else if (response.status === 404) {
          throw new Error('❌ User management endpoint not found.')
        } else {
          throw new Error(`❌ Failed to fetch users: ${response.statusText}`)
        }
      }

      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : '❌ Failed to fetch users'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, isActive: true }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('🔐 Your session has expired. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('🔒 You don\'t have permission to update user roles.')
        } else if (response.status === 404) {
          throw new Error('❌ User not found.')
        } else if (response.status === 400) {
          throw new Error('⚠️ Invalid role. Please select Member, Manager, or Admin.')
        } else {
          throw new Error(`❌ Failed to update user: ${response.statusText}`)
        }
      }

      const updated = await response.json()
      setUsers(users.map(u => u.appUserId === userId ? { ...u, role: updated.role } : u))
      setEditingId(null)
      setError(null)
      
      // Show success message with refresh instructions
      alert(`✅ Role updated to ${updated.role}!\n\n⚠️ Please refresh the page or log out and back in for the changes to take effect.`)
    } catch (err) {
      const message = err instanceof Error ? err.message : '❌ Failed to update user'
      setError(message)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="user-management-container">
        <div className="error-banner">
          <p>You must be logged in to access this page</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="user-management-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-management-container">
      <div className="management-header">
        <h1>User Management</h1>
        <p className="subtitle">Manage user roles and permissions</p>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {users.length > 0 ? (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Role</th>
                <th>Active</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userPerm) => (
                <tr key={userPerm.id} className="user-row">
                  <td className="user-id-cell">
                    <code>{userPerm.appUserId.substring(0, 8)}...</code>
                  </td>
                  <td className="role-cell">
                    {editingId === userPerm.appUserId ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="role-select"
                      >
                        <option value="Member">Member</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`role-badge role-${userPerm.role.toLowerCase()}`}>
                        {userPerm.role}
                      </span>
                    )}
                  </td>
                  <td className="active-cell">
                    {userPerm.isActive ? (
                      <span className="status-active">✓ Active</span>
                    ) : (
                      <span className="status-inactive">✗ Inactive</span>
                    )}
                  </td>
                  <td className="date-cell">
                    {new Date(userPerm.createdAt).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    {editingId === userPerm.appUserId ? (
                      <>
                        <button
                          className="btn-action btn-save"
                          onClick={() => handleUpdateRole(userPerm.appUserId, editRole)}
                        >
                          Save
                        </button>
                        <button
                          className="btn-action btn-cancel"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-action btn-edit"
                        onClick={() => {
                          setEditingId(userPerm.appUserId)
                          setEditRole(userPerm.role)
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      )}
    </div>
  )
}
