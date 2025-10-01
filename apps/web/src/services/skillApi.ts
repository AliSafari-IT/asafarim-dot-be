import { CORE_API_BASE, getCookie } from '../api/core';

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
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/skills`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch skills');
  return response.json();
};

// Fetch skill by ID
export const fetchSkillById = async (resumeId: string, id: string): Promise<SkillDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/skills/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch skill');
  return response.json();
};

// Create new skill
export const createSkill = async (resumeId: string, request: CreateSkillRequest): Promise<SkillDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/skills`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) throw new Error('Failed to create skill');
  return response.json();
};

// Update skill
export const updateSkill = async (resumeId: string, id: string, request: UpdateSkillRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/skills/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) throw new Error('Failed to update skill');
};

// Delete skill
export const deleteSkill = async (resumeId: string, id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/skills/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete skill');
};
