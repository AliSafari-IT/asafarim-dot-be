import { isProduction, useAuth as useSharedAuth } from '@asafarim/shared-ui-react';
import type { UseAuthOptions } from '@asafarim/shared-ui-react';

// Production config - uses centralized identity portal
const prodConfig: UseAuthOptions = {
  authApiBase: 'https://identity.asafarim.be/api/identity',
  meEndpoint: '/auth/me',
  tokenEndpoint: '/auth/token',
  logoutEndpoint: '/auth/logout',
  // Redirect to identity portal for login/register (with return URL)
  identityLoginUrl: 'https://identity.asafarim.be/login',
  identityRegisterUrl: 'https://identity.asafarim.be/register'
};

// Local development config
const devConfig: UseAuthOptions = {
  authApiBase: 'http://identity.asafarim.local:5101',
  meEndpoint: '/auth/me',
  tokenEndpoint: '/auth/token',
  logoutEndpoint: '/auth/logout',
  identityLoginUrl: 'http://identity.asafarim.local:5101/login',
  identityRegisterUrl: 'http://identity.asafarim.local:5101/register'
};

/**
 * Web app authentication hook
 * 
 * This app uses centralized authentication via the Identity Portal.
 * - Authentication cookies are shared across all *.asafarim.be domains
 * - Login/Register redirects to identity.asafarim.be
 * - This hook only checks authentication status via shared cookies
 */
export const useAuth = () => {
  // Detect environment at runtime in the browser
  const config = isProduction ? prodConfig : devConfig;
  
  return useSharedAuth(config);
};

export default useAuth;
