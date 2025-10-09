import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

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
  return apiGet<AwardDto[]>(`/resumes/${resumeId}/awards`, {
  });
};

// Fetch award by ID
export const fetchAwardById = async (resumeId: string, id: string): Promise<AwardDto> => {
  return apiGet<AwardDto>(`/resumes/${resumeId}/awards/${id}`, {
  });
};

// Create new award
export const createAward = async (resumeId: string, request: CreateAwardRequest): Promise<AwardDto> => {
  // Convert date to ISO format but keep only the date part
  const cleanedRequest = {
    ...request,
    date: request.date ? new Date(request.date + 'T00:00:00.000Z').toISOString() : request.date,
  };
  
  return apiPost<AwardDto>(`/resumes/${resumeId}/awards`, {
    body: JSON.stringify(cleanedRequest),
  });
};

// Update award
export const updateAward = async (resumeId: string, id: string, request: UpdateAwardRequest): Promise<void> => {
  // Convert date to ISO format but keep only the date part
  const cleanedRequest = {
    ...request,
    date: request.date ? new Date(request.date + 'T00:00:00.000Z').toISOString() : request.date,
  };
  
  await apiPut<void>(`/resumes/${resumeId}/awards/${id}`, {
    body: JSON.stringify(cleanedRequest),
  });
};

// Delete award
export const deleteAward = async (resumeId: string, id: string): Promise<void> => {
  await apiDelete<void>(`/resumes/${resumeId}/awards/${id}`, {
  });
};
