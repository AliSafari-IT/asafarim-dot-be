import { CORE_API_BASE, getCookie } from '../api/core';

export interface CertificateDto {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificateRequest {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface UpdateCertificateRequest {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

// Fetch all certificates for a resume
export const fetchCertificates = async (resumeId: string): Promise<CertificateDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/certificates`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch certificates');
  return response.json();
};

// Fetch certificate by ID
export const fetchCertificateById = async (resumeId: string, id: string): Promise<CertificateDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/certificates/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch certificate');
  return response.json();
};

// Create new certificate
export const createCertificate = async (resumeId: string, request: CreateCertificateRequest): Promise<CertificateDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  // Convert dates to ISO format
  const cleanedRequest = {
    ...request,
    issueDate: new Date(request.issueDate).toISOString(),
    expiryDate: request.expiryDate && request.expiryDate.trim() !== '' 
      ? new Date(request.expiryDate).toISOString() 
      : undefined,
  };
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/certificates`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(cleanedRequest),
  });
  
  if (!response.ok) throw new Error('Failed to create certificate');
  return response.json();
};

// Update certificate
export const updateCertificate = async (resumeId: string, id: string, request: UpdateCertificateRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  // Convert dates to ISO format
  const cleanedRequest = {
    ...request,
    issueDate: new Date(request.issueDate).toISOString(),
    expiryDate: request.expiryDate && request.expiryDate.trim() !== '' 
      ? new Date(request.expiryDate).toISOString() 
      : undefined,
  };
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/certificates/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(cleanedRequest),
  });
  
  if (!response.ok) throw new Error('Failed to update certificate');
};

// Delete certificate
export const deleteCertificate = async (resumeId: string, id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/certificates/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete certificate');
};
