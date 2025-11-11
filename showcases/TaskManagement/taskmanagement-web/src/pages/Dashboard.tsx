import { useEffect, useState } from 'react'
import { useAuth, isProduction } from '@asafarim/shared-ui-react'
import projectService, { type ProjectDto } from '../api/projectService'
//import taskService, { TaskDto } from '../api/taskService'
import './Dashboard.css';

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<ProjectDto[]>([])
//  const [recentTasks, setRecentTasks] = useState<TaskDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect unauthenticated users to identity portal login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const identityLoginUrl = isProduction
        ? 'https://identity.asafarim.be/login'
        : 'http://identity.asafarim.local:5177/login'
      const returnUrl = encodeURIComponent(window.location.href)
      window.location.href = `${identityLoginUrl}?returnUrl=${returnUrl}`
    }
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard()
    }
  }, [isAuthenticated])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [myProjects] = await Promise.all([
        projectService.getMyProjects(),
      ])
      setProjects(myProjects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's an overview of your tasks and projects.</p>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <h2>Your Projects</h2>
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <a key={project.id} href={`/projects/${project.id}`} className="project-card">
                  <h3>{project.name}</h3>
                  <p>{project.description || 'No description'}</p>
                  <div className="project-stats">
                    <span>{project.taskCount} tasks</span>
                    <span>{project.memberCount} members</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{projects.length}</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{projects.reduce((sum, p) => sum + p.taskCount, 0)}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
