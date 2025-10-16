// Runs on the client to unify Docusaurus's theme key with our cross‑app key
// Maps localStorage 'theme' <-> 'asafarim-theme' and syncs a root-domain cookie

import { isProduction } from "@asafarim/shared-ui-react";

(function () {
  if (typeof window === 'undefined') return;

  const D_KEY = 'theme';
  const APP_KEY = 'asafarim-theme';
  const COOKIE = 'asafarim_theme';

  const getCookie = (name: string): string | null => {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  };

  const setCookie = (value: string) => {
    try {
      // Use the appropriate domain for cookies
      const domain = isProduction ? '.asafarim.be' : '.asafarim.local';

      // Set domain-wide cookie
      document.cookie = `${COOKIE}=${value}; domain=${domain}; path=/; max-age=31536000; samesite=lax`;
      // Also set path-only cookie as fallback
      document.cookie = `${COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  };

  const normalize = (v: string | null | undefined): 'dark' | 'light' | null =>
    v === 'dark' || v === 'light' ? v : null;

  const applyDom = (mode: 'dark' | 'light') => {
    const root = document.documentElement as HTMLElement;
    root.setAttribute('data-theme', mode);
    (root.style as any).colorScheme = mode;
  };

  const localMode = normalize(localStorage.getItem(APP_KEY))
    || normalize(localStorage.getItem(D_KEY))
    || normalize(getCookie(COOKIE))
    || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  if (localMode) {
    if (localStorage.getItem(APP_KEY) !== localMode) localStorage.setItem(APP_KEY, localMode);
    if (localStorage.getItem(D_KEY) !== localMode) localStorage.setItem(D_KEY, localMode);
    setCookie(localMode);
    applyDom(localMode);
  }

  // Keep keys in sync across tabs and with external apps
  window.addEventListener('storage', (e) => {
    if (e.key !== D_KEY && e.key !== APP_KEY) return;
    const v = normalize(e.newValue || undefined);
    if (!v) return;
    if (localStorage.getItem(APP_KEY) !== v) localStorage.setItem(APP_KEY, v);
    if (localStorage.getItem(D_KEY) !== v) localStorage.setItem(D_KEY, v);
    setCookie(v);
    applyDom(v);
  });
})();
