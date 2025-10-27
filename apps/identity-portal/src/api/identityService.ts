/**
 * Identity API Service
 * Handles communication with the Identity.Api backend
 */

// Types for API requests and responses
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PasswordSetupRequest {
  token: string;
  password: string;
}

export interface ValidateSetupTokenRequest {
  token: string;
}

export interface ValidateSetupTokenResponse {
  userId: string;
  email: string;
  message: string;
}

export interface PasswordSetupResponse {
  requiresPasswordSetup: boolean;
  userId: string;
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface UpdateProfileRequest {
  email?: string;
  userName?: string;
}

export interface ChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// Base API URL from environment variable
// Remove the /api prefix as the endpoints don't include it
const API_BASE_URL = import.meta.env.VITE_IDENTITY_API_URL || 'http://identity.asafarim.local:5101';

/**
 * Handle API responses and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    console.log('API error response status:', response.status);
    console.log('API error response statusText:', response.statusText);
    
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        console.log('API error response body (json):', errorData);
        
        // Create error message that includes the code for frontend detection
        let errorMessage = errorData.message || `Server error: ${response.status} ${response.statusText}`;
        if (errorData.code) {
          errorMessage = `${errorData.code}:${errorMessage}`;
        }
        
        const error = new Error(errorMessage) as Error & { code?: string; errors?: Record<string, string[]> };
        error.code = errorData.code;
        error.errors = errorData.errors;
        throw error;
      } catch (parseError) {
        // If it's already our custom error with code, re-throw it
        if (parseError instanceof Error && parseError.message.includes(':')) {
          throw parseError;
        }
        console.error('Failed to parse error response:', parseError);
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }
    } else {
      try {
        const text = await response.text();
        console.log('API error response body (text):', text);
        throw new Error(text || `API error ${response.status}: ${response.statusText}`);
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }
    }
  }
  
  return response.json() as Promise<T>;
}

/**
 * Default JSON headers with Authorization if token exists
 */
function getJsonHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  // Add Authorization header if token exists in localStorage
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Identity API service
 */
export const identityService = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse | PasswordSetupResponse> {
    console.log('Login API call to:', `${API_BASE_URL}/auth/login`);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      console.log('Login API response status:', response.status);
      const result = await handleResponse<AuthResponse | PasswordSetupResponse>(response);
      
      // Check if the response indicates a password setup is required
      if ('requiresPasswordSetup' in result && result.requiresPasswordSetup) {
        return result as PasswordSetupResponse;
      }
      
      return result as AuthResponse;
    } catch (error) {
      console.error('Login API call error:', error);
      throw error;
    }
  },
  
  /**
   * Setup initial password for user with null password
   */
  async setupPassword(data: PasswordSetupRequest): Promise<AuthResponse> {
    console.log('Setup password API call to:', `${API_BASE_URL}/auth/setup-password`);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/setup-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      console.log('Setup password API response status:', response.status);
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Setup password API call error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log('Register API call to:', `${API_BASE_URL}/auth/register`);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      console.log('Register API response status:', response.status);
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Register API call error:', error);
      throw error;
    }
  },
  
  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return handleResponse<{ message: string }>(response);
  },
  
  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return handleResponse<{ message: string }>(response);
  },
  
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserInfo> {
    const url = `${API_BASE_URL}/auth/me`;
    console.log('Fetching user profile...', url);
    try {
      const response = await fetch(url, {
        headers: getJsonHeaders(),
        credentials: 'include'  // Important: include cookies in the request
      });
      
      console.log('Profile fetch response status:', response.status);
      
      if (!response.ok) {
        console.error('Profile fetch failed with status:', response.status);
        throw new Error(`Profile fetch failed: ${response.status} ${response.statusText}`);
      }
      
      return handleResponse<UserInfo>(response);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserInfo>): Promise<UserInfo> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: getJsonHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    return handleResponse<UserInfo>(response);
  },

  /** Change password */
  async changePassword(data: ChangePasswordRequestBody): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: getJsonHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return handleResponse<{ message: string }>(response);
  },
  
  /**
   * Refresh the authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    console.log('Attempting to refresh token...');
    try {
      // Get current auth token if available
      const authToken = localStorage.getItem('auth_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      // Include auth token in header if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers,
        credentials: 'include',  // Important: include cookies in the request
        body: JSON.stringify({ refreshToken })
      });
      
      console.log('Refresh token response status:', response.status);
      
      if (!response.ok) {
        console.error('Refresh token failed with status:', response.status);
        throw new Error(`Refresh token failed: ${response.status} ${response.statusText}`);
      }
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Error during token refresh:', error);
      throw error;
    }
  },
  
  /**
   * Request password reset (forgot password)
   */
  async requestPasswordReset(data: ForgotPasswordRequest): Promise<{ message: string }> {
    console.log('Requesting password reset for email:', data.email);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      console.log('Forgot password response status:', response.status);
      return handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  /**
   * Validate password setup token (magic link)
   */
  async validateSetupToken(data: ValidateSetupTokenRequest): Promise<ValidateSetupTokenResponse> {
    console.log('Validating setup token...');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-setup-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      console.log('Validate setup token response status:', response.status);
      return handleResponse<ValidateSetupTokenResponse>(response);
    } catch (error) {
      console.error('Validate setup token error:', error);
      throw error;
    }
  },
  
  
  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      // Make logout request to the server
      // The 'credentials: include' option ensures cookies are sent with the request
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      console.log('Logout API response status:', response.status);
      
      // Wait a bit to ensure cookies are processed
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Logout API call error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      
      // Dispatch event for cross-app synchronization
      window.dispatchEvent(new Event('auth-signout'));
    }
  }
};

export default identityService;
