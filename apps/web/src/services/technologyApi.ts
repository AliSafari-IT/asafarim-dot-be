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
  // Validate field lengths (database limit is 50 characters)
  const validatedRequest = {
    name: request.name.length > 50 ? request.name.substring(0, 50) : request.name,
    category: request.category.length > 50 ? request.category.substring(0, 50) : request.category,
  };

  return apiPost<TechnologyDto>(`/technologies`, {
    body: JSON.stringify(validatedRequest),
  });
};

// Update technology (Admin only)
export const updateTechnology = async (id: string, request: UpdateTechnologyRequest): Promise<void> => {
  // Validate field lengths (database limit is 50 characters)
  const validatedRequest = {
    name: request.name.length > 50 ? request.name.substring(0, 50) : request.name,
    category: request.category.length > 50 ? request.category.substring(0, 50) : request.category,
  };

  await apiPut<void>(`/technologies/${id}`, {
    body: JSON.stringify(validatedRequest),
  });
};

// Delete technology (Admin only)
export const deleteTechnology = async (id: string): Promise<void> => {
  await apiDelete<void>(`/technologies/${id}`, {
  });
};
