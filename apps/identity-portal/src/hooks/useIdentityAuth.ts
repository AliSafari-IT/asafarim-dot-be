import { useAuth as useSharedAuth } from '@asafarim/shared-ui-react';
import { authConfig } from '../config/auth';

/**
 * Identity Portal specific useAuth hook that uses the shared authentication
 * with pre-configured endpoints for the identity server
 */
export const useAuth = () => {
  return useSharedAuth(authConfig);
};

export default useAuth;
