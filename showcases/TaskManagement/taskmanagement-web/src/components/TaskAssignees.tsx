import { useEffect, useState } from 'react'
import { ProjectRole } from '../api/memberService'
import { TaskDto, UpdateTaskDto } from '../api/taskService'
import taskService from '../api/taskService'
import memberService, { ProjectMemberDto } from '../api/memberService'
import userService, { UserDto } from '../api/userService'
import './TaskAssignees.css'

interface TaskAssigneesProps {
  projectId: string;
  task: TaskDto;
  currentUserId: string;
  currentUserRole: ProjectRole;
  onTaskUpdate: (updatedTask: TaskDto) => void;
}

export default function TaskAssignees({
  projectId,
  task,
  currentUserId,
  currentUserRole,
  onTaskUpdate,
}: TaskAssigneesProps) {
  const [assignedUsers, setAssignedUsers] = useState<Map<string, UserDto>>(new Map())
  const [projectMembers, setProjectMembers] = useState<ProjectMemberDto[]>([])
  const [dropdownUsers, setDropdownUsers] = useState<Map<string, UserDto>>(new Map())
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load assigned users and project members
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch assigned users
        if (task.assignments && task.assignments.length > 0) {
          const userIds = task.assignments.map(a => a.userId)
          console.log('📋 Loading assigned users:', userIds)
          try {
            const users = await userService.getUsersByIds(userIds)
            console.log('✅ Assigned users loaded:', users)
            setAssignedUsers(new Map(Object.entries(users)))
          } catch (err) {
            console.error('⚠️ Batch users fetch failed, trying individual:', err)
            // Fallback: fetch users individually
            const userMap = new Map<string, UserDto>()
            for (const userId of userIds) {
              try {
                const user = await userService.getUserById(userId)
                console.log(`✅ Individual user fetched: ${userId}`, user)
                userMap.set(userId, user)
              } catch (individualErr) {
                console.error(`❌ Failed to fetch user ${userId}:`, individualErr)
                // Add placeholder user
                userMap.set(userId, {
                  id: userId,
                  email: userId,
                  userName: 'Unknown User'
                })
              }
            }
            setAssignedUsers(userMap)
          }
        }

        // Fetch project members
        console.log('📋 Loading project members for project:', projectId)
        const members = await memberService.getProjectMembers(projectId)
        console.log('✅ Project members loaded:', members)
        setProjectMembers(members)

        // Fetch users for all project members (for dropdown)
        const allMemberIds = members.map(m => m.userId)
        if (allMemberIds.length > 0) {
          console.log('👥 Loading dropdown users:', allMemberIds)
          try {
            const allUsers = await userService.getUsersByIds(allMemberIds)
            console.log('✅ Dropdown users loaded:', allUsers)
            setDropdownUsers(new Map(Object.entries(allUsers)))
          } catch (err) {
            console.error('⚠️ Failed to fetch dropdown users, trying individual:', err)
            // Fallback: fetch users individually
            const userMap = new Map<string, UserDto>()
            for (const member of members) {
              try {
                const user = await userService.getUserById(member.userId)
                console.log(`✅ Individual dropdown user fetched: ${member.userId}`, user)
                userMap.set(member.userId, user)
              } catch (individualErr) {
                console.error(`❌ Failed to fetch dropdown user ${member.userId}:`, individualErr)
                userMap.set(member.userId, {
                  id: member.userId,
                  email: member.userId,
                  userName: 'Unknown User'
                })
              }
            }
            setDropdownUsers(userMap)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [projectId, task.assignments])

  // Check if user can assign others
  const canAssignOthers = currentUserRole === ProjectRole.Admin || currentUserRole === ProjectRole.Manager

  // Check if user can unassign a specific user
  const canUnassign = (userId: string): boolean => {
    // Can always unassign themselves
    if (userId === currentUserId) return true
    // Only Admin and Manager can unassign others
    return canAssignOthers
  }

  // Check if user can assign (show button)
  const canAssign = (): boolean => {
    // Member can only assign if not already assigned
    if (currentUserRole === ProjectRole.Member) {
      return !task.assignments.some(a => a.userId === currentUserId)
    }
    // Admin and Manager can always assign
    return true
  }

  // Handle unassign
  const handleUnassign = async (userId: string) => {
    if (!canUnassign(userId)) {
      setError('You do not have permission to unassign this user')
      return
    }

    try {
      setLoading(true)
      const updatedAssignments = task.assignments.filter(a => a.userId !== userId)
      const updatedTask: UpdateTaskDto = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedUserIds: updatedAssignments.map(a => a.userId),
      }

      const result = await taskService.updateTask(task.id, updatedTask)
      onTaskUpdate(result)

      // Update local state
      const newAssignedUsers = new Map(assignedUsers)
      newAssignedUsers.delete(userId)
      setAssignedUsers(newAssignedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unassign user')
    } finally {
      setLoading(false)
    }
  }

  // Handle assign
  const handleAssign = async (userId: string) => {
    if (!canAssignOthers && userId !== currentUserId) {
      setError('You do not have permission to assign others')
      return
    }

    try {
      setLoading(true)
      const newAssignedIds = [...task.assignments.map(a => a.userId), userId]
      const updatedTask: UpdateTaskDto = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedUserIds: newAssignedIds,
      }

      const result = await taskService.updateTask(task.id, updatedTask)
      onTaskUpdate(result)

      // Update local state
      const user = dropdownUsers.get(userId)
      if (user) {
        const newAssignedUsers = new Map(assignedUsers)
        newAssignedUsers.set(userId, user)
        setAssignedUsers(newAssignedUsers)
      }

      setShowDropdown(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign user')
    } finally {
      setLoading(false)
    }
  }

  // Get available users to assign (not already assigned)
  const getAvailableUsers = (): ProjectMemberDto[] => {
    const assignedIds = new Set(task.assignments.map(a => a.userId))
    return projectMembers.filter(m => !assignedIds.has(m.userId))
  }

  // Get role badge text
  const getRoleBadgeText = (role: ProjectRole): string => {
    switch (role) {
      case ProjectRole.Admin:
        return 'Admin'
      case ProjectRole.Manager:
        return 'Manager'
      case ProjectRole.Member:
        return 'Member'
      default:
        return 'Unknown'
    }
  }

  // Get member role by userId
  const getMemberRole = (userId: string): ProjectRole | undefined => {
    return projectMembers.find(m => m.userId === userId)?.role
  }

  const assignmentCount = task.assignments?.length || 0

  return (
    <div className="task-assignees">
      <h3>Assignees ({assignmentCount})</h3>

      {error && <div className="error-message">{error}</div>}

      {assignmentCount === 0 ? (
        <p className="no-assignees">No assignees</p>
      ) : (
        <ul className="assignee-list">
          {task.assignments.map(assignment => {
            const user = assignedUsers.get(assignment.userId)
            const role = getMemberRole(assignment.userId)
            const canRemove = canUnassign(assignment.userId)

            return (
              <li key={assignment.userId} className="assignee-item">
                <div className="assignee-info">
                  <span className="assignee-name">{user?.userName || user?.email || 'Unknown'}</span>
                  {role !== undefined && (
                    <span className={`role-badge role-${getRoleBadgeText(role).toLowerCase()}`}>
                      {getRoleBadgeText(role)}
                    </span>
                  )}
                </div>
                {canRemove && (
                  <button
                    className="remove-btn"
                    onClick={() => handleUnassign(assignment.userId)}
                    disabled={loading}
                    title={`Unassign ${user?.userName || 'user'}`}
                    aria-label={`Remove ${user?.userName || 'user'}`}
                  >
                    ×
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {canAssign() && (
        <div className="assign-section">
          <button
            className="assign-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={loading || getAvailableUsers().length === 0}
            title={
              getAvailableUsers().length === 0
                ? 'All project members are already assigned'
                : 'Assign a team member to this task'
            }
          >
            + Assign
          </button>

          {showDropdown && (
            <div className="assign-dropdown">
              {getAvailableUsers().length === 0 ? (
                <p className="dropdown-empty">All members are already assigned</p>
              ) : (
                <ul className="member-list">
                  {getAvailableUsers().map(member => {
                    const user = dropdownUsers.get(member.userId)
                    return (
                      <li key={member.userId}>
                        <button
                          className="member-option"
                          onClick={() => handleAssign(member.userId)}
                          disabled={loading}
                        >
                          <span className="member-name">
                            {user?.userName || user?.email || 'Unknown'}
                          </span>
                          <span className={`role-badge role-${getRoleBadgeText(member.role).toLowerCase()}`}>
                            {getRoleBadgeText(member.role)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
