import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import projectService, { type ProjectDto } from '../api/projectService'
import taskService, { type TaskDto, TaskStatus, TaskPriority } from '../api/taskService'
import memberService, { type ProjectMemberDto, ProjectRole } from '../api/memberService'
import { useAuth } from '@asafarim/shared-ui-react'
import MemberManagement from '../components/MemberManagement'
import './ProjectDetail.css'

type ViewMode = 'board' | 'list'

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [project, setProject] = useState<ProjectDto | null>(null)
  const [tasks, setTasks] = useState<TaskDto[]>([])
  const [members, setMembers] = useState<ProjectMemberDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const [showMemberModal, setShowMemberModal] = useState(false)
  
  // Filter states
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>("")
  const [filterAssignee, setFilterAssignee] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const loadProjectData = async () => {
    if (!projectId) return
    
    try {
      setLoading(true)
      const [projectData, tasksData, membersData] = await Promise.all([
        projectService.getProject(projectId),
        taskService.getProjectTasks(projectId),
        memberService.getProjectMembers(projectId).catch(() => [])
      ])
      setProject(projectData)
      setTasks(tasksData)
      setMembers(membersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus)
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      ))
    } catch {
      alert('Failed to update task status')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await taskService.deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch {
      alert('Failed to delete task')
    }
  }

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (filterPriority !== "" && task.priority !== filterPriority) return false
      if (filterAssignee && !task.assignments.some(a => a.userId === filterAssignee)) return false
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return getFilteredTasks().filter(t => t.status === status)
  }

  const getPriorityBadge = (priority: TaskPriority) => {
    const labels = ['Low', 'Medium', 'High', 'Critical']
    const classes = ['priority-low', 'priority-medium', 'priority-high', 'priority-critical']
    return <span className={`priority-badge ${classes[priority]}`}>{labels[priority]}</span>
  }

  const getStatusLabel = (status: TaskStatus) => {
    const labels = ['To Do', 'In Progress', 'Done', 'Blocked', 'Archived']
    return labels[status]
  }

  if (loading) {
    return <div className="project-detail-loading">Loading project...</div>
  }

  if (error || !project || !projectId) {
    return <div className="project-detail-error">{error || 'Project not found'}</div>
  }

  const filteredTasks = getFilteredTasks()

  return (
    <div className="project-detail">
      {/* Header */}
      <div className="project-header">
        <div className="project-info">
          <button className="btn-back" onClick={() => navigate('/projects')}>← Back</button>
          <div>
            <h1>{project.name}</h1>
            <p className="project-description">{project.description || 'No description'}</p>
          </div>
        </div>
        <div className="project-actions">
          <button className="btn-action" onClick={() => setShowMemberModal(true)}>
            👥 Members ({members.length})
          </button>
          <button className="btn-primary" onClick={() => navigate(`/projects/${projectId}/tasks/new`)}>
            + New Task
          </button>
        </div>
      </div>

      {/* View Mode Toggle & Filters */}
      <div className="project-controls">
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
            onClick={() => setViewMode('board')}
          >
            📋 Board
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📝 List
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search tasks..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value === "" ? "" : parseInt(e.target.value))}
          >
            <option value="">All Priorities</option>
            <option value={TaskPriority.Low}>Low</option>
            <option value={TaskPriority.Medium}>Medium</option>
            <option value={TaskPriority.High}>High</option>
            <option value={TaskPriority.Critical}>Critical</option>
          </select>
          {filteredTasks.length !== tasks.length && (
            <button className="btn-clear-filters" onClick={() => {
              setFilterPriority("")
              setFilterAssignee("")
              setSearchTerm("")
            }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Board View */}
      {viewMode === 'board' && (
        <div className="kanban-board">
          {[TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done, TaskStatus.Blocked].map(status => (
            <div key={status} className="kanban-column">
              <div className="column-header">
                <h3>{getStatusLabel(status)}</h3>
                <span className="task-count">{getTasksByStatus(status).length}</span>
              </div>
              <div className="column-tasks">
                {getTasksByStatus(status).map(task => (
                  <div 
                    key={task.id} 
                    className="task-card"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div className="task-card-header">
                      <h4>{task.title}</h4>
                      {getPriorityBadge(task.priority)}
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <div className="task-meta">
                      {task.dueDate && (
                        <span className="due-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                      {task.assignments.length > 0 && (
                        <span className="assignees">👤 {task.assignments.length}</span>
                      )}
                      {task.commentCount > 0 && (
                        <span className="comments">💬 {task.commentCount}</span>
                      )}
                    </div>
                    <div className="task-actions" onClick={(e) => e.stopPropagation()}>
                      <select 
                        className="status-select"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, parseInt(e.target.value))}
                      >
                        <option value={TaskStatus.ToDo}>To Do</option>
                        <option value={TaskStatus.InProgress}>In Progress</option>
                        <option value={TaskStatus.Done}>Done</option>
                        <option value={TaskStatus.Blocked}>Blocked</option>
                      </select>
                      <button 
                        className="btn-icon btn-edit"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/tasks/${task.id}/edit`)
                        }}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTask(task.id)
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {getTasksByStatus(status).length === 0 && (
                  <div className="empty-column">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">No tasks found</div>
          ) : (
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Assignees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)}>
                    <td>
                      <div className="task-title-cell">
                        <strong>{task.title}</strong>
                        {task.description && <p className="task-desc-preview">{task.description}</p>}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${task.status}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td>{getPriorityBadge(task.priority)}</td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    <td>{task.assignments.length} assigned</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => navigate(`/tasks/${task.id}/edit`)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Project Members</h2>
              <button className="btn-close" onClick={() => setShowMemberModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {members.length === 0 ? (
                <p>No members yet</p>
              ) : (
                <ul className="members-list">
                  {members.map(member => (
                    <li key={member.id} className="member-item">
                      <div>
                        <strong>{member.userId}</strong>
                        <span className="member-role">{ProjectRole[member.role]}</span>
                      </div>
                      <span className="member-joined">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Member Management Modal */}
      <MemberManagement
        projectId={projectId}
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        currentUserId={user?.id}
        isProjectAdmin={members.some(m => m.userId === user?.id && m.role === ProjectRole.Admin)}
        projectOwnerId={project?.userId}
        onMembersUpdated={() => {
          if (projectId) {
            memberService.getProjectMembers(projectId).then(setMembers)
          }
        }}
      />
    </div>
  )
}
