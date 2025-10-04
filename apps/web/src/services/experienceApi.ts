import { CORE_API_BASE, getCookie } from '../api/core';

export interface WorkAchievementDto {
  id: string;
  text: string;
}

export interface TechnologyDto {
  id: string;
  name: string;
  category?: string;
}

export interface ExperienceDto {
  id: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  responsibilities?: string;
  achievements?: WorkAchievementDto[];
  technologies?: TechnologyDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperienceRequest {
  companyName: string;
  jobTitle: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  technologies?: { name: string; category?: string }[];
  achievements?: { text: string }[];
  sortOrder?: number;
  highlighted?: boolean;
  isPublished?: boolean;
}

export interface UpdateExperienceRequest {
  companyName: string;
  jobTitle: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  technologies?: { name: string; category?: string }[];
  achievements?: { text: string }[];
  sortOrder?: number;
  highlighted?: boolean;
  isPublished?: boolean;
}

// Fetch all experiences for a resume
export const fetchExperiences = async (resumeId: string): Promise<ExperienceDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/workexperiences`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch experiences');
  return response.json();
};

// Fetch experience by ID
export const fetchExperienceById = async (resumeId: string, id: string): Promise<ExperienceDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/workexperiences/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch experience');
  return response.json();
};

// Create new experience
export const createExperience = async (resumeId: string, request: CreateExperienceRequest): Promise<ExperienceDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  // Sanitize payload: remove empty strings and filter blank items
  const sanitized: CreateExperienceRequest = {
    ...request,
    location: request.location?.trim() || undefined,
    description: request.description?.trim() || undefined,
    endDate: request.endDate?.trim() || undefined,
    achievements: request.achievements?.filter(a => a.text && a.text.trim().length > 0) || [],
    technologies: request.technologies?.filter(t => t.name && t.name.trim().length > 0) || [],
  };
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/workexperiences`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(sanitized),
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('Create experience error:', errorText);
    throw new Error(`Failed to create experience: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Update experience
export const updateExperience = async (resumeId: string, id: string, request: UpdateExperienceRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  // Sanitize payload similar to create
  const sanitized: UpdateExperienceRequest = {
    ...request,
    location: request.location?.trim() || undefined,
    description: request.description?.trim() || undefined,
    endDate: request.endDate?.trim() || undefined,
    achievements: request.achievements?.filter(a => a.text && a.text.trim().length > 0) || [],
    technologies: request.technologies?.filter(t => t.name && t.name.trim().length > 0) || [],
  };
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/workexperiences/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(sanitized),
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('Update experience error:', errorText);
    throw new Error(`Failed to update experience: ${response.status} ${response.statusText}`);
  }
};

// Delete experience
export const deleteExperience = async (resumeId: string, id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/workexperiences/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete experience');
};
