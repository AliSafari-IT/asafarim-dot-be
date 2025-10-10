import { useCallback, useState } from 'react';
import { useAuth as useSharedAuth } from '@asafarim/shared-ui-react';
import { authConfig } from '../config/auth';
import { identityService, type LoginRequest, type RegisterRequest, type UpdateProfileRequest } from '../api/identityService';

/**
 * Identity Portal specific authentication hook that combines:
 * 1. Shared authentication state checking (via cookies)
 * 2. Direct login/register functionality (for the identity server)
 */
export const useIdentityPortalAuth = () => {
  const sharedAuth = useSharedAuth(authConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Direct login method for identity-portal
  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await identityService.login(data);
      
      // Check if password setup is required
      if ('requiresPasswordSetup' in response && response.requiresPasswordSetup) {
        // Handle password setup case if needed
        setError('Password setup required');
        return false;
      }
      
      // After successful login, the cookies should be set by the server
      // Trigger a re-check of auth state by dispatching events that the shared hook listens to
      console.log('Login successful, cookies should be set');
      
      // Wait a bit to ensure cookies are fully set before triggering auth check
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Dispatch events that the shared useAuth hook listens to
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'auth_token' }));
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to login";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Direct register method for identity-portal
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await identityService.register(data);
      
      // After successful registration, cookies should be set
      console.log('Registration successful, cookies should be set');
      
      // Wait a bit to ensure cookies are fully set before triggering auth check
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Dispatch events that the shared useAuth hook listens to
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'auth_token' }));
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to register";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await identityService.updateProfile(data);
      
      // After successful update, cookies should be set
      console.log('Profile update successful, cookies should be set');
      
      // Dispatch events that the shared useAuth hook listens to
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'auth_token' }));
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Return combined interface
  return {
    // Shared auth state
    isAuthenticated: sharedAuth.isAuthenticated,
    user: sharedAuth.user,
    token: sharedAuth.token,
    loading: sharedAuth.loading || isLoading,
    signOut: sharedAuth.signOut,
    
    // Direct login/register for identity-portal
    login,
    register,
    error,
    clearError,
    isLoading,
    updateProfile,
  };
};

export default useIdentityPortalAuth;
