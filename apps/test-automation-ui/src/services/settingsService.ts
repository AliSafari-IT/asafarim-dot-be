import { isProduction } from '@asafarim/shared-ui-react';

const API_BASE_URL = isProduction
  ? 'https://testora.asafarim.be/api'
  : 'http://testora.asafarim.local:5106/api';

// Environment types
export interface TestEnvironment {
  id: number;
  userId: string;
  name: string;
  baseUrl: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironmentDto {
  name: string;
  baseUrl: string;
  isDefault?: boolean;
}

export interface UpdateEnvironmentDto {
  name?: string;
  baseUrl?: string;
}

// Credential types
export interface UserCredential {
  id: number;
  name: string;
  type: 'ApiKey' | 'Token' | 'Password' | 'Certificate';
  value: string; // Masked value
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCredentialDto {
  name: string;
  type: 'ApiKey' | 'Token' | 'Password' | 'Certificate';
  value: string;
}

export interface UpdateCredentialDto {
  name?: string;
  type?: 'ApiKey' | 'Token' | 'Password' | 'Certificate';
  value?: string;
}

// Automation Settings types
export interface AutomationSettings {
  id: number;
  userId: string;
  defaultTimeout: number;
  maxRetries: number;
  parallelism: number;
  screenshotOnFailure: boolean;
  videoRecording: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAutomationSettingsDto {
  defaultTimeout: number;
  maxRetries: number;
  parallelism: number;
  screenshotOnFailure: boolean;
  videoRecording: boolean;
}

// Notification Settings types
export interface NotificationSettings {
  id: number;
  userId: string;
  emailOnSuccess: boolean;
  emailOnFailure: boolean;
  slackEnabled: boolean;
  slackWebhookUrl?: string;
  reportFormat: 'Html' | 'Pdf' | 'Json';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationSettingsDto {
  emailOnSuccess: boolean;
  emailOnFailure: boolean;
  slackEnabled: boolean;
  slackWebhookUrl?: string;
  reportFormat: 'Html' | 'Pdf' | 'Json';
}

class SettingsService {
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

  // Environments
  async getEnvironments(): Promise<TestEnvironment[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/settings/environments`);
    return response.json();
  }

  async createEnvironment(dto: CreateEnvironmentDto): Promise<TestEnvironment> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/settings/environments`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.json();
  }

  async updateEnvironment(id: number, dto: UpdateEnvironmentDto): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/settings/environments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async setDefaultEnvironment(id: number): Promise<{ message: string }> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/settings/environments/${id}/set-default`, {
      method: 'POST',
    });
    return response.json();
  }

  async deleteEnvironment(id: number): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/settings/environments/${id}`, {
      method: 'DELETE',
    });
  }

  // Credentials
  async getCredentials(): Promise<UserCredential[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/settings/credentials`);
    return response.json();
  }

  async createCredential(dto: CreateCredentialDto): Promise<UserCredential> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/settings/credentials`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.json();
  }

  async updateCredential(id: number, dto: UpdateCredentialDto): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/settings/credentials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async deleteCredential(id: number): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/settings/credentials/${id}`, {
      method: 'DELETE',
    });
  }

  // Automation Settings
  async getAutomationSettings(): Promise<AutomationSettings> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/settings/automation`);
    return response.json();
  }

  async updateAutomationSettings(dto: UpdateAutomationSettingsDto): Promise<AutomationSettings> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/settings/automation`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return response.json();
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/settings/notifications`);
    return response.json();
  }

  async updateNotificationSettings(dto: UpdateNotificationSettingsDto): Promise<NotificationSettings> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/settings/notifications`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return response.json();
  }
}

export const settingsService = new SettingsService();
