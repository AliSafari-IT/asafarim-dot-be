// Portfolio API Response Types

export interface Technology {
  id: string;
  name: string;
  category: string;
}

export interface ProjectImage {
  id: string;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description?: string;
  slug: string;
  isFeatured: boolean;
  displayOrder: number;
  githubUrl?: string;
  demoUrl?: string;
  startDate?: string;
  endDate?: string;
  technologies: Technology[];
  images: ProjectImage[];
  publications: Publication[];
  workExperiences: WorkExperience[];
}

export interface Publication {
  id: number;
  title: string;
  authorId: string;
  journalName?: string;
  link?: string;
  createdAt: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  location?: string;
}

export interface ContactInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
}

export interface PortfolioSettings {
  publicSlug: string;
  isPublic: boolean;
  showContactInfo: boolean;
  showPublications: boolean;
  showWorkExperience: boolean;
  sectionOrder: string[];
  customCss?: string;
  metaDescription?: string;
}

export interface PublicPortfolio {
  username: string;
  displayName: string;
  headline?: string;
  bio?: string;
  profileImageUrl?: string;
  preferredLanguage: string;
  contact?: ContactInfo;
  projects: Project[];
  publications: Publication[];
  workExperiences: WorkExperience[];
  technologies: Technology[];
  settings: PortfolioSettings;
}

export interface CreateProjectDto {
  title: string;
  summary: string;
  description?: string;
  slug: string;
  isFeatured: boolean;
  displayOrder: number;
  githubUrl?: string;
  demoUrl?: string;
  startDate?: string;
  endDate?: string;
  technologyIds: string[];
  publicationIds: number[];
  workExperienceIds: string[];
  imageUrls?: string[];
}

export interface PortfolioState {
  portfolio: PublicPortfolio | null;
  loading: boolean;
  error: string | null;
  currentLanguage: string;
}
