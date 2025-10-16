import { create } from 'zustand';
import type { PublicPortfolio, PortfolioSettings, CreateProjectDto } from '../types/portfolio.types';
import { portfolioService } from '../services/portfolioService';

interface PortfolioStore {
  // State
  portfolio: PublicPortfolio | null;
  loading: boolean;
  error: string | null;
  currentLanguage: string;

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
}

export const usePortfolioStore = create<PortfolioStore>((set: any, get: any) => ({
  // Initial state
  portfolio: null,
  loading: false,
  error: null,
  currentLanguage: 'en',

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

  // Reset store
  reset: () => {
    set({
      portfolio: null,
      loading: false,
      error: null,
      currentLanguage: 'en'
    });
  }
}));
