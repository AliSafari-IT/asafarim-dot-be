import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

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
  return apiGet<EducationDto[]>(`/resumes/${resumeId}/educations`, {
  });
};

// Fetch education by ID
export const fetchEducationById = async (resumeId: string, id: string): Promise<EducationDto> => {
  return apiGet<EducationDto>(`/resumes/${resumeId}/educations/${id}`, {
  });
};

// Create new education
export const createEducation = async (resumeId: string, request: CreateEducationRequest): Promise<EducationDto> => {
  // Clean up the request - remove empty endDate
  const cleanedRequest = {
    ...request,
    endDate: request.endDate && request.endDate.trim() !== '' ? request.endDate : undefined,
  };
  
  return apiPost<EducationDto>(`/resumes/${resumeId}/educations`, {
    body: JSON.stringify(cleanedRequest),
  });
};

// Update education
export const updateEducation = async (resumeId: string, id: string, request: UpdateEducationRequest): Promise<void> => {
  // Clean up the request - remove empty endDate
  const cleanedRequest = {
    ...request,
    endDate: request.endDate && request.endDate.trim() !== '' ? request.endDate : undefined,
  };
  
  await apiPut<void>(`/resumes/${resumeId}/educations/${id}`, {
    body: JSON.stringify(cleanedRequest),
  });
};

// Delete education
export const deleteEducation = async (resumeId: string, id: string): Promise<void> => {
  await apiDelete<void>(`/resumes/${resumeId}/educations/${id}`, {
  });
};
