import { createContext } from "react";
import type { AuthContextType } from "./authTypes";

// Create the auth context with default values

export const AuthContextCreated = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: async () => false,
    register: async () => false,
    logout: async () => { },
    clearError: () => { },
    updateUser: () => { },
    reloadProfile: async () => { },
});
