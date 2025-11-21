import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';

/**
 * Logout page
 * Clears auth state and redirects to login
 */
export default function SyncLogout() {
  const navigate = useNavigate();

  return (
    <div data-testid="sync-logout-page" style={{ display: 'none' }}>
      <LogoutHandler navigate={navigate} />
    </div>
  );
}

function LogoutHandler({ navigate }: { navigate: NavigateFunction }) {
  useEffect(() => {
    try {
      // Clear local auth storage for this subdomain
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');

      // Clear known cookies on parent domain
      const rootDomain = '.asafarim.local';
      ['atk', 'rtk'].forEach((name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${rootDomain}; samesite=lax`;
      });

      // Also try to clear on localhost for development
      ['atk', 'rtk'].forEach((name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=lax`;
      });

      // Signal within this origin
      window.dispatchEvent(new Event('auth-signout'));

      // Redirect to login after a short delay to ensure cookies are cleared
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/login';
      
      setTimeout(() => {
        if (redirect.startsWith('http')) {
          window.location.replace(redirect);
        } else {
          navigate(redirect);
        }
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if there's an error
      setTimeout(() => {
        navigate('/login');
      }, 100);
    }
  }, [navigate]);

  return null;
}


