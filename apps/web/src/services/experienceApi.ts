import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

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
  return apiGet<ExperienceDto[]>(`/resumes/${resumeId}/workexperiences`, {
  });
};

// Fetch experience by ID
export const fetchExperienceById = async (resumeId: string, id: string): Promise<ExperienceDto> => {
  return apiGet<ExperienceDto>(`/resumes/${resumeId}/workexperiences/${id}`, {
  });
};

// Create new experience
export const createExperience = async (resumeId: string, request: CreateExperienceRequest): Promise<ExperienceDto> => {
  // Sanitize payload: remove empty strings and filter blank items
  const sanitized: CreateExperienceRequest = {
    ...request,
    location: request.location?.trim() || undefined,
    description: request.description?.trim() || undefined,
    endDate: request.endDate?.trim() || undefined,
    achievements: request.achievements?.filter(a => a.text && a.text.trim().length > 0) || [],
    technologies: request.technologies?.filter(t => t.name && t.name.trim().length > 0) || [],
  };
  
  return apiPost<ExperienceDto>(`/resumes/${resumeId}/workexperiences`, {
    body: JSON.stringify(sanitized),
  });
};

// Update experience
export const updateExperience = async (resumeId: string, id: string, request: UpdateExperienceRequest): Promise<void> => {
  // Sanitize payload similar to create
  const sanitized: UpdateExperienceRequest = {
    ...request,
    location: request.location?.trim() || undefined,
    description: request.description?.trim() || undefined,
    endDate: request.endDate?.trim() || undefined,
    achievements: request.achievements?.filter(a => a.text && a.text.trim().length > 0) || [],
    technologies: request.technologies?.filter(t => t.name && t.name.trim().length > 0) || [],
  };
  
  await apiPut<void>(`/resumes/${resumeId}/workexperiences/${id}`, {
    body: JSON.stringify(sanitized),
  });
};

// Delete experience
export const deleteExperience = async (resumeId: string, id: string): Promise<void> => {
  await apiDelete<void>(`/resumes/${resumeId}/workexperiences/${id}`, {
  });
};
