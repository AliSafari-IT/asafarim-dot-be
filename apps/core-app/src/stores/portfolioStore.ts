import { create } from 'zustand';
import type { 
  PublicPortfolio, 
  PortfolioSettings, 
  CreateProjectDto,
  ProjectResumeLink,
  PublicationResumeLink,
  PortfolioInsights,
  ActivityLog,
  ResumeMetadata,
  LinkVersion
} from '../types/portfolio.types';
import { portfolioService } from '../services/portfolioService';

interface PortfolioStore {
  // State
  portfolio: PublicPortfolio | null;
  loading: boolean;
  error: string | null;
  currentLanguage: string;
  
  // Enhanced state
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
  activityLoading: boolean;

  // Actions
  fetchPublicPortfolio: (slug: string) => Promise<void>;
  fetchMyPortfolio: () => Promise<void>;
  updateSettings: (settings: Partial<PortfolioSettings>) => Promise<void>;
  createProject: (project: CreateProjectDto) => Promise<void>;
  updateProject: (id: string, project: Partial<CreateProjectDto>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setLanguage: (lang: string) => void;
  clearError: () => void;
  reset: () => void;
  
  // Resume linking actions
  linkProjectToResumes: (projectId: string, workExperienceIds: string[]) => Promise<void>;
  unlinkProjectFromResume: (projectId: string, workExperienceId: string) => Promise<void>;
  fetchProjectResumeLinks: (projectId: string) => Promise<void>;
  linkPublicationToResumes: (publicationId: string, resumeIds: string[]) => Promise<void>;
  fetchPublicationResumeLinks: (publicationId: string) => Promise<void>;
  
  // Analytics actions
  fetchInsights: () => Promise<void>;
  
  // Activity tracking actions
  fetchActivityLogs: (limit?: number) => Promise<void>;
  logActivity: (action: string, entityType: string, entityId: string, entityName: string, details?: string) => Promise<void>;
  
  // Resume management actions
  fetchUserResumes: () => Promise<void>;
  
  // Version history actions
  fetchLinkVersionHistory: (projectId: string) => Promise<void>;
  revertToLinkVersion: (projectId: string, versionId: string) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioStore>((set: any, get: any) => ({
  // Initial state
  portfolio: null,
  loading: false,
  error: null,
  currentLanguage: 'en',
  
  // Enhanced state
  linkedProjects: [],
  linkedPublications: [],
  insights: null,
  activityLogs: [],
  availableResumes: [],
  linkVersions: [],
  
  // Loading states
  insightsLoading: false,
  linksLoading: false,
  resumesLoading: false,
  activityLoading: false,

  // Fetch public portfolio by slug
  fetchPublicPortfolio: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const portfolio = await portfolioService.getPublicPortfolio(slug);
      set({ 
        portfolio, 
        loading: false,
        currentLanguage: portfolio.preferredLanguage || 'en'
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load portfolio',
        loading: false 
      });
    }
  },

  // Fetch authenticated user's portfolio
  fetchMyPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const portfolio = await portfolioService.getMyPortfolio();
      set({ 
        portfolio, 
        loading: false,
        currentLanguage: portfolio.preferredLanguage || 'en'
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load portfolio',
        loading: false 
      });
    }
  },

