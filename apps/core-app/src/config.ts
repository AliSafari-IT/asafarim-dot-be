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

// Log the environment detection for debugging
console.log('Environment detection:', { 
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR', 
  protocol: typeof window !== 'undefined' ? window.location.protocol : 'SSR',
  isProduction 
});

// Development configuration
const devConfig: Config = {
  apiBaseUrl: 'http://api.asafarim.local:5101',
  authEndpoints: {
    me: 'http://api.asafarim.local:5101/auth/me',
    login: 'http://api.asafarim.local:5101/auth/login',
    register: 'http://api.asafarim.local:5101/auth/register',
    logout: 'http://api.asafarim.local:5101/auth/logout',
  },
  isProduction: false
};

// Production configuration
const prodConfig: Config = {
  apiBaseUrl: '/api/auth', // Changed from /api/identity to /api/auth
  authEndpoints: {
    me: '/api/auth/me', // Changed from /api/identity/auth/me to /api/auth/me
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
  },
  isProduction: true
};

// Export the appropriate configuration based on environment
export const config: Config = isProduction ? prodConfig : devConfig;
