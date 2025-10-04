import { CORE_API_BASE, getCookie } from '../api/core';

export interface AwardDto {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAwardRequest {
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface UpdateAwardRequest {
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

// Fetch all awards for a resume
export const fetchAwards = async (resumeId: string): Promise<AwardDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/awards`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch awards');
  return response.json();
};

// Fetch award by ID
export const fetchAwardById = async (resumeId: string, id: string): Promise<AwardDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/awards/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch award');
  return response.json();
};

// Create new award
export const createAward = async (resumeId: string, request: CreateAwardRequest): Promise<AwardDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  // Convert date to ISO format
  const cleanedRequest = {
    ...request,
    date: new Date(request.date).toISOString(),
  };
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/awards`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(cleanedRequest),
  });
  
  if (!response.ok) throw new Error('Failed to create award');
  return response.json();
};

// Update award
export const updateAward = async (resumeId: string, id: string, request: UpdateAwardRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  // Convert date to ISO format
  const cleanedRequest = {
    ...request,
    date: new Date(request.date).toISOString(),
  };
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/awards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(cleanedRequest),
  });
  
  if (!response.ok) throw new Error('Failed to update award');
};

// Delete award
export const deleteAward = async (resumeId: string, id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/awards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete award');
};
