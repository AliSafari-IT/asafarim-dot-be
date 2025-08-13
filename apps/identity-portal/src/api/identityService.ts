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
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Base API URL from environment variable
// Remove the /api prefix as the endpoints don't include it
const API_BASE_URL = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5190';

/**
 * Handle API responses and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    console.log('API error response status:', response.status);
    console.log('API error response statusText:', response.statusText);
    
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        console.log('API error response body (json):', errorData);
        const error: ApiError = {
          message: errorData.message || `Server error: ${response.status} ${response.statusText}`,
          errors: errorData.errors
        };
        throw error;
      } else {
        const text = await response.text();
        console.log('API error response body (text):', text);
        throw new Error(text || `API error ${response.status}: ${response.statusText}`);
      }
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError);
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }
  }
  
  return response.json() as Promise<T>;
}

/**
 * Get auth header with token
 */
function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

/**
 * Identity API service
 */
export const identityService = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
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
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Login API call error:', error);
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
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeader()
    });
    
    return handleResponse<UserInfo>(response);
  },
  
  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserInfo>): Promise<UserInfo> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    
    return handleResponse<UserInfo>(response);
  },
  
  /**
   * Refresh the authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken })
    });
    
    return handleResponse<AuthResponse>(response);
  },
  
  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: getAuthHeader(),
          credentials: 'include',
          body: JSON.stringify({ refreshToken })
        });
      } catch (error) {
        console.error('Logout API call error:', error);
      }
    }
    
    // Clear local storage regardless of API response
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  }
};

export default identityService;
