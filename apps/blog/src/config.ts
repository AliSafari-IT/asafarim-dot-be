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
  apiBaseUrl: '/api/identity',
  authEndpoints: {
    me: '/api/identity/auth/me',
    login: '/api/identity/auth/login',
    register: '/api/identity/auth/register',
    logout: '/api/identity/auth/logout',
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
