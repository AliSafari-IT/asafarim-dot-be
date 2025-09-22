// appUrls.ts - Core App
// Centralized, environment-aware URLs for external apps

import { isProduction } from "@asafarim/shared-ui-react";

interface ImportMetaEnv {
    readonly VITE_BLOG_URL: string;
    readonly VITE_AI_URL: string;
    readonly VITE_CORE_URL: string;
    readonly VITE_CORE_JOBS_URL: string;
}

const env = import.meta.env as unknown as ImportMetaEnv;

const isProd = isProduction;

// Allow explicit overrides via env; otherwise use sensible defaults per environment
export const BLOG_URL = env?.VITE_BLOG_URL || (isProd ? 'https://blog.asafarim.be' : 'http://blog.asafarim.local:3000');
export const AI_URL = env?.VITE_AI_URL || (isProd ? 'https://ai.asafarim.be' : 'http://ai.asafarim.local:5173');
export const CORE_BASE_URL = env?.VITE_CORE_URL || (isProd ? 'https://core.asafarim.be' : 'http://core.asafarim.local:5174');
export const CORE_JOBS_URL = env?.VITE_CORE_JOBS_URL || `${CORE_BASE_URL}/jobs`;

export function openInNewTab(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}
