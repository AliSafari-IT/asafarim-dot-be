import type { ReactNode } from "react";

export interface TechStackItem {
  name: string;
  color?: string;
  icon?: string | ReactNode;
}

export interface ProjectLink {
  label: string;
  type?: 'demo' | 'repo' | 'documentation' | 'custom';
  url?: string;
  icon?: string | ReactNode;
  target?: '_blank' | '_self' | '_parent' | '_top';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

// RelatedProjects
export interface RelatedProject {
  title: string;
  image?: string | ProjectImage;
  description?: string;
  repo?: ProjectLink;
  link?: ProjectLink;
}

export type ProjectStatus = 'active' | 'draft' | 'archived' | 'completed' | 'in-progress' | 'coming-soon' | 'planning' ;

export type Theme = 'light' | 'dark' | 'auto';

export interface ProjectImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProjectTag {
  name: string;
  onClick?: () => void;
  navigateTo?: string;
}

export interface ProjectBudget {
  amount: number;
  currencySymbol?: string;
  currencyCode?: string;
  roundingIncrement?: number;
  currencyFormatOptions?: Intl.NumberFormatOptions;
}

export type ProjectCategory = 'web' | 'mobile' | 'desktop' | 'backend' | 'frontend' | 'fullstack' | 'database' | 'devops' | 'design' | 'marketing' | 'seo' | 'social' | 'content' | 'analytics' | 'security' | 'testing' | 'other';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';

export interface ProjectCardProps {
  // Core properties
  title: string;
  description: string;
  image?: string | ProjectImage;
  techStacks?: TechStackItem[];
  links: ProjectLink[];
  repo?:ProjectLink;
  
  // Theming and appearance
  currentTheme?: Theme;
  className?: string;
  showTechStackIcons?: boolean;
  maxDescriptionLength?: number;
  isFeatured?: boolean;
  
  // Behavior
  onCardClick?: () => void;
  isLoading?: boolean;
  
  // Status and metadata
  status?: ProjectStatus;
  lastUpdated?: string;
  
  // Additional properties from your DB model
  priority?: ProjectPriority;
  category?: ProjectCategory;
  progress?: number;
  tags?: ProjectTag[];
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  budget?: number | ProjectBudget;
  isPublic?: boolean;
  relatedProjects?: RelatedProject[];
  achievements?:string [];
  
  // Database specific
  id?: string;
  userId?: string;
}