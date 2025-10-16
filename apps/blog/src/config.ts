// Environment-aware configuration

import { getIsProduction } from "@asafarim/shared-ui-react";

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

// Export the appropriate configuration based on environment
export const config: Config = getIsProduction() ? {
  apiBaseUrl: '/api/auth',
  authEndpoints: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
  },
  isProduction: true
} : {
  apiBaseUrl: 'http://api.asafarim.local:5101',
  authEndpoints: {
    me: 'http://api.asafarim.local:5101/auth/me',
    login: 'http://api.asafarim.local:5101/auth/login',
    register: 'http://api.asafarim.local:5101/auth/register',
    logout: 'http://api.asafarim.local:5101/auth/logout',
  },
  isProduction: false
};
