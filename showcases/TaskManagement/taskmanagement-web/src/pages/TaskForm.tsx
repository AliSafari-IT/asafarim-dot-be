import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@asafarim/shared-ui-react'
import taskService, { TaskStatus, TaskPriority, type CreateTaskDto, type UpdateTaskDto } from '../api/taskService'
import './TaskForm.css'

interface TaskFormProps {
  projectId?: string;
}

export default function TaskForm({ projectId: propProjectId }: TaskFormProps) {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { taskId, projectId: routeProjectId } = useParams<{ taskId?: string; projectId?: string }>()
  const [projectId, setProjectId] = useState(propProjectId || routeProjectId)
  const isEditMode = !!taskId

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.ToDo,
    priority: TaskPriority.Medium,
    dueDate: '',
    assignedUserIds: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingTask, setLoadingTask] = useState(isEditMode)

  // Redirect unauthenticated users to identity portal login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const identityLoginUrl = 'http://identity.asafarim.local:5177/login'
      const returnUrl = encodeURIComponent(window.location.href)
      window.location.href = `${identityLoginUrl}?returnUrl=${returnUrl}`
    }
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    if (isEditMode && taskId) {
      loadTask(taskId)
    }
  }, [taskId, isEditMode])

  const loadTask = async (id: string) => {
    try {
      setLoadingTask(true)
      const task = await taskService.getTask(id)
      setProjectId(task.projectId)
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedUserIds: task.assignments.map(a => a.userId),
      })
    } catch (err) {
      setError('Failed to load task')
      console.error('Error loading task:', err)
    } finally {
      setLoadingTask(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Task title is required')
      return
    }

    if (!projectId) {
      setError('Project ID is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (isEditMode && taskId) {
        const updateDto: UpdateTaskDto = {
          title: formData.title,
          description: formData.description || undefined,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          assignedUserIds: formData.assignedUserIds,
        }
        await taskService.updateTask(taskId, updateDto)
        navigate(`/projects/${projectId}`)
      } else {
        const createDto: CreateTaskDto = {
          projectId,
          title: formData.title,
          description: formData.description || undefined,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          assignedUserIds: formData.assignedUserIds,
        }
        await taskService.createTask(createDto)
        navigate(`/projects/${projectId}`)
      }
    } catch (err) {
      setError(isEditMode ? 'Failed to update task' : 'Failed to create task')
      console.error('Error saving task:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' || name === 'priority' ? parseInt(value) : value,
    }))
  }

  if (loadingTask) {
    return (
      <div className="task-form-page">
        <div className="form-loading">Loading task...</div>
      </div>
    )
  }

  return (
    <div className="task-form-page">
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Task' : 'Create New Task'}</h1>
        <button 
          className="btn-back" 
          onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}
        >
          ← Back
        </button>
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Task Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
            maxLength={200}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description (optional)"
            rows={4}
            maxLength={2000}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value={TaskStatus.ToDo}>To Do</option>
              <option value={TaskStatus.InProgress}>In Progress</option>
              <option value={TaskStatus.Done}>Done</option>
              <option value={TaskStatus.Blocked}>Blocked</option>
              <option value={TaskStatus.Archived}>Archived</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority" className="form-label">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value={TaskPriority.Low}>Low</option>
              <option value={TaskPriority.Medium}>Medium</option>
              <option value={TaskPriority.High}>High</option>
              <option value={TaskPriority.Critical}>Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              className="form-input"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  )
}
