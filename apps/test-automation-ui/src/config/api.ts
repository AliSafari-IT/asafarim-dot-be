// apps/test-automation-ui/src/config/api.ts
import { isProduction } from '@asafarim/shared-ui-react';
import axios from 'axios';

// Use absolute URLs in production
const baseURL = isProduction ?
  'https://testora.asafarim.be' :
  'http://testora.asafarim.local:5200';

export const API_BASE = baseURL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any stored auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');

      // Show notification to user
      if (typeof window !== 'undefined') {
        // You can use your toast system here
        alert('Your session has expired. Please log in again.');

        // Redirect to homepage
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
