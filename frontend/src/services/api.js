import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Notify app to redirect using router (no hard reload)
      window.dispatchEvent(new CustomEvent('auth:logout'));
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