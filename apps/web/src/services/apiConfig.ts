// API base URL
export const API_BASE_URL = import.meta.env.VITE_CORE_API_URL || 'http://api.asafarim.local:5102/api';

// Helper function to get cookie value
export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}
