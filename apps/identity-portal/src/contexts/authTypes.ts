import type { UserInfo, LoginRequest, RegisterRequest } from '../api/identityService';

export interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (next: UserInfo) => void;
  reloadProfile: () => Promise<void>;
  forceSignOut: () => void; // Force sign out without API call, for cross-app sync
}
