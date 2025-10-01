import { CORE_API_BASE, getCookie } from '../api/core';

export interface ResumeDto {
  id: string;
  userId: string;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  contact?: ContactInfoDto;
}

export interface ResumeDetailDto extends ResumeDto {
  skills: SkillDto[];
  educationItems: EducationDto[];
  certificates: CertificateDto[];
  workExperiences: WorkExperienceDto[];
  projects: ProjectDto[];
  socialLinks: SocialLinkDto[];
  languages: LanguageDto[];
  awards: AwardDto[];
  references: ReferenceDto[];
}

export interface ContactInfoDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
}

export interface SkillDto {
  id: string;
  name: string;
  category: string;
  level: string;
  rating: number;
}

export interface EducationDto {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface CertificateDto {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId: string;
  credentialUrl: string;
}

export interface WorkExperienceDto {
  id: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  technologies: string[];
}

export interface ProjectDto {
  id: string;
  name: string;
  description: string;
  link: string;
  technologies: string[];
}

export interface SocialLinkDto {
  id: string;
  platform: string;
  url: string;
}

export interface LanguageDto {
  id: string;
  name: string;
  level: string;
}

export interface AwardDto {
  id: string;
  title: string;
  issuer: string;
  awardedDate: string;
  description: string;
}

export interface ReferenceDto {
  id: string;
  name: string;
  relationship: string;
  contactInfo: string;
}

export interface CreateResumeRequest {
  title: string;
  summary: string;
  contact?: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
}

export interface UpdateResumeRequest {
  title: string;
  summary: string;
  contact?: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
}

// Fetch all resumes
export const fetchResumes = async (myResumes: boolean = false): Promise<ResumeDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  const params = new URLSearchParams();
  if (myResumes) params.append('myResumes', 'true');
  
  const response = await fetch(`${CORE_API_BASE}/resumes?${params}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch resumes');
  return response.json();
};

// Fetch resume by ID (with all details)
export const fetchResumeById = async (id: string): Promise<ResumeDetailDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch resume');
  return response.json();
};

// Create new resume
export const createResume = async (request: CreateResumeRequest): Promise<ResumeDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) throw new Error('Failed to create resume');
  return response.json();
};

// Update resume
export const updateResume = async (id: string, request: UpdateResumeRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) throw new Error('Failed to update resume');
};

// Delete resume
export const deleteResume = async (id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  
  const response = await fetch(`${CORE_API_BASE}/resumes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete resume');
};
