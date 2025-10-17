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

// Resume Linking Types
export interface ProjectResumeLink {
  projectId: string;
  resumeId: string;
  workExperienceId?: string;
  resumeTitle: string;
  workExperienceTitle?: string;
  linkedAt: string;
}

export interface PublicationResumeLink {
  publicationId: string;
  resumeId: string;
  resumeTitle: string;
  linkedAt: string;
}

// Portfolio Analytics & Insights
export interface PortfolioInsights {
  totalProjects: number;
  linkedToResumes: number;
  unlinked: number;
  totalPublications: number;
  totalTechnologies: number;
  lastUpdated: string;
  linkingRate: number; // Percentage of projects linked to resumes
  mostUsedTechnologies: TechnologyUsage[];
}

export interface TechnologyUsage {
  technologyId: string;
  technologyName: string;
  count: number;
  category: string;
}

// Activity Tracking
export interface ActivityLog {
  id: string;
  userId: string;
  action: ActivityAction;
  entityType: 'project' | 'publication' | 'resume' | 'link';
  entityId: string;
  entityName: string;
  details?: string;
  timestamp: string;
}

export type ActivityAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'linked' 
  | 'unlinked' 
  | 'published' 
  | 'unpublished';

// Resume Metadata
export interface ResumeMetadata {
  id: string;
  title: string;
  userId: string;
  type: 'academic' | 'professional' | 'freelance' | 'general';
  isPublic: boolean;
  publicSlug?: string;
  workExperiences: WorkExperienceMetadata[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperienceMetadata {
  id: string;
  resumeId: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

// Version History
export interface LinkVersion {
  id: string;
  projectId: string;
  resumeLinks: ProjectResumeLink[];
  changedBy: string;
  changedAt: string;
  changeType: 'added' | 'removed' | 'modified';
}

// AI Suggestions
export interface ResumeSuggestion {
  resumeId: string;
  resumeTitle: string;
  workExperienceId?: string;
  workExperienceTitle?: string;
  confidence: number; // 0-1
  reason: string;
  matchedKeywords: string[];
}

// Enhanced Portfolio State
export interface EnhancedPortfolioState extends PortfolioState {
  linkedProjects: ProjectResumeLink[];
  linkedPublications: PublicationResumeLink[];
  insights: PortfolioInsights | null;
  activityLogs: ActivityLog[];
  availableResumes: ResumeMetadata[];
  linkVersions: LinkVersion[];
  
  // Loading states
  insightsLoading: boolean;
  linksLoading: boolean;
  resumesLoading: boolean;
}

// Component Props Types
export interface ResumeSelectorProps {
  selectedResumes: ProjectResumeLink[];
  onSelectionChange: (links: ProjectResumeLink[]) => void;
  userResumes: ResumeMetadata[];
  projectId?: string;
  disabled?: boolean;
}

export interface ResumeLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (links: ProjectResumeLink[]) => Promise<void>;
  project: Project;
  currentLinks: ProjectResumeLink[];
  availableResumes: ResumeMetadata[];
}

export interface WorkExperienceSelectorProps {
  projectId: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  availableWorkExperiences: WorkExperienceMetadata[];
  resumeId?: string;
}

export interface AnalyticsWidgetProps {
  insights: PortfolioInsights;
  loading?: boolean;
}

export interface ActivityTimelineProps {
  activities: ActivityLog[];
  loading?: boolean;
  limit?: number;
}

export interface AIResumeSuggestionsProps {
  project: Project;
  userResumes: ResumeMetadata[];
  onAcceptSuggestion: (suggestion: ResumeSuggestion) => void;
}
