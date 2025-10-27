// API base URL - points to Core API
interface ImportMetaEnv {
    readonly VITE_CORE_API_URL: string;
}

const env = import.meta.env as unknown as ImportMetaEnv;
// /api/core/* -> http://127.0.0.1:5102/*

export const CORE_API_URL = env.VITE_CORE_API_URL || 'http://core.asafarim.local:5102/api/core';

// API endpoints
export const endpoints = {
  email: `${CORE_API_URL}/email`,
  conversations: `${CORE_API_URL}/conversations`,
} as const;


// Helper function to get cookie value
export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

// Helper to build endpoint URLs
export const coreApi = (path: string) => `${CORE_API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
