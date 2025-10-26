const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment
  ? (import.meta.env.VITE_TASKS_API_URL || '/api/taskmanagement')
  : (import.meta.env.VITE_TASKS_API_URL || 'https://taskmanagement.asafarim.be/api/taskmanagement');

export const IDENTITY_API_URL = isDevelopment
  ? (import.meta.env.VITE_IDENTITY_API_URL || 'http://identity.asafarim.local:5101')
  : (import.meta.env.VITE_IDENTITY_API_URL || 'https://identity.asafarim.be');
