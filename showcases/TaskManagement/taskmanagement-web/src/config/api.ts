const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment
  ? (import.meta.env.VITE_TASKS_API_URL || 'http://tasks.asafarim.local:5104/api')
  : 'https://tasks.asafarim.be/api';

export const IDENTITY_API_URL = isDevelopment
  ? (import.meta.env.VITE_IDENTITY_API_URL || 'http://identity.asafarim.local:5101')
  : 'https://identity.asafarim.be';
