import { CORE_API_BASE, getCookie } from '../api/core';

export interface TechnologyDto {
  id: string;
  name: string;
  category?: string;
}

export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
  technologies?: TechnologyDto[];
  startDate?: string;
  endDate?: string;
  link?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  technologies?: { name: string; category?: string }[];
  startDate?: string;
  endDate?: string;
  link?: string;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string;
  technologies?: { name: string; category?: string }[];
  startDate?: string;
  endDate?: string;
  link?: string;
}

// Fetch all projects for a resume
export const fetchProjects = async (resumeId: string): Promise<ProjectDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/projects`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

// Fetch project by ID
export const fetchProjectById = async (resumeId: string, id: string): Promise<ProjectDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/projects/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch project');
  return response.json();
};

// Create new project
export const createProject = async (resumeId: string, request: CreateProjectRequest): Promise<ProjectDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  // Clean up the request - remove empty dates and convert to ISO format
  const cleanedRequest = {
    ...request,
    startDate: request.startDate && request.startDate.trim() !== '' 
      ? new Date(request.startDate).toISOString() 
      : undefined,
    endDate: request.endDate && request.endDate.trim() !== '' 
      ? new Date(request.endDate).toISOString() 
      : undefined,
  };
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/projects`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(cleanedRequest),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create project error:', errorText);
    throw new Error('Failed to create project');
  }
  return response.json();
};

// Update project
export const updateProject = async (resumeId: string, id: string, request: UpdateProjectRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  // Clean up the request - remove empty dates and convert to ISO format
  const cleanedRequest = {
    ...request,
    startDate: request.startDate && request.startDate.trim() !== '' 
      ? new Date(request.startDate).toISOString() 
      : undefined,
    endDate: request.endDate && request.endDate.trim() !== '' 
      ? new Date(request.endDate).toISOString() 
      : undefined,
  };
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/projects/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(cleanedRequest),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update project error:', errorText);
    throw new Error('Failed to update project');
  }
};

// Delete project
export const deleteProject = async (resumeId: string, id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/projects/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete project');
};
