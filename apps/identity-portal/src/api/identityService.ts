/**
 * Identity API Service (Refactored)
 * Handles all authentication and user identity operations
 */

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
  userName?: string | null;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResponse {
  registered: boolean;
  requiresEmailConfirmation: boolean;
  email: string;
  emailSent: boolean;
  message: string;
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

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
}

/* -------------------------------
   Base Configuration
--------------------------------*/
const API_BASE_URL =
  import.meta.env.VITE_IDENTITY_API_URL || 'http://identity.asafarim.local:5101';

/* -------------------------------
   Utility Helpers
--------------------------------*/

/** Timeout-enabled fetch */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 15000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/** Build JSON headers with Authorization */
function getJsonHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** Normalize any thrown error into ApiError */
function normalizeError(err: unknown): ApiError {
  if (err instanceof Error) {
    const e = err as Error & { 
      code?: string; 
      errors?: Record<string, string[]> 
    };
    return { 
      message: e.message, 
      code: e.code, 
      errors: e.errors 
    };
  }
  return { message: 'Unexpected API error' };
}

/** Handle API JSON responses with unified error handling */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.message || `Error ${response.status}: ${response.statusText}`;
      const err = new Error(message) as Error & { code?: string; errors?: Record<string, string[]> };
      err.code = errorData.code;
      err.errors = errorData.errors;
      throw err;
    }
    const text = await response.text();
    throw new Error(text || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/** Centralized API call wrapper */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  timeout = 15000
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] ${options.method || 'GET'} → ${url}`);

  try {
    const response = await fetchWithTimeout(
      url,
      {
        headers: getJsonHeaders(),
        credentials: 'include',
        ...options,
      },
      timeout
    );

    console.log(`[API] Response: ${response.status}`);
    return await handleResponse<T>(response);
  } catch (err) {
    const error = normalizeError(err);
    console.error(`[API ERROR] ${url}`, error);
    throw error;
  }
}

/* -------------------------------
   Identity API Service
--------------------------------*/
export const identityService = {
  /** Login */
  async login(data: LoginRequest): Promise<AuthResponse | PasswordSetupResponse> {
    return apiFetch<AuthResponse | PasswordSetupResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Register new user */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiFetch<RegisterResponse>('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  /** Confirm email address */
  async confirmEmail(params: { userId: string; token: string }): Promise<{ confirmed: boolean; message?: string; code?: string }> {
    return apiFetch<{ confirmed: boolean; message?: string; code?: string }>(
      `/auth/confirm-email?userId=${encodeURIComponent(params.userId)}&token=${encodeURIComponent(params.token)}`,
      { method: 'GET' }
    );
  },

  /** Resend confirmation email */
  async resendConfirmation(data: { email: string }): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Initial password setup (magic link flow) */
  async setupPassword(data: PasswordSetupRequest): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/setup-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Forgot password */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Reset password */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Validate setup token (magic link) */
  async validateSetupToken(
    data: ValidateSetupTokenRequest
  ): Promise<ValidateSetupTokenResponse> {
    return apiFetch<ValidateSetupTokenResponse>('/auth/validate-setup-token', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Get current user profile (with caching) */
  async getProfile(force = false): Promise<UserInfo> {
    if (!force) {
      const cached = localStorage.getItem('user_info');
      if (cached) return JSON.parse(cached);
    }

    const profile = await apiFetch<UserInfo>('/auth/me');
    localStorage.setItem('user_info', JSON.stringify(profile));
    return profile;
  },

  /** Update user profile */
  async updateProfile(data: Partial<UserInfo>): Promise<UserInfo> {
    return apiFetch<UserInfo>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** Change password */
  async changePassword(data: ChangePasswordRequestBody): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Refresh auth token */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /** Logout */
  async logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout failed silently:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      window.dispatchEvent(new Event('auth-signout'));
    }
  },
};

export async function requestPasswordReset(data: { email: string }): Promise<void> {
  // Replace with your API call implementation
  return fetch('/api/password-reset', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to send password reset email');
  });
}

export default identityService;
