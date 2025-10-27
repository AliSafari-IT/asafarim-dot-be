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
  apiBaseUrl: 'http://identity.asafarim.local:5101',
  authEndpoints: {
    me: 'http://identity.asafarim.local:5101/auth/me',
    login: 'http://identity.asafarim.local:5101/auth/login',
    register: 'http://identity.asafarim.local:5101/auth/register',
    logout: 'http://identity.asafarim.local:5101/auth/logout',
  },
  isProduction: false
};

// Production configuration - use direct Identity API URLs
const prodConfig: Config = {
  apiBaseUrl: 'https://identity.asafarim.be',
  authEndpoints: {
    me: 'https://identity.asafarim.be/auth/me',
    login: 'https://identity.asafarim.be/auth/login',
    register: 'https://identity.asafarim.be/auth/register',
    logout: 'https://identity.asafarim.be/auth/logout',
  },
  isProduction: true
};

// Export the appropriate configuration based on environment
export const config: Config = isProduction ? prodConfig : devConfig;
