import { API_BASE_URL } from '../config/api';

export interface ProjectMemberDto {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
}

export interface AddProjectMemberDto {
  userId: string;
  role: ProjectRole;
}

export interface UpdateProjectMemberDto {
  role: ProjectRole;
}

export interface AddMyselfToProjectDto {
  role: ProjectRole;
}

export enum ProjectRole {
  Admin = 0,
  Manager = 1,
  Member = 2
}

const memberService = {
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

  async updateProjectMember(projectId: string, memberId: string, dto: UpdateProjectMemberDto): Promise<ProjectMemberDto> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
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

  async addMyselfToProject(projectId: string, dto: AddMyselfToProjectDto): Promise<ProjectMemberDto> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/self`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to join project');
    return response.json();
  },
};

export default memberService;
