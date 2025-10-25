import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@asafarim/shared-ui-react'
import projectService from '../api/projectService';
import './ProjectForm.css'

export default function ProjectForm() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingProject, setLoadingProject] = useState(isEditMode)

  // Redirect unauthenticated users to identity portal login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const identityLoginUrl = 'http://identity.asafarim.local:5177/login'
      const returnUrl = encodeURIComponent(window.location.href)
      window.location.href = `${identityLoginUrl}?returnUrl=${returnUrl}`
    }
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    if (isAuthenticated && isEditMode && id) {
      loadProject(id)
    }
  }, [id, isEditMode, isAuthenticated])

  const loadProject = async (projectId: string) => {
    try {
      setLoadingProject(true)
      const project = await projectService.getProject(projectId)
      setFormData({
        name: project.name,
        description: project.description || '',
        isPrivate: project.isPrivate,
      })
    } catch (err) {
      setError('Failed to load project')
      console.error('Error loading project:', err)
    } finally {
      setLoadingProject(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (isEditMode && id) {
        await projectService.updateProject(id, formData)
      } else {
        await projectService.createProject(formData)
      }

      navigate('/projects')
    } catch (err) {
      setError(isEditMode ? 'Failed to update project' : 'Failed to create project')
      console.error('Error saving project:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  if (loadingProject) {
    return (
      <div className="project-form-page">
        <div className="form-loading">Loading project...</div>
      </div>
    )
  }

  return (
    <div className="project-form-page">
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Project' : 'Create New Project'}</h1>
        <button className="btn-back" onClick={() => navigate('/projects')}>
          ← Back to Projects
        </button>
      </div>

      <form className="project-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Project Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter project name"
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
            placeholder="Enter project description (optional)"
            rows={5}
            maxLength={1000}
          />
          <div className="form-hint">
            {formData.description.length}/1000 characters
          </div>
        </div>

        <div className="form-group">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              name="isPrivate"
              className="form-checkbox"
              checked={formData.isPrivate}
              onChange={handleChange}
            />
            <span className="checkbox-text">
              <strong>Private Project</strong>
              <span className="checkbox-hint">
                Only you and invited members can see this project
              </span>
            </span>
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/projects')}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
