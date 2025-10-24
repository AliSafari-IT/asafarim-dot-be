import { useEffect, useState } from 'react'
import projectService, { type ProjectDto } from '../api/projectService'
import './ProjectList.css'
import { useNavigate } from 'react-router-dom'

export default function ProjectList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const [myProjects, sharedProjects] = await Promise.all([
        projectService.getMyProjects(),
        projectService.getSharedProjects(),
      ])
      // Deduplicate projects by ID (owned projects may also appear in shared)
      const projectMap = new Map<string, ProjectDto>()
      myProjects.forEach(p => projectMap.set(p.id, p))
      sharedProjects.forEach(p => projectMap.set(p.id, p))
      setProjects(Array.from(projectMap.values()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(projectId)
      await projectService.deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      alert('Failed to delete project')
      console.error('Error deleting project:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/projects/${projectId}/edit`)
  }

  if (loading) {
    return <div className="projects-loading">Loading projects...</div>
  }

  if (error) {
    return <div className="projects-error">{error}</div>
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
        <button className="btn-create" onClick={() => navigate('/projects/new')}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map((project) => (
            <div key={project.id} className="project-item">
              <div 
                className="project-content"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="project-info">
                  <h3>{project.name}</h3>
                  <p>{project.description || 'No description'}</p>
                </div>
                <div className="project-meta">
                  <span className="badge">{project.taskCount} tasks</span>
                  <span className="badge">{project.memberCount} members</span>
                  <span className={`badge ${project.isPrivate ? 'private' : 'public'}`}>
                    {project.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
              <div className="project-actions">
                <button
                  className="btn-action btn-edit"
                  onClick={(e) => handleEdit(project.id, e)}
                  title="Edit project"
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={(e) => handleDelete(project.id, project.name, e)}
                  disabled={deletingId === project.id}
                  title="Delete project"
                >
                  {deletingId === project.id ? '⏳' : '🗑️'} Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
