import { useEffect } from 'react';

/**
 * Cross-origin logout sync page
 * When loaded (even in a hidden iframe), clears this origin's localStorage and auth state.
 */
export default function SyncLogout() {
  useEffect(() => {
    try {
      // Clear local auth storage for this subdomain
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');

      // Best-effort: clear known cookies on parent domain
      const rootDomain = '.asafarim.local';
      ['atk', 'rtk'].forEach((name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${rootDomain}; samesite=lax`;
      });

      // Signal within this origin
      window.dispatchEvent(new Event('auth-signout'));
    } catch {
      // no-op
    }

    // If opened directly, optionally redirect to login
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      window.location.replace(redirect);
    }
  }, []);

  return null;
}


