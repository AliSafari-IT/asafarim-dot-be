import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

export interface ResumeDto {
  id: string;
  userId: string;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  contact?: ContactInfoDto;
  isPublic?: boolean;
  publicSlug?: string;
  publishedAt?: string;
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
  technologies: { id: string; name: string; category?: string }[];
  achievements?: { id: string; text: string }[];
}

export interface ProjectDto {
  id: string;
  name: string;
  description: string;
  link: string;
  technologies: { id: string; name: string; category: string }[];
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

export interface PublicReferenceDto {
  name: string;
  position: string;
  company: string;
  relationship: string;
  // Note: Email and Phone excluded for privacy in public resumes
}

// Public Resume DTOs (GDPR-compliant, no sensitive data)
export interface PublicResumeDto {
  publicSlug: string;
  title: string;
  summary: string;
  publishedAt?: string;
  skills: PublicSkillDto[];
  workExperiences: PublicWorkExperienceDto[];
  educationItems: PublicEducationDto[];
  projects: PublicProjectDto[];
  certificates: PublicCertificateDto[];
  languages: PublicLanguageDto[];
  awards: PublicAwardDto[];
  socialLinks: PublicSocialLinkDto[];
  references: PublicReferenceDto[];
}

export interface PublicSkillDto {
  name: string;
  category: string;
  level: string;
  rating: number;
}

export interface PublicWorkExperienceDto {
  jobTitle: string;
  companyName: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements: string[];
  technologies: string[];
}

export interface PublicEducationDto {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface PublicProjectDto {
  name: string;
  description: string;
  link: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
}

export interface PublicCertificateDto {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl: string;
}

export interface PublicLanguageDto {
  name: string;
  level: string;
}

export interface PublicAwardDto {
  title: string;
  issuer: string;
  awardedDate: string;
  description: string;
}

export interface PublicSocialLinkDto {
  platform: string;
  url: string;
}

export interface PublishResumeRequest {
  generateSlug?: boolean;
  customSlug?: string;
}

export interface PublishResumeResponse {
  shareUrl: string;
  slug: string;
  publishedAt: string;
}

export interface CreateResumeRequest {
  title: string;
  summary?: string ;
  contact?: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
}

export interface UpdateResumeRequest {
  title: string;
  summary?: string;
  contact?: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
}

// Fetch all resumes
export const fetchResumes = async (myResumes: boolean = false): Promise<ResumeDto[]> => {
  const params = new URLSearchParams();
  if (myResumes) params.append('myResumes', 'true');
  
  const path = params.toString() ? `/resumes?${params}` : '/resumes';
  return apiGet<ResumeDto[]>(path, {
  });
};

// Fetch resume by ID (with all details)
export const fetchResumeById = async (id: string): Promise<ResumeDetailDto> => {
  return apiGet<ResumeDetailDto>(`/resumes/${id}`, {
  });
};

// Create new resume
export const createResume = async (request: CreateResumeRequest): Promise<ResumeDto> => {
  return apiPost<ResumeDto>('/resumes', {
    body: JSON.stringify(request),
  });
};

// Update resume
export const updateResume = async (id: string, request: UpdateResumeRequest): Promise<void> => {
  await apiPut<void>(`/resumes/${id}`, {
    body: JSON.stringify(request),
  });
};

// Delete resume
export const deleteResume = async (id: string): Promise<void> => {
  await apiDelete<void>(`/resumes/${id}`, {
  });
};

// Publish resume (GDPR-compliant)
export const publishResume = async (
  id: string,
  request: PublishResumeRequest
): Promise<PublishResumeResponse> => {
  return apiPost<PublishResumeResponse>(`/resumes/${id}/publish`, {
    body: JSON.stringify(request),
  });
};

// Unpublish resume
export const unpublishResume = async (id: string): Promise<void> => {
  await apiPost<void>(`/resumes/${id}/unpublish`, {
  });
};

// Fetch public resume by slug (no authentication required)
export const fetchPublicResumeBySlug = async (slug: string): Promise<PublicResumeDto> => {
  return apiGet<PublicResumeDto>(`/resumes/public/${slug}`);
};
