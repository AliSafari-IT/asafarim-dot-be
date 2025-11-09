import { isProduction } from '@asafarim/shared-ui-react';

const API_BASE_URL = isProduction
  ? 'https://testora.asafarim.be/api'
  : 'http://testora.asafarim.local:5106/api';

export interface Integration {
  id: number;
  type: 'CiCd' | 'IssueTracker' | 'Notification' | 'Api';
  name: string;
  description?: string;
  status: 'Connected' | 'Disconnected';
  lastSync?: string;
  hasCredentials: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationStats {
  total: number;
  active: number;
  inactive: number;
  byType: Array<{ type: string; count: number }>;
}

export interface CreateIntegrationDto {
  type: 'CiCd' | 'IssueTracker' | 'Notification' | 'Api';
  name: string;
  description?: string;
  settings?: string; // JSON string
}

export interface UpdateIntegrationDto {
  name?: string;
  description?: string;
  settings?: string; // JSON string
}

export interface ConnectIntegrationDto {
  credentials?: string; // JSON string
}

class IntegrationsService {
  private async getAuthToken(): Promise<string | null> {
    // Get token from localStorage
    return localStorage.getItem('auth_token');
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async getIntegrations(type?: string): Promise<Integration[]> {
    const url = type
      ? `${API_BASE_URL}/integrations?type=${type}`
      : `${API_BASE_URL}/integrations`;
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getIntegration(id: number): Promise<Integration> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/integrations/${id}`);
    return response.json();
  }

  async createIntegration(dto: CreateIntegrationDto): Promise<Integration> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/integrations`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.json();
  }

  async updateIntegration(id: number, dto: UpdateIntegrationDto): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async connectIntegration(id: number, dto: ConnectIntegrationDto): Promise<{ message: string; lastSync: string }> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/integrations/${id}/connect`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.json();
  }

  async disconnectIntegration(id: number): Promise<{ message: string }> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/integrations/${id}/disconnect`, {
      method: 'POST',
    });
    return response.json();
  }

  async deleteIntegration(id: number): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/integrations/${id}`, {
      method: 'DELETE',
    });
  }

  async getStats(): Promise<IntegrationStats> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/integrations/stats`);
    return response.json();
  }
}

export const integrationsService = new IntegrationsService();
