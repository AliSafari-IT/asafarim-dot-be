import { API_BASE_URL } from '../config/api';

export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
  userId: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  memberCount: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateProjectDto {
  name: string;
  description?: string;
  isPrivate: boolean;
}

export interface ProjectMemberDto {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
}

export interface AddProjectMemberDto {
  userId: string;
  role?: ProjectRole;
}

export enum ProjectRole {
  Admin = 0,
  Manager = 1,
  Member = 2
}

const projectService = {
  async getProject(id: string): Promise<ProjectDto> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  async getMyProjects(): Promise<ProjectDto[]> {
    const response = await fetch(`${API_BASE_URL}/projects/my-projects`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async getSharedProjects(): Promise<ProjectDto[]> {
    const response = await fetch(`${API_BASE_URL}/projects/shared`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch shared projects');
    return response.json();
  },

  async createProject(dto: CreateProjectDto): Promise<ProjectDto> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  async updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete project');
  },

  async getProjectMembers(projectId: string): Promise<ProjectMemberDto[]> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch project members');
    return response.json();
  },

  async addProjectMember(projectId: string, dto: AddProjectMemberDto): Promise<ProjectMemberDto> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to add project member');
    return response.json();
  },

  async updateProjectMember(projectId: string, memberId: string, role: ProjectRole): Promise<ProjectMemberDto> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('Failed to update project member');
    return response.json();
  },

  async removeProjectMember(projectId: string, memberId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${memberId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to remove project member');
  },
};

export default projectService;
