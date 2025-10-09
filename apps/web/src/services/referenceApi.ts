import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

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
  return apiGet<ReferenceDto[]>(`/resumes/${resumeId}/references`, {
  });
};

// Fetch reference by ID
export const fetchReferenceById = async (resumeId: string, id: string): Promise<ReferenceDto> => {
  return apiGet<ReferenceDto>(`/resumes/${resumeId}/references/${id}`, {
  });
};

// Create new reference
export const createReference = async (resumeId: string, request: CreateReferenceRequest): Promise<ReferenceDto> => {
  return apiPost<ReferenceDto>(`/resumes/${resumeId}/references`, {
    body: JSON.stringify(request),
  });
};

// Update reference
export const updateReference = async (resumeId: string, id: string, request: UpdateReferenceRequest): Promise<void> => {
  await apiPut<void>(`/resumes/${resumeId}/references/${id}`, {
    body: JSON.stringify(request),
  });
};

// Delete reference
export const deleteReference = async (resumeId: string, id: string): Promise<void> => {
  await apiDelete<void>(`/resumes/${resumeId}/references/${id}`, {
  });
};
