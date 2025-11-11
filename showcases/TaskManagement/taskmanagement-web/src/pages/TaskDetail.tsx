import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import taskService, { type TaskDto, TaskStatus, TaskPriority } from '../api/taskService'
import commentService, { type TaskCommentDto } from '../api/commentService'
import memberService, { ProjectRole } from '../api/memberService'
import { useAuth } from '@asafarim/shared-ui-react'
import TaskAssignees from '../components/TaskAssignees'
import UserDisplay from '../components/UserDisplay'
import './TaskDetail.css'

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [task, setTask] = useState<TaskDto | null>(null)
  const [comments, setComments] = useState<TaskCommentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState<ProjectRole | null>(null)

  useEffect(() => {
    if (taskId) {
      loadTaskData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, user?.id])

  const loadTaskData = async () => {
    if (!taskId) return

    try {
      setLoading(true)
      const [taskData, commentsData] = await Promise.all([
        taskService.getTask(taskId),
        commentService.getTaskComments(taskId).catch(() => [])
      ])
      setTask(taskData)
      setComments(commentsData)

      // Load user's role in the project if authenticated
      if (isAuthenticated && user?.id) {
        await loadUserRole(taskData.projectId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task')
    } finally {
      setLoading(false)
    }
  }

  const loadUserRole = async (projectId: string) => {
    if (!user?.id) return
    try {
      const members = await memberService.getProjectMembers(projectId)
      const userMember = members.find(m => m.userId === user.id)
      if (userMember) {
        setCurrentUserRole(userMember.role)
      }
    } catch (err) {
      console.error('Failed to load user role:', err)
    }
  }

  const handleTaskUpdate = (updatedTask: TaskDto) => {
    setTask(updatedTask)
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!taskId) return
    
    try {
      await taskService.updateTaskStatus(taskId, newStatus)
      setTask(prev => prev ? { ...prev, status: newStatus } : null)
    } catch {
      alert('Failed to update task status')
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskId || !commentText.trim()) return
    
    try {
      setSubmittingComment(true)
      const newComment = await commentService.createComment(taskId, { content: commentText })
      setComments(prev => [newComment, ...prev])
      setCommentText('')
      if (task) {
        setTask({ ...task, commentCount: task.commentCount + 1 })
      }
    } catch {
      alert('Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!taskId || !editCommentText.trim()) return
    
    try {
      const updated = await commentService.updateComment(taskId, commentId, { content: editCommentText })
      setComments(prev => prev.map(c => c.id === commentId ? updated : c))
      setEditingComment(null)
      setEditCommentText('')
    } catch {
      alert('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!taskId || !confirm('Are you sure you want to delete this comment?')) return
    
    try {
      await commentService.deleteComment(taskId, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      if (task) {
        setTask({ ...task, commentCount: task.commentCount - 1 })
      }
    } catch {
      alert('Failed to delete comment')
    }
  }

  const startEditComment = (comment: TaskCommentDto) => {
    setEditingComment(comment.id)
    setEditCommentText(comment.content)
  }

  const cancelEditComment = () => {
    setEditingComment(null)
    setEditCommentText('')
  }

  const getStatusLabel = (status: TaskStatus) => {
    const labels = ['To Do', 'In Progress', 'Done', 'Blocked', 'Archived']
    return labels[status]
  }

  const getPriorityLabel = (priority: TaskPriority) => {
    const labels = ['Low', 'Medium', 'High', 'Critical']
    return labels[priority]
  }

  const getPriorityClass = (priority: TaskPriority) => {
    const classes = ['priority-low', 'priority-medium', 'priority-high', 'priority-critical']
    return classes[priority]
  }

  if (loading) {
    return <div className="task-detail-loading">Loading task...</div>
  }

  if (error || !task || !taskId) {
    return <div className="task-detail-error">{error || 'Task not found'}</div>
  }

  return (
    <div className="task-detail">
      {/* Header */}
      <div className="task-header">
        <div className="task-header-left">
          <button className="btn-back" onClick={() => navigate(`/projects/${task.projectId}`)}>
            ← Back to Project
          </button>
          <div className="task-title-section">
            <h1>{task.title}</h1>
            <div className="task-meta-badges">
              <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </span>
              <span className={`status-badge status-${task.status}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="task-header-actions">
          <button 
            className="btn-secondary" 
            onClick={() => navigate(`/tasks/${taskId}/edit`)}
          >
            ✏️ Edit Task
          </button>
        </div>
      </div>

      <div className="task-content-grid">
        {/* Main Content */}
        <div className="task-main-content">
          {/* Description */}
          <div className="task-section">
            <h2>Description</h2>
            {task.description ? (
              <p className="task-description-text">{task.description}</p>
            ) : (
              <p className="task-no-description">No description provided</p>
            )}
          </div>

          {/* Comments Section */}
          <div className="task-section">
            <h2>Comments ({comments.length})</h2>
            
            {/* Add Comment Form */}
            <form className="comment-form" onSubmit={handleAddComment}>
              <textarea
                className="comment-textarea"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submittingComment || !commentText.trim()}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>

            {/* Comments List */}
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author">
                        <strong><UserDisplay userId={comment.userId} fallback={comment.userId} /></strong>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="comment-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => startEditComment(comment)}
                          title="Edit comment"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Delete comment"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="comment-edit-form">
                        <textarea
                          className="comment-textarea"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows={3}
                        />
                        <div className="comment-edit-actions">
                          <button 
                            className="btn-secondary"
                            onClick={cancelEditComment}
                          >
                            Cancel
                          </button>
                          <button 
                            className="btn-primary"
                            onClick={() => handleEditComment(comment.id)}
                            disabled={!editCommentText.trim()}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-content">{comment.content}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="task-sidebar">
          {/* Status Control */}
          <div className="sidebar-section">
            <h3>Status</h3>
            <select 
              className="status-select"
              value={task.status}
              onChange={(e) => handleStatusChange(parseInt(e.target.value))}
            >
              <option value={TaskStatus.ToDo}>To Do</option>
              <option value={TaskStatus.InProgress}>In Progress</option>
              <option value={TaskStatus.Done}>Done</option>
              <option value={TaskStatus.Blocked}>Blocked</option>
              <option value={TaskStatus.Archived}>Archived</option>
            </select>
          </div>

          {/* Task Details */}
          <div className="sidebar-section">
            <h3>Details</h3>
            <div className="detail-row">
              <span className="detail-label">Priority:</span>
              <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </span>
            </div>
            {task.dueDate && (
              <div className="detail-row">
                <span className="detail-label">Due Date:</span>
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Updated:</span>
              <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Assignees */}
          {currentUserRole !== null && user?.id && task && (
            <TaskAssignees
              projectId={task.projectId}
              task={task}
              currentUserId={user.id}
              currentUserRole={currentUserRole}
              onTaskUpdate={handleTaskUpdate}
            />
          )}

          {/* Attachments */}
          {task.attachmentCount > 0 && (
            <div className="sidebar-section">
              <h3>Attachments ({task.attachmentCount})</h3>
              <p className="sidebar-note">Attachment management coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
