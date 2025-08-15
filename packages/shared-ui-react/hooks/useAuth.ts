import { useState, useEffect, useCallback } from 'react';

export interface UseAuthOptions {
  authApiBase?: string;               // e.g. http://api.asafarim.local:5190
  meEndpoint?: string;                // e.g. /auth/me
  logoutEndpoint?: string;            // e.g. /auth/logout
  identityLoginUrl?: string;          // full URL to identity login page
}

export interface UseAuthResult<TUser = any> {
  isAuthenticated: boolean;
  user: TUser | null;
  loading: boolean;
  signOut: (redirectUrl?: string) => Promise<void>;
  signIn: (redirectUrl?: string) => Promise<void>;
}

async function fetchIsAuthenticated(base: string, me: string): Promise<boolean> {
  try {
    const res = await fetch(`${base}${me}`, { method: 'GET', credentials: 'include' });
    return res.status !== 401;
  } catch {
    return false;
  }
}

async function fetchUserInfo<TUser>(base: string, me: string): Promise<TUser | null> {
  try {
    const res = await fetch(`${base}${me}`, { method: 'GET', credentials: 'include' });
    if (!res.ok) return null;
    return (await res.json()) as TUser;
  } catch {
    return null;
  }
}

export function useAuth<TUser = any>(options?: UseAuthOptions): UseAuthResult<TUser> {
  const authApiBase = options?.authApiBase ?? 'http://api.asafarim.local:5190';
  const meEndpoint = options?.meEndpoint ?? '/auth/me';
  const logoutEndpoint = options?.logoutEndpoint ?? '/auth/logout';
  const identityLoginUrl = options?.identityLoginUrl ?? 'http://identity.asafarim.local:5177/login';

  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const ok = await fetchIsAuthenticated(authApiBase, meEndpoint);
      setAuthenticated(ok);
      setUser(ok ? await fetchUserInfo<TUser>(authApiBase, meEndpoint) : null);
      setLoading(false);
    };

    checkAuth();

    const handle = () => { void checkAuth(); };
    window.addEventListener('auth-signout', handle);
    window.addEventListener('storage', (evt) => {
      if (evt.key === 'auth_token' || evt.key === 'user_info') handle();
    });
    return () => {
      window.removeEventListener('auth-signout', handle);
      window.removeEventListener('storage', handle as any);
    };
  }, [authApiBase, meEndpoint]);

  const signOut = useCallback(async (redirectUrl?: string) => {
    const syncIdentityLogout = () => new Promise<void>((resolve) => {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'http://identity.asafarim.local:5177/sync-logout';
        const cleanup = () => { try { iframe.remove(); } catch {} resolve(); };
        iframe.onload = cleanup;
        document.body.appendChild(iframe);
        setTimeout(cleanup, 1200);
      } catch { resolve(); }
    });

    // Clear local storage quickly for current origin
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    } catch {}

    // Trigger backend cookie clearing
    try {
      await fetch(`${authApiBase}${logoutEndpoint}`, { method: 'POST', credentials: 'include' });
    } catch {}

    // Best-effort: ensure identity portal clears its own storage
    await syncIdentityLogout();

    window.dispatchEvent(new Event('auth-signout'));
    setAuthenticated(false);
    setUser(null);
    if (redirectUrl) window.location.href = redirectUrl;
  }, [authApiBase, logoutEndpoint]);

  const signIn = useCallback(async (redirectUrl?: string) => {
    const returnUrl = encodeURIComponent(redirectUrl || window.location.href);
    window.location.href = `${identityLoginUrl}?returnUrl=${returnUrl}`;
  }, [identityLoginUrl]);

  return { isAuthenticated: authenticated, user, loading, signOut, signIn };
}

export default useAuth;


