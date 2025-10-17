import type { 
  PublicPortfolio, 
  CreateProjectDto, 
  PortfolioSettings, 
  Project,
  ProjectResumeLink,
  PublicationResumeLink,
  PortfolioInsights,
  ActivityLog,
  ResumeMetadata,
  LinkVersion,
  ResumeSuggestion
} from '../types/portfolio.types';
import { isProduction } from '@asafarim/shared-ui-react';

// Use correct API base URL - backend endpoints are under /api, not /api/core
const API_BASE_URL = isProduction ? 'https://core.asafarim.be/api' : 'http://core.asafarim.local:5102/api';

class PortfolioService {
  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Use cookies for authentication (atk cookie)
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        // Check if we're getting HTML instead of JSON (redirect page)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          // Clear any stale auth state and redirect to login
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
          throw new Error('Authentication required. Redirecting to login...');
        }
      }
      
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Check if response is actually JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      // If we got HTML instead of JSON, user is likely not authenticated
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        throw new Error('Authentication required. Redirecting to login...');
      }
      throw new Error(`Expected JSON response but got: ${contentType}`);
    }

    return response.json();
  }

  // Public endpoints (no auth required)
  async getPublicPortfolio(slug: string): Promise<PublicPortfolio> {
    return this.fetchWithAuth<PublicPortfolio>(`${API_BASE_URL}/portfolio/${slug}`);
  }

  async checkSlugAvailability(slug: string): Promise<boolean> {
    return this.fetchWithAuth<boolean>(`${API_BASE_URL}/portfolio/slug-available/${slug}`);
  }

  // Private endpoints (auth required)
  async getMyPortfolio(): Promise<PublicPortfolio> {
    return this.fetchWithAuth<PublicPortfolio>(`${API_BASE_URL}/portfolio`);
  }

  async getSettings(): Promise<PortfolioSettings> {
    return this.fetchWithAuth<PortfolioSettings>(`${API_BASE_URL}/portfolio/settings`);
  }

  async updateSettings(settings: Partial<PortfolioSettings>): Promise<PortfolioSettings> {
    return this.fetchWithAuth<PortfolioSettings>(`${API_BASE_URL}/portfolio/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getProjects(): Promise<Project[]> {
    return this.fetchWithAuth<Project[]>(`${API_BASE_URL}/portfolio/projects`);
  }

  async getProject(id: string): Promise<Project> {
    return this.fetchWithAuth<Project>(`${API_BASE_URL}/portfolio/projects/${id}`);
  }

  async createProject(project: CreateProjectDto): Promise<Project> {
    return this.fetchWithAuth<Project>(`${API_BASE_URL}/portfolio/projects`, {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Partial<CreateProjectDto>): Promise<Project> {
    return this.fetchWithAuth<Project>(`${API_BASE_URL}/portfolio/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.fetchWithAuth<void>(`${API_BASE_URL}/portfolio/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Resume Linking Methods
  async linkProjectToResumes(projectId: string, workExperienceIds: string[]): Promise<ProjectResumeLink[]> {
    return this.fetchWithAuth<ProjectResumeLink[]>(`${API_BASE_URL}/portfolio/projects/${projectId}/link-resumes`, {
      method: 'POST',
      body: JSON.stringify({ workExperienceIds }),
    });
  }

  async unlinkProjectFromResume(projectId: string, workExperienceId: string): Promise<void> {
    await this.fetchWithAuth<void>(`${API_BASE_URL}/portfolio/projects/${projectId}/resumes/${workExperienceId}`, {
      method: 'DELETE',
    });
  }

  async getProjectResumeLinks(projectId: string): Promise<ProjectResumeLink[]> {
    return this.fetchWithAuth<ProjectResumeLink[]>(`${API_BASE_URL}/portfolio/projects/${projectId}/resumes`);
  }

  async linkPublicationToResumes(publicationId: string, resumeIds: string[]): Promise<PublicationResumeLink[]> {
    return this.fetchWithAuth<PublicationResumeLink[]>(`${API_BASE_URL}/portfolio/publications/${publicationId}/link-resumes`, {
      method: 'POST',
      body: JSON.stringify({ resumeIds }),
    });
  }

  async getPublicationResumeLinks(publicationId: string): Promise<PublicationResumeLink[]> {
    return this.fetchWithAuth<PublicationResumeLink[]>(`${API_BASE_URL}/portfolio/publications/${publicationId}/resumes`);
  }

  // Analytics & Insights
  async getPortfolioInsights(): Promise<PortfolioInsights> {
    return this.fetchWithAuth<PortfolioInsights>(`${API_BASE_URL}/portfolio/insights`);
  }

  // Activity Tracking
  async getActivityLogs(limit?: number): Promise<ActivityLog[]> {
    const url = limit 
      ? `${API_BASE_URL}/portfolio/activity?limit=${limit}`
      : `${API_BASE_URL}/portfolio/activity`;
    return this.fetchWithAuth<ActivityLog[]>(url);
  }

  async logActivity(action: string, entityType: string, entityId: string, entityName: string, details?: string): Promise<ActivityLog> {
    return this.fetchWithAuth<ActivityLog>(`${API_BASE_URL}/portfolio/activity`, {
      method: 'POST',
      body: JSON.stringify({ action, entityType, entityId, entityName, details }),
    });
  }

  // Resume Management
  async getUserResumes(): Promise<ResumeMetadata[]> {
    return this.fetchWithAuth<ResumeMetadata[]>(`${API_BASE_URL}/resumes/metadata`);
  }

  async getResumeWorkExperiences(resumeId: string): Promise<ResumeMetadata> {
    return this.fetchWithAuth<ResumeMetadata>(`${API_BASE_URL}/resumes/${resumeId}/work-experiences`);
  }

  // Version History
  async getLinkVersionHistory(projectId: string): Promise<LinkVersion[]> {
    return this.fetchWithAuth<LinkVersion[]>(`${API_BASE_URL}/portfolio/projects/${projectId}/link-history`);
  }

  async revertToLinkVersion(projectId: string, versionId: string): Promise<ProjectResumeLink[]> {
    return this.fetchWithAuth<ProjectResumeLink[]>(`${API_BASE_URL}/portfolio/projects/${projectId}/link-history/${versionId}/revert`, {
      method: 'POST',
    });
  }

  // AI Suggestions (Optional - may need backend implementation)
  async getResumeSuggestions(projectId: string): Promise<ResumeSuggestion[]> {
    return this.fetchWithAuth<ResumeSuggestion[]>(`${API_BASE_URL}/portfolio/projects/${projectId}/suggest-resumes`);
  }

  // Bulk Operations
  async bulkLinkProjects(links: { projectId: string; workExperienceIds: string[] }[]): Promise<void> {
    await this.fetchWithAuth<void>(`${API_BASE_URL}/portfolio/projects/bulk-link`, {
      method: 'POST',
      body: JSON.stringify({ links }),
    });
  }

  async bulkUnlinkProjects(projectIds: string[]): Promise<void> {
    await this.fetchWithAuth<void>(`${API_BASE_URL}/portfolio/projects/bulk-unlink`, {
      method: 'POST',
      body: JSON.stringify({ projectIds }),
    });
  }
}

export const portfolioService = new PortfolioService();
