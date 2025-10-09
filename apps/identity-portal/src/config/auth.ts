import type { UseAuthOptions } from '@asafarim/shared-ui-react';

export const authConfig: UseAuthOptions = {
  authApiBase: 'http://api.asafarim.local:5102',
  meEndpoint: '/auth/me',
  tokenEndpoint: '/auth/token',
  logoutEndpoint: '/auth/logout',
  identityLoginUrl: 'http://identity.asafarim.local:5177/login',
  identityRegisterUrl: 'http://identity.asafarim.local:5177/register'
};
