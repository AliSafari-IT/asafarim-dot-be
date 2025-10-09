import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

export interface LanguageDto {
  id: string;
  name: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLanguageRequest {
  name: string;
  level: string;
}

export interface UpdateLanguageRequest {
  name: string;
  level: string;
}

// Fetch all languages for a resume
export const fetchLanguages = async (resumeId: string): Promise<LanguageDto[]> => {
  return apiGet<LanguageDto[]>(`/resumes/${resumeId}/languages`, {
  });
};

// Fetch language by ID
export const fetchLanguageById = async (resumeId: string, id: string): Promise<LanguageDto> => {
  return apiGet<LanguageDto>(`/resumes/${resumeId}/languages/${id}`, {
  });
};

// Create new language
export const createLanguage = async (resumeId: string, request: CreateLanguageRequest): Promise<LanguageDto> => {
  return apiPost<LanguageDto>(`/resumes/${resumeId}/languages`, {
    body: JSON.stringify(request),
  });
};

// Update language
export const updateLanguage = async (resumeId: string, id: string, request: UpdateLanguageRequest): Promise<void> => {
  await apiPut<void>(`/resumes/${resumeId}/languages/${id}`, {
    body: JSON.stringify(request),
  });
};

// Delete language
export const deleteLanguage = async (resumeId: string, id: string): Promise<void> => {
  await apiDelete<void>(`/resumes/${resumeId}/languages/${id}`, {
  });
};
