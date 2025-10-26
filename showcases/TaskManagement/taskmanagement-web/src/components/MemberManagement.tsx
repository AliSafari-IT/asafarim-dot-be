import { useState, useEffect } from 'react'
import memberService, { ProjectRole, type ProjectMemberDto } from '../api/memberService'
import UserDisplay from './UserDisplay'
import '../styles/MemberManagement.css'

interface MemberManagementProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
  currentUserId?: string
  isProjectAdmin?: boolean
  projectOwnerId?: string
  onMembersUpdated?: () => void
}

export default function MemberManagement({
  projectId,
  isOpen,
  onClose,
  currentUserId,
  isProjectAdmin,
  projectOwnerId,
  onMembersUpdated,
}: MemberManagementProps) {
  const [members, setMembers] = useState<ProjectMemberDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [selectedRole, setSelectedRole] = useState<ProjectRole>(ProjectRole.Member)
  const [joiningProject, setJoiningProject] = useState(false)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [newMemberUserId, setNewMemberUserId] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<ProjectRole>(ProjectRole.Member)
  const [addingMember, setAddingMember] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMembers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, projectId])

  const loadMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await memberService.getProjectMembers(projectId)
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinProject = async () => {
    try {
      setJoiningProject(true)
      setError(null)
      await memberService.addMyselfToProject(projectId, { role: selectedRole })
      setShowJoinForm(false)
      await loadMembers()
      onMembersUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join project')
    } finally {
      setJoiningProject(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      setError(null)
      await memberService.removeProjectMember(projectId, memberId)
      await loadMembers()
      onMembersUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: ProjectRole) => {
    try {
      setError(null)
      await memberService.updateProjectMember(projectId, memberId, { role: newRole })
      await loadMembers()
      onMembersUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role')
    }
  }

  const handleAddMember = async () => {
    if (!newMemberUserId.trim()) {
      setError('Please enter a user ID')
      return
    }

    try {
      setAddingMember(true)
      setError(null)
      await memberService.addProjectMember(projectId, { userId: newMemberUserId, role: newMemberRole })
      setNewMemberUserId('')
      setNewMemberRole(ProjectRole.Member)
      setShowAddMemberForm(false)
      await loadMembers()
      onMembersUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  const isAlreadyMember = members.some(m => m.userId === currentUserId)
  const isProjectOwner = projectOwnerId === currentUserId
  const canJoinProject = isProjectAdmin || isProjectOwner
  const roleNames = {
    [ProjectRole.Admin]: 'Admin',
    [ProjectRole.Manager]: 'Manager',
    [ProjectRole.Member]: 'Member',
  }

  if (!isOpen) return null

  return (
    <div className="member-management-overlay" onClick={onClose}>
      <div className="member-management-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Project Members</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-content">
          {loading ? (
            <div className="loading">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="empty-state">No members yet</div>
          ) : (
            <div className="members-list">
              {members.map(member => (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <span className="member-id"><UserDisplay userId={member.userId} fallback={member.userId} /></span>
                    <span className={`role-badge role-${roleNames[member.role].toLowerCase()}`}>
                      {roleNames[member.role]}
                    </span>
                  </div>
                  {isProjectAdmin && member.userId !== currentUserId && (
                    <div className="member-actions">
                      <select
                        value={member.role}
                        onChange={e => handleUpdateRole(member.id, parseInt(e.target.value) as ProjectRole)}
                        className="role-select"
                      >
                        <option value={ProjectRole.Admin}>Admin</option>
                        <option value={ProjectRole.Manager}>Manager</option>
                        <option value={ProjectRole.Member}>Member</option>
                      </select>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {/* Add Member Button (for admins) */}
          {isProjectAdmin && !showAddMemberForm && (
            <button
              className="btn-primary"
              onClick={() => setShowAddMemberForm(true)}
            >
              + Add Member
            </button>
          )}

          {/* Add Member Form */}
          {showAddMemberForm && (
            <div className="add-member-form">
              <input
                type="text"
                placeholder="Enter user ID or email"
                value={newMemberUserId}
                onChange={e => setNewMemberUserId(e.target.value)}
                className="member-input"
              />
              <select
                value={newMemberRole}
                onChange={e => setNewMemberRole(parseInt(e.target.value) as ProjectRole)}
                className="role-select"
              >
                <option value={ProjectRole.Member}>Member</option>
                <option value={ProjectRole.Manager}>Manager</option>
                <option value={ProjectRole.Admin}>Admin</option>
              </select>
              <button
                className="btn-primary"
                onClick={handleAddMember}
                disabled={addingMember}
              >
                {addingMember ? 'Adding...' : 'Add'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowAddMemberForm(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Join Project Button */}
          {!isAlreadyMember && !showJoinForm && canJoinProject && (
            <button
              className="btn-primary"
              onClick={() => setShowJoinForm(true)}
            >
              Join Project
            </button>
          )}
          
          {!isAlreadyMember && !canJoinProject && (
            <div className="info-message">
              Only project owners and admins can join this project
            </div>
          )}

          {showJoinForm && (
            <div className="join-form">
              <label>
                Join as:
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(parseInt(e.target.value) as ProjectRole)}
                  className="role-select"
                >
                  <option value={ProjectRole.Member}>Member</option>
                  <option value={ProjectRole.Manager}>Manager</option>
                  <option value={ProjectRole.Admin}>Admin</option>
                </select>
              </label>
              <button
                className="btn-primary"
                onClick={handleJoinProject}
                disabled={joiningProject}
              >
                {joiningProject ? 'Joining...' : 'Confirm'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowJoinForm(false)}
              >
                Cancel
              </button>
            </div>
          )}

          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
