import React, { useState, useEffect, type ReactNode } from "react";
import { api } from "../api/notesApi";
import { AuthContext } from "./useAuth";
import type { User, AuthContextType } from "./authTypes";

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to safely parse user from localStorage
const getSavedUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

// Helper to get initial token (only if user exists too)
const getInitialToken = (): string | null => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) {
    return token;
  }
  // Clear stale data
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return null;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getSavedUser);
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [isLoading] = useState(false);

  // Listen for user updates from other components (e.g., account settings)
  useEffect(() => {
    const handleUserUpdate = () => {
      const updatedUser = getSavedUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/signin", {
        username,
        password,
      });

      const { token: jwtToken, id, email, roles, displayName } = response.data;
      const userData = { id, username, email, roles, displayName };

      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
    } catch {
      throw new Error(
        `
        Login unsuccessful. Please verify your email and password.
        If you already have an account, try again.
        Otherwise, create a new account to get started.
        `
      );
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      await api.post("/auth/signup", {
        username,
        email,
        password,
      });

      // Auto-login after successful registration
      await login(username, password);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      if (axiosError?.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error("Registration failed. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
