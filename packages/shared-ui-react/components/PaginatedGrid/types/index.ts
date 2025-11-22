import { Theme, ProjectCardProps } from '../../ProjectCard/types';

export type Project = ProjectCardProps & {
  // add any additional properties here
  projectId?: string;
}

export type PaginatedProjectGridProps = {
  projects: Project[];
  cardsPerPage?: number;
  currentTheme?: Theme;
  className?: string;
  onProjectClick?: (project: Project) => void;
  showTechStackIcons?: boolean;
  maxDescriptionLength?: number;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  noResultsMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
  searchFields?: ('title' | 'description' | 'techStacks' | 'tags' | 'category')[];
  responsive?: {
    mobile: number; // 1 column
    tablet: number; // 2 columns
    desktop: number; // 3 columns
    largeDesktop: number; // 4 columns
    extraLargeDesktop: number; // 5 columns
  };
  showLoadMore?: boolean;
  loadMoreText?: string;
  animationDuration?: number;
}
