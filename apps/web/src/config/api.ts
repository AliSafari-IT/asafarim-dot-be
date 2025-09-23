export const API_BASE_URL = import.meta.env.VITE_CORE_API_URL || 'http://api.asafarim.local:5102';

export const endpoints = {
  email: `${API_BASE_URL}/api/email`,
  conversations: `${API_BASE_URL}/api/conversations`,
} as const;
