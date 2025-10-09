import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

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
  return apiGet<ProjectDto[]>(`/resumes/${resumeId}/projects`, {
  });
};

// Fetch project by ID
export const fetchProjectById = async (resumeId: string, id: string): Promise<ProjectDto> => {
  return apiGet<ProjectDto>(`/resumes/${resumeId}/projects/${id}`, {
  });
};

// Create new project
export const createProject = async (resumeId: string, request: CreateProjectRequest): Promise<ProjectDto> => {
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
  
  return apiPost<ProjectDto>(`/resumes/${resumeId}/projects`, {
    body: JSON.stringify(cleanedRequest),
  });
};

// Update project
export const updateProject = async (resumeId: string, id: string, request: UpdateProjectRequest): Promise<void> => {
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
  
  await apiPut<void>(`/resumes/${resumeId}/projects/${id}`, {
    body: JSON.stringify(cleanedRequest),
  });
};

// Delete project
export const deleteProject = async (resumeId: string, id: string): Promise<void> => {
  await apiDelete<void>(`/resumes/${resumeId}/projects/${id}`, {
  });
};
