import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import projectService, { type ProjectDto, ProjectRole } from '../api/projectService';
import { useAuth } from '@asafarim/shared-ui-react'
import './ProjectList.css'

type FilterType = 'all' | 'mine' | 'shared' | 'manager' | 'admin'

export default function ProjectList() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [allProjects, setAllProjects] = useState<ProjectDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [projectMembers, setProjectMembers] = useState<Map<string, ProjectRole>>(new Map())
  const [ownedProjectIds, setOwnedProjectIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        let allProjectsList: ProjectDto[] = []
        const memberRoles = new Map<string, ProjectRole>()

        let ownedIds = new Set<string>()
        
        if (isAuthenticated) {
          // Authenticated users: get their projects and shared projects
          const [myProjects, sharedProjects] = await Promise.all([
            projectService.getMyProjects(),
            projectService.getSharedProjects(),
          ])
          
          // Track which projects are owned by the user
          ownedIds = new Set(myProjects.map(p => p.id))
          
          // Deduplicate projects by ID (owned projects may also appear in shared)
          const projectMap = new Map<string, ProjectDto>()
          myProjects.forEach(p => projectMap.set(p.id, p))
          sharedProjects.forEach(p => projectMap.set(p.id, p))
          allProjectsList = Array.from(projectMap.values())

          // Fetch member roles for each project
          for (const project of allProjectsList) {
            try {
              // Fetch the user's role from members for all projects
              const members = await projectService.getProjectMembers(project.id)
              const userMember = members.find(m => m.userId === user?.id)
              if (userMember) {
                memberRoles.set(project.id, userMember.role)
              }
            } catch (err) {
              console.error(`Failed to fetch members for project ${project.id}:`, err)
            }
          }
          setOwnedProjectIds(ownedIds)
        } else {
          // Unauthenticated users: get only public projects
          allProjectsList = await projectService.getAllPublicProjects();
        }

        setAllProjects(allProjectsList)
        setProjectMembers(memberRoles)
        applyFilter(allProjectsList, 'all', memberRoles, ownedIds)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [isAuthenticated, user?.sub])

  const normalizeRole = (role: string | number | undefined): ProjectRole | null => {
    // Handle undefined
    if (role === undefined) {
      return null
    }
    
    // Handle numeric values (0, 1, 2)
    if (typeof role === 'number') {
      if (role === 0 || role === 1 || role === 2) {
        return role as ProjectRole
      }
      return null
    }
    
    // Handle string values
    if (typeof role === 'string') {
      const roleMap: { [key: string]: ProjectRole } = {
        'Admin': ProjectRole.Admin,
        'ADMIN': ProjectRole.Admin,
        '0': ProjectRole.Admin,
        'Manager': ProjectRole.Manager,
        'MANAGER': ProjectRole.Manager,
        '1': ProjectRole.Manager,
        'Member': ProjectRole.Member,
        'MEMBER': ProjectRole.Member,
        '2': ProjectRole.Member,
      }
      return roleMap[role] ?? null
    }
    
    return null
  }

  const applyFilter = (projectList: ProjectDto[], filterType: FilterType, roles: Map<string, ProjectRole>, owned: Set<string>) => {
    let filtered = projectList

    switch (filterType) {
      case 'mine':
        filtered = projectList.filter(p => owned.has(p.id))
        break
      case 'shared':
        filtered = projectList.filter(p => !owned.has(p.id) && roles.has(p.id))
        break
      case 'manager':
        filtered = projectList.filter(p => {
          const role = roles.get(p.id)
          const normalized = normalizeRole(role)
          return normalized === ProjectRole.Manager
        })
        break
      case 'admin':
        filtered = projectList.filter(p => {
          const role = roles.get(p.id)
          const normalized = normalizeRole(role)
          return normalized === ProjectRole.Admin
        })
        break
      case 'all':
      default:
        filtered = projectList
    }

    setProjects(filtered)
  }

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    applyFilter(allProjects, newFilter, projectMembers, ownedProjectIds)
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
      const updatedProjects = allProjects.filter(p => p.id !== projectId)
      const updatedOwned = new Set(ownedProjectIds)
      updatedOwned.delete(projectId)
      setAllProjects(updatedProjects)
      setOwnedProjectIds(updatedOwned)
      applyFilter(updatedProjects, filter, projectMembers, updatedOwned)
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
        <div className="projects-controls">
          {isAuthenticated && (
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'mine' ? 'active' : ''}`}
                onClick={() => handleFilterChange('mine')}
              >
                My Projects
              </button>
              <button
                className={`filter-btn ${filter === 'shared' ? 'active' : ''}`}
                onClick={() => handleFilterChange('shared')}
              >
                Shared With Me
              </button>
              <button
                className={`filter-btn ${filter === 'manager' ? 'active' : ''}`}
                onClick={() => handleFilterChange('manager')}
              >
                I'm Manager
              </button>
              <button
                className={`filter-btn ${filter === 'admin' ? 'active' : ''}`}
                onClick={() => handleFilterChange('admin')}
              >
                I'm Admin
              </button>
            </div>
          )}
          <button className="btn-create" onClick={() => navigate('/projects/new')}>+ New Project</button>
        </div>
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
