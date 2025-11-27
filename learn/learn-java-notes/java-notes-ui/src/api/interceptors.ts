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
    // Log the error for debugging
    console.error("API Error:", error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Only redirect if we're not already on login page
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
