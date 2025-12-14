import { isProduction, useAuth as useSharedAuth } from '@asafarim/shared-ui-react';
import type { UseAuthOptions } from '@asafarim/shared-ui-react';

// Production config - uses centralized identity portal
const prodConfig: UseAuthOptions = {
    authApiBase: 'https://identity.asafarim.be/auth',
    meEndpoint: '/me',
    tokenEndpoint: '/token',
    logoutEndpoint: '/logout',
    identityLoginUrl: 'https://identity.asafarim.be/login',
    identityRegisterUrl: 'https://identity.asafarim.be/register'
};

// Local development config
const devConfig: UseAuthOptions = {
    authApiBase: 'http://identity.asafarim.local:5101/auth',
    meEndpoint: '/me',
    tokenEndpoint: '/token',
    logoutEndpoint: '/logout',
    identityLoginUrl: 'http://identity.asafarim.local:5177/login',
    identityRegisterUrl: 'http://identity.asafarim.local:5177/register'
};

/**
 * KidCode Studio authentication hook
 * 
 * This app uses centralized authentication via the Identity Portal.
 * - Authentication cookies are shared across all *.asafarim.be domains
 * - Login/Register redirects to identity.asafarim.be
 * - This hook only checks authentication status via shared cookies
 * - User progress (stickers, badges, challenges, levels) will be saved to DB for authenticated users
 */
export const useAuth = () => {
    const config = isProduction ? prodConfig : devConfig;

    return useSharedAuth(config);
};

export default useAuth;
