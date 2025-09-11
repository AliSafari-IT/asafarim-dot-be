import { createContext } from "react";
import type { AuthContextType } from "./authTypes";

// Create the auth context with default values

export const AuthContextCreated = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    passwordSetupRequired: null,
    login: async () => false,
    register: async () => false,
    setupPassword: async () => false,
    cancelPasswordSetup: () => { },
    logout: async () => { },
    clearError: () => { },
    updateUser: () => { },
    reloadProfile: async () => { },
    forceSignOut: () => { }, // Force sign out without API call
});
