/**
 * useAccountSettings Hook
 * Manages all account-related functionality and state
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import type {
  AccountPreferences,
  ActiveSession,
  AccountActivity,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdatePreferencesRequest,
  ExportDataResponse,
} from './accountSettingsTypes';
import * as accountApi from './accountSettingsApi';

interface ApiResponse {
  success: boolean;
  message: string;
}

interface AvatarResponse {
  avatarUrl: string;
}

interface UseAccountSettingsReturn {
  // State
  preferences: AccountPreferences | null;
  activeSessions: ActiveSession[];
  accountActivity: AccountActivity[];
  isLoading: boolean;
  error: string | null;

  // Profile
  updateUserProfile: (data: UpdateProfileRequest) => Promise<ApiResponse>;
  uploadAvatar: (file: File) => Promise<AvatarResponse>;

  // Security
  changePassword: (data: ChangePasswordRequest) => Promise<ApiResponse>;
  logoutSession: (sessionId: string) => Promise<void>;
  logoutAllSessions: () => Promise<void>;

  // Preferences
  updatePreferences: (prefs: UpdatePreferencesRequest) => Promise<void>;

  // Data fetching
  refreshAll: () => Promise<void>;
  exportAccountData: () => Promise<ExportDataResponse>;

  // Danger zone
  deactivateAccount: () => Promise<ApiResponse>;
  deleteAccount: (password: string) => Promise<ApiResponse>;

  // Utility
  clearError: () => void;
}

export function useAccountSettings(): UseAccountSettingsReturn {
  const { user, logout } = useAuth();
  const [preferences, setPreferences] = useState<AccountPreferences | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [accountActivity, setAccountActivity] = useState<AccountActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Error handler
  const handleError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'An error occurred';
    setError(message);
    console.error('[useAccountSettings]', message);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Wrap async operations
  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  // Profile
  const updateUserProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      const result = await withLoading(() => accountApi.updateUserProfile(data));
      // Refresh user data after profile update
      if (user && data) {
        const updatedUser = { ...user };
        if (data.displayName) updatedUser.displayName = data.displayName;
        if (data.email) updatedUser.email = data.email;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userUpdated'));
      }
      return result;
    },
    [withLoading, user]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const result = await withLoading(() => accountApi.uploadAvatar(file));
      // Refresh user data after avatar upload
      if (user) {
        const updatedUser = { ...user, avatarUrl: result.avatarUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userUpdated'));
      }
      return result;
    },
    [withLoading, user]
  );

  // Security
  const changePassword = useCallback(
    (data: ChangePasswordRequest) => withLoading(() => accountApi.changePassword(data)),
    [withLoading]
  );

  const logoutSession = useCallback(
    async (sessionId: string) => {
      await withLoading(async () => {
        await accountApi.logoutSession(sessionId);
        const sessions = await accountApi.fetchActiveSessions();
        setActiveSessions(sessions);
      });
    },
    [withLoading]
  );

  const logoutAllSessions = useCallback(async () => {
    await withLoading(async () => {
      await accountApi.logoutAllSessions();
      logout();
    });
  }, [withLoading, logout]);

  // Preferences
  const updatePreferences = useCallback(
    async (prefs: UpdatePreferencesRequest) => {
      const updated = await withLoading(() => accountApi.updateAccountPreferences(prefs));
      setPreferences(updated);
    },
    [withLoading]
  );

  // Data fetching
  const refreshAll = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const [prefs, sessions, activity] = await Promise.allSettled([
        accountApi.fetchAccountPreferences(),
        accountApi.fetchActiveSessions(),
        accountApi.fetchAccountActivity(),
      ]);
      if (prefs.status === 'fulfilled') setPreferences(prefs.value);
      if (sessions.status === 'fulfilled') setActiveSessions(sessions.value);
      if (activity.status === 'fulfilled') setAccountActivity(activity.value);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  const exportAccountData = useCallback(
    () => withLoading(() => accountApi.exportAccountData()),
    [withLoading]
  );

  // Danger zone
  const deactivateAccount = useCallback(
    () => withLoading(() => accountApi.deactivateAccount()),
    [withLoading]
  );

  const deleteAccount = useCallback(
    (password: string) => withLoading(() => accountApi.deleteAccount(password)),
    [withLoading]
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user, refreshAll]);

  return {
    preferences,
    activeSessions,
    accountActivity,
    isLoading,
    error,
    updateUserProfile,
    uploadAvatar,
    changePassword,
    logoutSession,
    logoutAllSessions,
    updatePreferences,
    refreshAll,
    exportAccountData,
    deactivateAccount,
    deleteAccount,
    clearError,
  };
}
