// Environment-aware configuration

import { isProduction } from "@asafarim/shared-ui-react";

interface Config {
  apiBaseUrl: string;
  authEndpoints: {
    me: string;
    login: string;
    register: string;
    logout: string;
  };
  isProduction: boolean;
}

// Development configuration
const devConfig: Config = {
  apiBaseUrl: '/api',
  authEndpoints: {
    me: '/auth/me',
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  isProduction: false
};

// Production configuration
const prodConfig: Config = {
  apiBaseUrl: '/api/auth',
  authEndpoints: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
  },
  isProduction: true
};

// Export the appropriate configuration based on environment
export const config: Config = isProduction ? prodConfig : devConfig;
