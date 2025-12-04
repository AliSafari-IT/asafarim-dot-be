import type { ProjectCardProps, ProjectLink } from '../types';

/**
 * Maps a project from the database to the format expected by ProjectCard component
 * This function is designed to work with database models that have different property names
 */
export function mapProject(project: any): ProjectCardProps {
  // Build links array from available URLs
  const links: ProjectLink[] = [];
  
  // Handle live demo URL (from database model)
  if (project.liveDemoUrl || project.liveUrl) {
    links.push({
      type: 'demo',
      url: project.liveDemoUrl || project.liveUrl,
      label: 'Live Demo'
    });
  }
  
  // Handle repository URL (from database model)
  if (project.repositoryUrl || project.repo?.url) {
    links.push({
      type: 'repo',
      url: project.repositoryUrl || project.repo?.url,
      label: 'Repository'
    });
  }

  // Map status from DB to component status
  const statusMap: Record<string, ProjectCardProps['status']> = {
    'Planning': 'planning',
    'Active': 'active',
    'In Progress': 'in-progress',
    'Completed': 'completed',
    'Archived': 'archived',
    'Draft': 'draft'
  };

  // Handle image from database model
  const image = project.thumbnailUrl ? {
    src: project.thumbnailUrl,
    alt: project.title
  } : project.image;

  return {
    // Core properties
    id: project.id,
    title: project.title,
    description: project.description || '',
    image,
    techStacks: project.techStacks || [],
    links,
    repo: project.repo,
    
    // Status and metadata
    status: statusMap[project.status as string] || project.status || 'active',
    isFeatured: project.isFeatured,
    lastUpdated: project.updatedAt,
    
    // Additional properties from DB
    priority: project.priority,
    category: project.category,
    progress: project.progress,
    tags: project.tags,
    startDate: project.startDate,
    endDate: project.endDate,
    dueDate: project.dueDate,
    budget: project.budget,
    isPublic: project.isPublic,
    relatedProjects: project.relatedProjects,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    createdBy: project.createdBy,
    updatedBy: project.updatedBy
  };
}

/**
 * Maps multiple projects from database to ProjectCard format
 */
export function mapProjects(projects: any[]): ProjectCardProps[] {
  return projects.map(mapProject);
}

/**
 * Filters projects by visibility (public/private)
 */
export function filterPublicProjects(projects: ProjectCardProps[]): ProjectCardProps[] {
  return projects.filter(project => project.isPublic);
}

/**
 * Sorts projects by featured status and creation date
 */
export function sortProjects(projects: ProjectCardProps[]): ProjectCardProps[] {
  return projects.sort((a, b) => {
    // Featured projects first
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    
    // Then by creation date (newest first)
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    return 0;
  });
} 