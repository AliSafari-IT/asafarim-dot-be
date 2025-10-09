import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

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
  return apiGet<CertificateDto[]>(`/resumes/${resumeId}/certificates`, {
  });
};

// Fetch certificate by ID
export const fetchCertificateById = async (resumeId: string, id: string): Promise<CertificateDto> => {
  return apiGet<CertificateDto>(`/resumes/${resumeId}/certificates/${id}`, {
  });
};

// Create new certificate
export const createCertificate = async (resumeId: string, request: CreateCertificateRequest): Promise<CertificateDto> => {
  // Convert dates to ISO format
  const cleanedRequest = {
    ...request,
    issueDate: new Date(request.issueDate).toISOString(),
    expiryDate: request.expiryDate && request.expiryDate.trim() !== '' 
      ? new Date(request.expiryDate).toISOString() 
      : undefined,
  };
  
  return apiPost<CertificateDto>(`/resumes/${resumeId}/certificates`, {
    body: JSON.stringify(cleanedRequest),
  });
};

// Update certificate
export const updateCertificate = async (resumeId: string, id: string, request: UpdateCertificateRequest): Promise<void> => {
  // Convert dates to ISO format
  const cleanedRequest = {
    ...request,
    issueDate: new Date(request.issueDate).toISOString(),
    expiryDate: request.expiryDate && request.expiryDate.trim() !== '' 
      ? new Date(request.expiryDate).toISOString() 
      : undefined,
  };
  
  await apiPut<void>(`/resumes/${resumeId}/certificates/${id}`, {
    body: JSON.stringify(cleanedRequest),
  });
};

// Delete certificate
export const deleteCertificate = async (resumeId: string, id: string): Promise<void> => {
  await apiDelete<void>(`/resumes/${resumeId}/certificates/${id}`, {
  });
};
