export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string | null;
  roles: string[];
  locked?: boolean;
  lockReason?: string;
  lockedAt?: string;
  lastLogin?: string;
  lastLoginIp?: string;
  failedLoginAttempts?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}
