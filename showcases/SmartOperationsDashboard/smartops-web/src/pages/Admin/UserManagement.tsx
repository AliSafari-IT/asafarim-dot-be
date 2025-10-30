import { useEffect, useState } from 'react'
import { useAuth } from '@asafarim/shared-ui-react'
import { API_BASE_URL, IDENTITY_API_URL } from '../../api/config'
import './UserManagement.css'

interface User {
  id: string
  email?: string
  userName?: string
  roles: string[]
  isActive?: boolean
  createdAt?: string
}

export default function UserManagement() {
  const { isAuthenticated } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataActionLoading, setDataActionLoading] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<string>('')

  useEffect(() => {
    if (!isAuthenticated) return
    fetchUsers()
  }, [isAuthenticated])

  const fetchUsers = async () => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${IDENTITY_API_URL}/admin/users`, { credentials: 'include' }),
        fetch(`${IDENTITY_API_URL}/admin/roles`, { credentials: 'include' })
      ])

      if (!usersRes.ok || !rolesRes.ok) {
        const status = !usersRes.ok ? usersRes.status : rolesRes.status
        let message = 'Failed to load users and roles'
        if (status === 401) message = '🔐 Your session has expired. Please log in again.'
        if (status === 403) message = '🔒 You are not authorized to view this page (admin role required).'
        const body = !usersRes.ok ? await usersRes.text() : await rolesRes.text()
        throw new Error(`${message}${body ? `: ${body}` : ''}`)
      }

      const usersData = await usersRes.json()
      const rolesData = await rolesRes.json()
      
      setUsers(usersData)
      setRoles(rolesData.map((r: { name: string }) => r.name))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : '❌ Failed to fetch users and roles'
      setError(message)
      
      // Redirect to login if not authenticated
      if (message.toLowerCase().includes('not authenticated')) {
        window.location.href = '/login?returnUrl=' + encodeURIComponent('/admin/users')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      setDataActionLoading('update-role')
      
      // First get current user roles
      const user = users.find(u => u.id === userId)
      if (!user) throw new Error('User not found')
      
      // Update the roles array
      const updatedRoles = [...user.roles]
      const roleIndex = updatedRoles.findIndex(r => r === newRole)
      
      if (roleIndex === -1) {
        // Add role if not present
        updatedRoles.push(newRole)
      } else {
        // Remove role if already present (toggle)
        updatedRoles.splice(roleIndex, 1)
      }
      
      // Update the user's roles
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/roles`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Roles: updatedRoles })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to update roles')
      }

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, roles: updatedRoles } : u
      ))
      
      setSuccessMessage(roleIndex === -1 
        ? `✅ Added role ${newRole} to user` 
        : `✅ Removed role ${newRole} from user`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : '❌ Failed to update user roles'
      setError(message)
    } finally {
      setDataActionLoading(null)
    }
  }

  const handleSeedTestData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to seed test data?\n\nThis will create:\n• 3 test devices (HVAC, Generator, Lighting)\n• Sample readings for the past 7 days\n\nExisting data will not be overwritten.'
    )
    
    if (!confirmed) return

    try {
      setDataActionLoading('seed')
      setError(null)
      setSuccessMessage(null)

      const response = await fetch(`${API_BASE_URL}/admin/seed-test-data`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('🔐 Your session has expired. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('🔒 You don\'t have permission to seed test data.')
        } else {
          const error = await response.json()
          throw new Error(error.error || `❌ Failed to seed test data: ${response.statusText}`)
        }
      }

      const result = await response.json()
      
      // Show detailed stats with total accumulated data
      const message = result.totalReadings && result.totalDevices
        ? `✅ ${result.message}! 📊 Total dataset: ${result.totalDevices} devices with ${result.totalReadings.toLocaleString()} readings across time.`
        : '✅ ' + result.message
      
      setSuccessMessage(message)
      
      // Dispatch global event to refresh dashboard
      window.dispatchEvent(new CustomEvent('data-seeded', { detail: { result } }))
      
      // Clear success message after 8 seconds (longer to read the stats)
      setTimeout(() => setSuccessMessage(null), 8000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed test data')
    } finally {
      setDataActionLoading(null)
    }
  }

  const handleClearTestData = async () => {
    const confirmed = window.confirm(
      '⚠️ This will delete all TEST devices and their readings.\n\nTest devices with serial numbers:\n- HVAC-001-TEST-001\n- GEN-001-TEST-001\n- LIGHT-001-TEST-001\n\nDo you want to continue?'
    )
    
    if (!confirmed) return

    try {
      setDataActionLoading('clear')
      setError(null)
      setSuccessMessage(null)

      const response = await fetch(`${API_BASE_URL}/admin/clear-test-data`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('🔐 Your session has expired. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('🔒 You don\'t have permission to clear test data.')
        } else {
          const error = await response.json()
          throw new Error(error.error || `❌ Failed to clear test data: ${response.statusText}`)
        }
      }

      const result = await response.json()
      const message = result.devices !== undefined && result.readings !== undefined
        ? `✅ Test data cleared! Removed ${result.devices} devices and ${result.readings} readings.`
        : '✅ ' + result.message
      setSuccessMessage(message)
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear test data')
    } finally {
      setDataActionLoading(null)
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
        <div className="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="subtitle">Manage user roles and build test datasets for impressive charts</p>
          </div>
          <div className="data-management-buttons">
            <button
              className="btn-data btn-seed"
              onClick={handleSeedTestData}
              disabled={dataActionLoading === 'seed'}
              title="Add more test readings to build up historical data. Devices are created on first run, then data is appended on subsequent runs."
            >
              {dataActionLoading === 'seed' ? (
                <>
                  <span className="spinner"></span>
                  Adding Data...
                </>
              ) : (
                <>
                  <span className="icon">📊</span>
                  Add Test Data
                </>
              )}
            </button>
            <button
              className="btn-data btn-clear"
              onClick={handleClearTestData}
              disabled={dataActionLoading === 'clear'}
              title="Remove all test devices (HVAC-001, Generator-001, Lighting-001) and their accumulated readings. Use this to start fresh."
            >
              {dataActionLoading === 'clear' ? (
                <>
                  <span className="spinner"></span>
                  Removing...
                </>
              ) : (
                <>
                  <span className="icon">🗑️</span>
                  Clear All Test Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="success-banner">
          <p>{successMessage}</p>
        </div>
      )}

      {users.length > 0 ? (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
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
                    <code>{userPerm.userName || userPerm.email}</code>
                  </td>
                  <td className="role-cell">
                    {editingId === userPerm.id ? (
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
                      <div className="role-badges">
                        {userPerm.roles.map(role => (
                          <span key={role} className={`role-badge role-${role.toLowerCase()}`}>
                            {role}
                          </span>
                        ))}
                      </div>
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
                   {new Date(userPerm.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    {editingId === userPerm.id ? (
                      <>
                        <button
                          className="btn-action btn-save"
                          onClick={() => handleUpdateRole(userPerm.id, editRole)}
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
                          setEditingId(userPerm.id)
                          setEditRole(userPerm.roles[0] || '')
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
