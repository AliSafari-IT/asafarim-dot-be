import { CORE_API_BASE, getCookie } from '../api/core';

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
  const token = getCookie('atk') || localStorage.getItem('auth_token');

  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/social-links`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) throw new Error('Failed to fetch social links');
  return response.json();
};

// Fetch social link by ID
export const fetchSocialLinkById = async (resumeId: string, id: string): Promise<SocialLinkDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');

  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/social-links/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) throw new Error('Failed to fetch social link');
  return response.json();
};

// Create new social link
export const createSocialLink = async (resumeId: string, request: CreateSocialLinkRequest): Promise<SocialLinkDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');

  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/social-links`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error('Failed to create social link');
  return response.json();
};

// Update social link
export const updateSocialLink = async (resumeId: string, id: string, request: UpdateSocialLinkRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');

  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/social-links/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error('Failed to update social link');
};

// Delete social link
export const deleteSocialLink = async (resumeId: string, id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');

  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/social-links/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) throw new Error('Failed to delete social link');
};
