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
    console.log('Fetching user profile...');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeader(),
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
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    return handleResponse<UserInfo>(response);
  },

  /** Change password */
  async changePassword(data: ChangePasswordRequestBody): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
   * Logout the current user
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        // Make logout request to the server
        // The 'credentials: include' option ensures cookies are sent with the request
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: getAuthHeader(),
          credentials: 'include',
          body: JSON.stringify({ refreshToken })
        });
        
        console.log('Logout API response status:', response.status);
        
        // If the server didn't handle cookie clearing or there was an error
        if (!response.ok) {
          console.warn('Server logout may not have cleared cookies properly');
          // Attempt to clear cookies manually
          clearAllCookies();
        }
      } catch (error) {
        console.error('Logout API call error:', error);
        // Attempt to clear cookies manually on error
        clearAllCookies();
      } finally {
        // Clear local storage regardless of API response
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        
        // Dispatch event for cross-app synchronization
        window.dispatchEvent(new Event('auth-signout'));
      }
    } else {
      // Even if no refresh token, try to clear cookies
      clearAllCookies();
    }
  }
};

/**
 * Helper function to clear all cookies
 * Note: This can only clear cookies that aren't HttpOnly and are on the same domain
 */
function clearAllCookies(): void {
  // Get all cookies
  const cookies = document.cookie.split(';');
  
  // For each cookie, set its expiration date to a past date
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Skip empty cookie names
    if (!name) continue;
    
    // Get the current hostname and extract domain parts
    const hostname = window.location.hostname;
    const domainParts = hostname.split('.');
    
    // Try with different domain combinations
    if (domainParts.length >= 2) {
      // Try with root domain (.asafarim.local)
      const rootDomain = `.${domainParts.slice(-2).join('.')}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${rootDomain}`;
      console.log(`Attempted to clear cookie with root domain: ${name} (domain=${rootDomain})`);
    }
    
    // Try with exact hostname
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${hostname}`;
    
    // Try with no domain specification (current domain only)
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    
    // Try with no path
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    console.log(`Attempted to clear cookie: ${name}`);
  }
  
  // Specifically target the auth cookies with the known domain
  const knownCookies = ['atk', 'rtk'];
  const rootDomain = '.asafarim.local'; // This should match the domain in the backend
  
  knownCookies.forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${rootDomain}`;
    console.log(`Attempted to clear known cookie: ${name} with domain=${rootDomain}`);
  });
}

export default identityService;