  // Update portfolio settings
  updateSettings: async (settings: Partial<PortfolioSettings>) => {
    set({ loading: true, error: null });
    try {
      const updatedSettings = await portfolioService.updateSettings(settings);
      const currentPortfolio = get().portfolio;
      
      if (currentPortfolio) {
        set({ 
          portfolio: { ...currentPortfolio, settings: updatedSettings },
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update settings',
        loading: false 
      });
    }
  },

  // Create new project
  createProject: async (project: CreateProjectDto) => {
    set({ loading: true, error: null });
    try {
      const newProject = await portfolioService.createProject(project);
      const currentPortfolio = get().portfolio;
      
      if (currentPortfolio) {
        set({ 
          portfolio: {
            ...currentPortfolio,
            projects: [...currentPortfolio.projects, newProject]
          },
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create project',
        loading: false 
      });
      throw error;
    }
  },

  // Update existing project
  updateProject: async (id: string, project: Partial<CreateProjectDto>) => {
    set({ loading: true, error: null });
    try {
      const updatedProject = await portfolioService.updateProject(id, project);
      const currentPortfolio = get().portfolio;
      
      if (currentPortfolio) {
        set({ 
          portfolio: {
            ...currentPortfolio,
            projects: currentPortfolio.projects.map((p: { id: string; }) => 
              p.id === id ? updatedProject : p
            )
          },
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update project',
        loading: false 
      });
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await portfolioService.deleteProject(id);
      const currentPortfolio = get().portfolio;
      
      if (currentPortfolio) {
        set({ 
          portfolio: {
            ...currentPortfolio,
            projects: currentPortfolio.projects.filter((p: { id: string; }) => p.id !== id)
          },
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete project',
        loading: false 
      });
      throw error;
    }
  },

  // Set current language
  setLanguage: (lang: string) => {
    set({ currentLanguage: lang });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Resume linking actions
  linkProjectToResumes: async (projectId: string, workExperienceIds: string[]) => {
    set({ linksLoading: true, error: null });
    try {
      const links = await portfolioService.linkProjectToResumes(projectId, workExperienceIds);
      const currentLinks = get().linkedProjects;
      const otherLinks = currentLinks.filter((link: ProjectResumeLink) => link.projectId !== projectId);
      set({ 
        linkedProjects: [...otherLinks, ...links],
        linksLoading: false 
      });
      
      // Log activity
      await get().logActivity('linked', 'project', projectId, 'Project', `Linked to ${workExperienceIds.length} resume(s)`);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to link project to resumes',
        linksLoading: false 
      });
      throw error;
    }
  },

  unlinkProjectFromResume: async (projectId: string, workExperienceId: string) => {
    set({ linksLoading: true, error: null });
    try {
      await portfolioService.unlinkProjectFromResume(projectId, workExperienceId);
      const currentLinks = get().linkedProjects;
      set({ 
        linkedProjects: currentLinks.filter((link: ProjectResumeLink) => 
          !(link.projectId === projectId && link.workExperienceId === workExperienceId)
        ),
        linksLoading: false 
      });
      
      // Log activity
      await get().logActivity('unlinked', 'project', projectId, 'Project', 'Unlinked from resume');
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to unlink project from resume',
        linksLoading: false 
      });
      throw error;
    }
  },

  fetchProjectResumeLinks: async (projectId: string) => {
    set({ linksLoading: true, error: null });
    try {
      const links = await portfolioService.getProjectResumeLinks(projectId);
      const currentLinks = get().linkedProjects;
      const otherLinks = currentLinks.filter((link: ProjectResumeLink) => link.projectId !== projectId);
      set({ 
        linkedProjects: [...otherLinks, ...links],
        linksLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch project resume links',
        linksLoading: false 
      });
    }
  },

  linkPublicationToResumes: async (publicationId: string, resumeIds: string[]) => {
    set({ linksLoading: true, error: null });
    try {
      const links = await portfolioService.linkPublicationToResumes(publicationId, resumeIds);
      const currentLinks = get().linkedPublications;
      const otherLinks = currentLinks.filter((link: PublicationResumeLink) => link.publicationId !== publicationId);
      set({ 
        linkedPublications: [...otherLinks, ...links],
        linksLoading: false 
      });
      
      // Log activity
      await get().logActivity('linked', 'publication', publicationId, 'Publication', `Linked to ${resumeIds.length} resume(s)`);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to link publication to resumes',
        linksLoading: false 
      });
      throw error;
    }
  },

  fetchPublicationResumeLinks: async (publicationId: string) => {
    set({ linksLoading: true, error: null });
    try {
      const links = await portfolioService.getPublicationResumeLinks(publicationId);
      const currentLinks = get().linkedPublications;
      const otherLinks = currentLinks.filter((link: PublicationResumeLink) => link.publicationId !== publicationId);
      set({ 
        linkedPublications: [...otherLinks, ...links],
        linksLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch publication resume links',
        linksLoading: false 
      });
    }
  },

  // Analytics actions
  fetchInsights: async () => {
    set({ insightsLoading: true, error: null });
    try {
      const insights = await portfolioService.getPortfolioInsights();
      set({ insights, insightsLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch insights',
        insightsLoading: false 
      });
    }
  },

  // Activity tracking actions
  fetchActivityLogs: async (limit?: number) => {
    set({ activityLoading: true, error: null });
    try {
      const activityLogs = await portfolioService.getActivityLogs(limit);
      set({ activityLogs, activityLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch activity logs',
        activityLoading: false 
      });
    }
  },

  logActivity: async (action: string, entityType: string, entityId: string, entityName: string, details?: string) => {
    try {
      const activity = await portfolioService.logActivity(action, entityType, entityId, entityName, details);
      const currentLogs = get().activityLogs;
      set({ activityLogs: [activity, ...currentLogs] });
    } catch (error) {
      // Silent fail for activity logging
      console.error('Failed to log activity:', error);
    }
  },

  // Resume management actions
  fetchUserResumes: async () => {
    set({ resumesLoading: true, error: null });
    try {
      const availableResumes = await portfolioService.getUserResumes();
      set({ availableResumes, resumesLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user resumes',
        resumesLoading: false 
      });
    }
  },

  // Version history actions
  fetchLinkVersionHistory: async (projectId: string) => {
    set({ loading: true, error: null });
    try {
      const linkVersions = await portfolioService.getLinkVersionHistory(projectId);
      set({ linkVersions, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch link version history',
        loading: false 
      });
    }
  },

  revertToLinkVersion: async (projectId: string, versionId: string) => {
    set({ linksLoading: true, error: null });
    try {
      const links = await portfolioService.revertToLinkVersion(projectId, versionId);
      const currentLinks = get().linkedProjects;
      const otherLinks = currentLinks.filter((link: ProjectResumeLink) => link.projectId !== projectId);
      set({ 
        linkedProjects: [...otherLinks, ...links],
        linksLoading: false 
      });
      
      // Log activity
      await get().logActivity('updated', 'link', projectId, 'Project Links', 'Reverted to previous version');
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to revert to link version',
        linksLoading: false 
      });
      throw error;
    }
  },

  // Reset store
  reset: () => {
    set({
      portfolio: null,
      loading: false,
      error: null,
      currentLanguage: 'en',
      linkedProjects: [],
      linkedPublications: [],
      insights: null,
      activityLogs: [],
      availableResumes: [],
      linkVersions: [],
      insightsLoading: false,
      linksLoading: false,
      resumesLoading: false,
      activityLoading: false
    });
  }
}));
