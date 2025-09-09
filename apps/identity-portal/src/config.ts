// Environment-aware configuration

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

// Determine if we're in production based on hostname and protocol
const isProduction = typeof window !== 'undefined' && (
  // Check for production domains
  window.location.hostname.includes('asafarim.be') || 
  window.location.hostname.includes('asafarim.com') ||
  // Also consider HTTPS as production
  window.location.protocol === 'https:' ||
  // Force production mode for specific hostnames
  window.location.hostname === 'identity.asafarim.be'
);

// Log the environment detection for debugging
console.log('Environment detection:', { 
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR', 
  protocol: typeof window !== 'undefined' ? window.location.protocol : 'SSR',
  isProduction 
});

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
  apiBaseUrl: '/api/identity',
  authEndpoints: {
    me: '/api/identity/auth/me',
    login: '/api/identity/auth/login',
    register: '/api/identity/auth/register',
    logout: '/api/identity/auth/logout',
  },
  isProduction: true
};

// Export the appropriate configuration based on environment
export const config: Config = isProduction ? prodConfig : devConfig;
