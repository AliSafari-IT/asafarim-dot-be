import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

export interface SocialLinkDto {
  id: string;
  platform: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSocialLinkRequest {
  platform: string;
  url: string;
}

export interface UpdateSocialLinkRequest {
  platform: string;
  url: string;
}

// Fetch all social links for a resume
export const fetchSocialLinks = async (resumeId: string): Promise<SocialLinkDto[]> => {
  return apiGet<SocialLinkDto[]>(`/resumes/${resumeId}/social-links`, {
  });
};

// Fetch social link by ID
export const fetchSocialLinkById = async (resumeId: string, id: string): Promise<SocialLinkDto> => {
  return apiGet<SocialLinkDto>(`/resumes/${resumeId}/social-links/${id}`, {
  });
};

// Create new social link
export const createSocialLink = async (resumeId: string, request: CreateSocialLinkRequest): Promise<SocialLinkDto> => {
  return apiPost<SocialLinkDto>(`/resumes/${resumeId}/social-links`, {
    body: JSON.stringify(request),
  });
};

// Update social link
export const updateSocialLink = async (resumeId: string, id: string, request: UpdateSocialLinkRequest): Promise<void> => {
  await apiPut<void>(`/resumes/${resumeId}/social-links/${id}`, {
    body: JSON.stringify(request),
  });
};

// Delete social link
export const deleteSocialLink = async (resumeId: string, id: string): Promise<void> => {
  await apiDelete<void>(`/resumes/${resumeId}/social-links/${id}`, {
  });
};
