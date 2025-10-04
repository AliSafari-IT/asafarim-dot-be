import { CORE_API_BASE, getCookie } from '../api/core';

export interface EducationDto {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEducationRequest {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface UpdateEducationRequest {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

// Fetch all educations for a resume
export const fetchEducations = async (resumeId: string): Promise<EducationDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/educations`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch educations');
  return response.json();
};

// Fetch education by ID
export const fetchEducationById = async (resumeId: string, id: string): Promise<EducationDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/educations/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch education');
  return response.json();
};

// Create new education
export const createEducation = async (resumeId: string, request: CreateEducationRequest): Promise<EducationDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  // Clean up the request - remove empty endDate
  const cleanedRequest = {
    ...request,
    endDate: request.endDate && request.endDate.trim() !== '' ? request.endDate : undefined,
  };
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/educations`, {
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
    console.error('Create education error:', errorText);
    throw new Error('Failed to create education');
  }
  return response.json();
};

// Update education
export const updateEducation = async (resumeId: string, id: string, request: UpdateEducationRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  // Clean up the request - remove empty endDate
  const cleanedRequest = {
    ...request,
    endDate: request.endDate && request.endDate.trim() !== '' ? request.endDate : undefined,
  };
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/educations/${id}`, {
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
    console.error('Update education error:', errorText);
    throw new Error('Failed to update education');
  }
};

// Delete education
export const deleteEducation = async (resumeId: string, id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/educations/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete education');
};
