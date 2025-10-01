import { CORE_API_BASE, getCookie } from '../api/core';

export interface TechnologyDto {
  id: string;
  name: string;
  category: string;
}

export interface CreateTechnologyRequest {
  name: string;
  category: string;
}

export interface UpdateTechnologyRequest {
  name: string;
  category: string;
}

// Fetch all technologies
export const fetchTechnologies = async (category?: string): Promise<TechnologyDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  
  const response = await fetch(`${CORE_API_BASE}/technologies?${params}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch technologies');
  return response.json();
};

// Fetch technology by ID
export const fetchTechnologyById = async (id: string): Promise<TechnologyDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/technologies/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch technology');
  return response.json();
};

// Create new technology (Admin only)
export const createTechnology = async (request: CreateTechnologyRequest): Promise<TechnologyDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/technologies`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) throw new Error('Failed to create technology');
  return response.json();
};

// Update technology (Admin only)
export const updateTechnology = async (id: string, request: UpdateTechnologyRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/technologies/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) throw new Error('Failed to update technology');
};

// Delete technology (Admin only)
export const deleteTechnology = async (id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/technologies/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete technology');
};
