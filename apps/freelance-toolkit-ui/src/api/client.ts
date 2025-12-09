import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// API client for FreelanceToolkit.Api endpoints (with /api prefix)
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Auth client for Identity.Api endpoints (no /api prefix, uses /auth directly)
export const authClient = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        // Token is sent via cookies (withCredentials: true)
        // No need to manually add Authorization header
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            withCredentials: config.withCredentials,
        });
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => {
        console.log(`📥 API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
        if (error.response?.status === 401) {
            // Authentication failed - redirect to login
            // Token is managed via cookies by the shared auth hook
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth client interceptors
authClient.interceptors.request.use(
    (config) => {
        console.log(`📤 Auth Request: ${config.method?.toUpperCase()} ${config.url}`, {
            withCredentials: config.withCredentials,
        });
        return config;
    },
    (error) => Promise.reject(error)
);

authClient.interceptors.response.use(
    (response) => {
        console.log(`📥 Auth Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        console.error(`❌ Auth Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
        return Promise.reject(error);
    }
);

export default apiClient;
