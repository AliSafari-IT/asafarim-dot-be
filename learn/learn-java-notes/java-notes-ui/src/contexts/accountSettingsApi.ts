/**
 * Account Settings API
 * Handles all API calls related to account management
 */

import type {
  AccountPreferences,
  ActiveSession,
  AccountActivity,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdatePreferencesRequest,
  ExportDataResponse,
} from './accountSettingsTypes';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Get auth headers with JWT token
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const error = await response.text();
    throw new Error(error || response.statusText);
  }
  return response.json();
}

/**
 * Fetch user profile
 */
export async function fetchUserProfile() {
  const response = await fetch(`${API_BASE}/account/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Fetch user preferences
 */
export async function fetchAccountPreferences(): Promise<AccountPreferences> {
  const response = await fetch(`${API_BASE}/account/preferences`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Update user preferences
 */
export async function updateAccountPreferences(
  preferences: UpdatePreferencesRequest
): Promise<AccountPreferences> {
  const response = await fetch(`${API_BASE}/account/preferences`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(preferences),
  });
  return handleResponse(response);
}

/**
 * Update user profile (displayName, email)
 */
export async function updateUserProfile(
  data: UpdateProfileRequest
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/account/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

/**
 * Change user password
 */
export async function changePassword(
  data: ChangePasswordRequest
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/account/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

/**
 * Fetch active sessions
 */
export async function fetchActiveSessions(): Promise<ActiveSession[]> {
  const response = await fetch(`${API_BASE}/account/sessions`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Logout from a specific session
 */
export async function logoutSession(sessionId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/account/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Logout from all sessions
 */
export async function logoutAllSessions(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/account/sessions/logout-all`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Fetch account activity
 */
export async function fetchAccountActivity(): Promise<AccountActivity[]> {
  const response = await fetch(`${API_BASE}/account/activity`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Export account data
 */
export async function exportAccountData(): Promise<ExportDataResponse> {
  const response = await fetch(`${API_BASE}/account/export`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Deactivate account
 */
export async function deactivateAccount(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/account/deactivate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Delete account permanently
 */
export async function deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/account/delete`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password }),
  });
  return handleResponse(response);
}

/**
 * Upload avatar
 */
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_BASE}/account/avatar`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  return handleResponse(response);
}
