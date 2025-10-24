import type { UseAuthOptions } from '@asafarim/shared-ui-react';

// Decide environment based on window location. We avoid importing shared isProduction
// to keep this file tree-shakeable and to ensure correct values when served from identity domain.
const isProd = typeof window !== 'undefined' && (
  window.location.protocol === 'https:' ||
  window.location.hostname.endsWith('asafarim.be') ||
  window.location.hostname.endsWith('asafarim.com')
);

// In production, the identity portal should talk to the identity API on the same domain
// so cookies (atk/rtk) are included with credentials.
const prodConfig: UseAuthOptions = {
  authApiBase: 'https://identity.asafarim.be/auth',
  meEndpoint: '/me',
  tokenEndpoint: '/token',
  logoutEndpoint: '/logout',
  identityLoginUrl: 'https://identity.asafarim.be/login',
  identityRegisterUrl: 'https://identity.asafarim.be/register'
};

// Local development config (existing values)
const devConfig: UseAuthOptions = {
  authApiBase: 'http://identity.asafarim.local:5101/auth',  // Identity API backend with /auth path
  meEndpoint: '/me',
  tokenEndpoint: '/token',
  logoutEndpoint: '/logout',
  identityLoginUrl: 'http://identity.asafarim.local:5177/login',  // Identity Portal frontend
  identityRegisterUrl: 'http://identity.asafarim.local:5177/register'  // Identity Portal frontend
};

export const authConfig: UseAuthOptions = isProd ? prodConfig : devConfig;
