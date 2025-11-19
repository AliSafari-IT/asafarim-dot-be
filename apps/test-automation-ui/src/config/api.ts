// apps/test-automation-ui/src/config/api.ts
import { isProduction } from '@asafarim/shared-ui-react';
import axios from 'axios';

// Use absolute URLs in production
const baseURL = isProduction ?
  'https://testora.asafarim.be' :
  'http://localhost:5106';

// SignalR WebSocket URL (wss for HTTPS, ws for HTTP)
const signalRProtocol = isProduction ? 'wss' : 'ws';
// Do not use https for SignalR as it will not work with WebSocket URLs
const signalRHost = isProduction ? 'testora.asafarim.be' : 'localhost:5106';
export const SIGNALR_URL = `${signalRProtocol}://${signalRHost}/hubs/testrun`;

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

// Get test run report (html or json) as text
export const getTestRunReport = (id: string, format: 'html' | 'json') => {
  return api.get(`/api/test-runs/${id}/report/${format}`, {
    responseType: 'text'
  });
};
