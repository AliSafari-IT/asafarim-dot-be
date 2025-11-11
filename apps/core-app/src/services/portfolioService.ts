import type { PublicPortfolio, CreateProjectDto, PortfolioSettings, Project } from '../types/portfolio.types';

// Determine API base URL based on environment
const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_CORE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/core$/, '');
  }
  
  // Development fallback
  if (typeof window !== 'undefined' && window.location.hostname.includes('asafarim.local')) {
    return 'http://core.asafarim.local:5102/api';
  }
  
  // Production fallback
  return 'https://core.asafarim.be/api';
})();

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
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
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
}

export const portfolioService = new PortfolioService();
