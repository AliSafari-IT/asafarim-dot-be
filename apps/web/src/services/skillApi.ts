import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

export interface SkillDto {
  id: string;
  name: string;
  category: string;
  level: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillRequest {
  name: string;
  category: string;
  level: string;
  rating: number;
}

export interface UpdateSkillRequest {
  name: string;
  category: string;
  level: string;
  rating: number;
}

// Fetch all skills for a resume
export const fetchSkills = async (resumeId: string): Promise<SkillDto[]> => {
  return apiGet<SkillDto[]>(`/resumes/${resumeId}/skills`, {
  });
};

// Fetch skill by ID
export const fetchSkillById = async (resumeId: string, id: string): Promise<SkillDto> => {
  return apiGet<SkillDto>(`/resumes/${resumeId}/skills/${id}`, {
  });
};

// Create new skill
export const createSkill = async (resumeId: string, request: CreateSkillRequest): Promise<SkillDto> => {
  return apiPost<SkillDto>(`/resumes/${resumeId}/skills`, {
    body: JSON.stringify(request),
  });
};

// Update skill
export const updateSkill = async (resumeId: string, id: string, request: UpdateSkillRequest): Promise<void> => {
  await apiPut<void>(`/resumes/${resumeId}/skills/${id}`, {
    body: JSON.stringify(request),
  });
};

// Delete skill
export const deleteSkill = async (resumeId: string, id: string): Promise<void> => {
  await apiDelete<void>(`/resumes/${resumeId}/skills/${id}`, {
  });
};
