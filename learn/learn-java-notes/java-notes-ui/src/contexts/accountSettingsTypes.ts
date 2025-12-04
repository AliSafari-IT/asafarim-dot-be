/**
 * Account Settings Types
 * Defines all types and interfaces for account management
 */

export interface AccountPreferences {
  theme: 'system' | 'light' | 'dark';
  language: 'en' | 'nl' | 'de' | 'fr';
  emailNotifications: boolean;
  defaultEditor: 'markdown' | 'rich' | 'code';
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface AccountActivity {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'email_change' | 'profile_update';
  description: string;
  timestamp: string;
  ipAddress?: string;
  deviceName?: string;
}

export interface UpdateProfileRequest {
  displayName: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePreferencesRequest {
  theme?: 'system' | 'light' | 'dark';
  language?: 'en' | 'nl' | 'de' | 'fr';
  emailNotifications?: boolean;
  defaultEditor?: 'markdown' | 'rich' | 'code';
}

export interface ExportDataResponse {
  downloadUrl: string;
  expiresAt: string;
}

export interface AccountSettingsState {
  preferences: AccountPreferences | null;
  activeSessions: ActiveSession[];
  accountActivity: AccountActivity[];
  isLoading: boolean;
  error: string | null;
}
