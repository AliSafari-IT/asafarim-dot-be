// appUrls.ts
// Centralized, environment-aware URLs for external apps

import { isProduction } from "@asafarim/shared-ui-react";

const env = import.meta.env;

const isProd = isProduction;

// Allow explicit overrides via env; otherwise use sensible defaults per environment
export const BLOG_URL = env.VITE_BLOG_URL || (isProd ? 'https://blog.asafarim.be' : 'http://blog.asafarim.local:3000');
export const WEB_URL = env.VITE_WEB_URL || (isProd ? 'https://asafarim.be' : 'http://web.asafarim.local:5175');
export const AI_URL = env.VITE_AI_URL || (isProd ? 'https://ai.asafarim.be' : 'http://ai.asafarim.local:5173');
export const CORE_URL = env.VITE_CORE_URL || (isProd ? 'https://core.asafarim.be' : 'http://core.asafarim.local:5174');
// http://web.asafarim.local:5175/portfolio/publications
export const PUBLICATIONS_URL = env.VITE_PUBLICATIONS_URL || (isProd ? 'https://asafarim.be/portfolio/publications' : 'http://web.asafarim.local:5175/portfolio/publications');
export const RESUME_URL = env.VITE_RESUME_URL || (isProd ? 'https://asafarim.be/portfolio/resume' : 'http://web.asafarim.local:5175/portfolio/resume');

export function openInNewTab(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}
