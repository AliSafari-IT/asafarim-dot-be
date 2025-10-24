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
      console.log('🔑 Attempting login for email:', data.email);
      const response = await identityService.login(data);
      
      // Check if password setup is required
      if ('requiresPasswordSetup' in response && response.requiresPasswordSetup) {
        // Handle password setup case if needed
        setError('Password setup required');
        return false;
      }
      
      // After successful login, the cookies should be set by the server
      console.log('✅ Login successful, cookies should be set by server');
      console.log('📦 Response received with token and user info');
      
      // Store the user info in localStorage as backup (non-sensitive data only)
      try {
        // Only store user info if this is an AuthResponse (not PasswordSetupResponse)
        if ('user' in response) {
          localStorage.setItem('user_info', JSON.stringify({
            id: response.user.id,
            email: response.user.email,
            firstName: response.user.firstName,
            roles: response.user.roles,
            // Do not store the token in localStorage - it should be in HTTP-only cookie
          }));
          console.log('📝 User info stored in localStorage as backup');
        }
      } catch (storageError) {
        console.warn('⚠️ Failed to store user info in localStorage:', storageError);
      }
      
      // CRITICAL: Wait longer to ensure cookies are fully written to browser
      // This is especially important for cross-domain scenarios
      console.log('⏱️ Waiting for cookies to be properly set...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify cookies are actually set by making a test request (non-blocking)
      console.log('🔍 Verifying authentication after login...');
      const apiBaseUrl = import.meta.env.VITE_IDENTITY_API_URL || 'http://api.asafarim.local:5101';
      try {
        const verifyResponse = await fetch(`${apiBaseUrl}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (verifyResponse.ok) {
          console.log('✅ Authentication verified successfully');
          const userData = await verifyResponse.json();
          console.log('👤 User data:', userData);
        } else {
          console.warn('⚠️ Authentication verification failed:', verifyResponse.status);
          console.warn('⚠️ Cookies may not be set correctly for subdomains');
          console.warn('⚠️ This is normal for cross-domain scenarios, continuing...');
          
          // Diagnose possible issues (but don't fail the login)
          const cookieStr = document.cookie;
          console.log('📄 Current document.cookie string:', cookieStr);
          
          // Check if there are any cookies at all
          if (!cookieStr) {
            console.warn('⚠️ No cookies present in document.cookie');
          } else {
            console.log('🔍 Cookies found in document.cookie, but they may not include auth cookies');
          }
        }
      } catch (verifyError) {
        console.error('❌ Failed to verify authentication:', verifyError);
        console.warn('⚠️ Verification failed but login succeeded - this is normal for cross-domain cookie scenarios');
      }
      
      // Don't dispatch any events - they can cause issues
      // The LoginForm will handle redirect immediately after this returns true
      console.log('✅ Login complete, returning success');
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to login";
      console.error('❌ Login failed:', errorMessage);
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
      const response = await identityService.register(data);
      
      // After successful registration, cookies should be set
      console.log('✅ Registration successful, cookies should be set by server');
      console.log('📦 Response received with token and user info');
      
      // Store the user info in localStorage as backup (non-sensitive data only)
      try {
        localStorage.setItem('user_info', JSON.stringify({
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          roles: response.user.roles,
          // Do not store the token in localStorage - it should be in HTTP-only cookie
        }));
        console.log('📝 User info stored in localStorage as backup');
      } catch (storageError) {
        console.warn('⚠️ Failed to store user info in localStorage:', storageError);
      }
      
      // CRITICAL: Wait longer to ensure cookies are fully written to browser
      console.log('⏱️ Waiting for cookies to be properly set...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify cookies are actually set by making a test request
      console.log('🔍 Verifying authentication after registration...');
      const apiBaseUrl = import.meta.env.VITE_IDENTITY_API_URL || 'http://api.asafarim.local:5101';
      try {
        const verifyResponse = await fetch(`${apiBaseUrl}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (verifyResponse.ok) {
          console.log('✅ Authentication verified successfully');
          const userData = await verifyResponse.json();
          console.log('👤 User data:', userData);
        } else {
          console.warn('⚠️ Authentication verification failed:', verifyResponse.status);
          console.warn('⚠️ Cookies may not be set correctly for subdomains');
          console.warn('⚠️ This is normal for cross-domain scenarios, continuing...');
          
          // Diagnose possible issues (but don't fail the registration)
          const cookieStr = document.cookie;
          console.log('📄 Current document.cookie string:', cookieStr);
          
          // Check if there are any cookies at all
          if (!cookieStr) {
            console.warn('⚠️ No cookies present in document.cookie');
          } else {
            console.log('🔍 Cookies found in document.cookie');
          }
        }
      } catch (verifyError) {
        console.error('❌ Failed to verify authentication:', verifyError);
        console.warn('⚠️ Verification failed but registration succeeded - this is normal for cross-domain cookie scenarios');
      }
      
      console.log('✅ Registration complete, returning success');
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
      
      // Don't dispatch storage event with empty newValue - it triggers logout!
      // The shared useAuth hook will detect the auth state change naturally
      // window.dispatchEvent(new Event('focus'));
      // window.dispatchEvent(new StorageEvent('storage', { key: 'auth_token' }));
      
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
