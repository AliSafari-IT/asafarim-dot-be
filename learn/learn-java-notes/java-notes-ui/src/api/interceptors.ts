import { api } from "./notesApi";

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    const isViewTrackingEndpoint = url.includes('/view');
    const isAuthEndpoint = url.includes('/auth/');
    const isPublicEndpoint = url.includes('/public/');
    
    // Only log non-view-tracking errors
    if (!isViewTrackingEndpoint) {
      console.error("API Error:", error.response?.status, url);
    }
    
    // Only handle 401 for protected endpoints (not auth, view-tracking, or public)
    // Don't redirect on auth endpoints (login failures should show error, not redirect)
    // Don't redirect on public endpoints (they should work without auth)
    if (error.response?.status === 401 && !isViewTrackingEndpoint && !isAuthEndpoint && !isPublicEndpoint) {
      // Only clear auth if we're not already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
