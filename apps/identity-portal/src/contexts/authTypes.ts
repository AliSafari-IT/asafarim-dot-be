import type { LoginRequest, RegisterRequest, UserInfo, PasswordSetupRequest } from "../api/identityService";

export interface PasswordSetupState {
    userId: string;
    email: string;
}

export interface AuthContextType {
    user: UserInfo | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    passwordSetupRequired: PasswordSetupState | null;
    login: (data: LoginRequest) => Promise<boolean>;
    register: (data: RegisterRequest) => Promise<boolean>;
    setupPassword: (data: PasswordSetupRequest) => Promise<boolean>;
    cancelPasswordSetup: () => void;
    logout: () => Promise<void>;
    clearError: () => void;
    updateUser: (user: UserInfo) => void;
    reloadProfile: () => Promise<void>;
    forceSignOut: () => void; // Force sign out without API call, for cross-app sync
}
