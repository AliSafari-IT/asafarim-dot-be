import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

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
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  
  return apiGet<TechnologyDto[]>(`/technologies?${params}`, {
  });
};

// Fetch technology by ID
export const fetchTechnologyById = async (id: string): Promise<TechnologyDto> => {
  return apiGet<TechnologyDto>(`/technologies/${id}`, {
  });
};

// Create new technology (Admin only)
export const createTechnology = async (request: CreateTechnologyRequest): Promise<TechnologyDto> => {
  return apiPost<TechnologyDto>(`/technologies`, {
    body: JSON.stringify(request),
  });
};

// Update technology (Admin only)
export const updateTechnology = async (id: string, request: UpdateTechnologyRequest): Promise<void> => {
  await apiPut<void>(`/technologies/${id}`, {
    body: JSON.stringify(request),
  });
};

// Delete technology (Admin only)
export const deleteTechnology = async (id: string): Promise<void> => {
  await apiDelete<void>(`/technologies/${id}`, {
  });
};
