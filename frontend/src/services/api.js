import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized globally (real SPA behavior)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    } else if (error.response?.status === 403) {
      console.error("Access Forbidden (403):", error.response.config.url);

      // Dispatch event for UI components to show a proper notification
      window.dispatchEvent(new CustomEvent('auth:forbidden', {
        detail: {
          url: error.response.config.url,
          message: "You do not have permission to access this resource."
        }
      }));

      // Also reject with a specific message for catch blocks
      return Promise.reject({
        ...error,
        message: "Access Forbidden: You do not have permission."
      });
    }
    return Promise.reject(error);
  }
);

// Simple helpers (like apiFetch but using Axios)
export const apiGet = (url) => api.get(url).then(res => res.data);
export const apiPost = (url, data) => api.post(url, data).then(res => res.data);
export const apiPut = (url, data) => api.put(url, data).then(res => res.data);
export const apiDelete = (url) => api.delete(url).then(res => res.data);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
};

export default api;