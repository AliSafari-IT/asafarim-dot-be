import { CORE_API_BASE, getCookie } from '../api/core';

export interface ReferenceDto {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  relationship?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferenceRequest {
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  relationship?: string;
}

export interface UpdateReferenceRequest {
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  relationship?: string;
}

// Fetch all references for a resume
export const fetchReferences = async (resumeId: string): Promise<ReferenceDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/references`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch references');
  return response.json();
};

// Fetch reference by ID
export const fetchReferenceById = async (resumeId: string, id: string): Promise<ReferenceDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/references/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch reference');
  return response.json();
};

// Create new reference
export const createReference = async (resumeId: string, request: CreateReferenceRequest): Promise<ReferenceDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/references`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) throw new Error('Failed to create reference');
  return response.json();
};

// Update reference
export const updateReference = async (resumeId: string, id: string, request: UpdateReferenceRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/references/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) throw new Error('Failed to update reference');
};

// Delete reference
export const deleteReference = async (resumeId: string, id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/references/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete reference');
};
