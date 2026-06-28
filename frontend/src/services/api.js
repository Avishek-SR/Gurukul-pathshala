import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Converts a server-returned relative image path (e.g. "/api/uploads/xyz.png")
 * into a fully-qualified URL pointing to the correct backend domain.
 * Safe to call with null/undefined — returns null in that case.
 *
 * The backend stores paths as "/api/uploads/<filename>".
 * The resource is served at: <backend-origin>/api/uploads/<filename>
 * e.g. https://gurukul-pathshala.onrender.com/api/uploads/<filename>
 *
 * So we just prepend the API_BASE_URL origin and keep the full path.
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  // Already an absolute URL — return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // path is like "/api/uploads/xyz.png"
  // API_BASE_URL is like "https://gurukul-pathshala.onrender.com/api" or "/api"
  try {
    if (API_BASE_URL.startsWith('http')) {
      // Extract the origin (e.g. "https://gurukul-pathshala.onrender.com")
      const url = new URL(API_BASE_URL);
      const origin = url.origin; // e.g. "https://gurukul-pathshala.onrender.com"
      // path already has the /api/uploads/... prefix, so just attach to origin
      return `${origin}${path}`;
    } else {
      // Relative API base ("/api") — just return the path as-is (same origin)
      return path;
    }
  } catch {
    // Fallback: strip /api prefix and attach to API_BASE_URL
    const normalized = path.replace(/^\/api\//, '/');
    return `${API_BASE_URL}${normalized}`;
  }
};

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

export const publicAdmission = {
  submitApplication: (data) => api.post('/public/admissions/apply', data),
};

export const adminAdmissions = {
  getAllApplications: () => api.get('/admin/admissions/applications').then(res => res.data),
  // Stage 1: Accept → sends entrance exam email
  acceptApplication: (id, payload) => api.put(`/admin/admissions/applications/${id}/accept`, payload).then(res => res.data),
  // Stage 2: Mark exam as done
  markExamDone: (id) => api.put(`/admin/admissions/applications/${id}/mark-exam-done`).then(res => res.data),
  // Stage 3: Final admit → creates student account + sends credentials email
  admitApplication: (id) => api.put(`/admin/admissions/applications/${id}/admit`).then(res => res.data),
  // Reject at any active stage
  rejectApplication: (id) => api.put(`/admin/admissions/applications/${id}/reject`).then(res => res.data),
  deleteApplication: (id) => api.delete(`/admin/admissions/applications/${id}`).then(res => res.data),
};

// Simple helpers (like apiFetch but using Axios)
export const apiGet = (url) => api.get(url).then(res => res.data);
export const apiPost = (url, data) => api.post(url, data).then(res => res.data);
export const apiPut = (url, data) => api.put(url, data).then(res => res.data);
export const apiDelete = (url) => api.delete(url).then(res => res.data);

export const authAPI = {
  login: (credentials) => api.post('auth/login', credentials).then(res => res.data),
};

export const noticeAPI = {
  getAll: () => apiGet('/admin/notices'),
  getActive: () => apiGet('/public/notices'),
  create: (notice) => apiPost('/admin/notices', notice),
  update: (id, notice) => apiPut(`/admin/notices/${id}`, notice),
  delete: (id) => apiDelete(`/admin/notices/${id}`),
};

export const settingsAPI = {
  getPublic: () => apiGet('/public/settings'),
  getAllAdmin: () => apiGet('/admin/settings'),
  update: (setting) => apiPost('/admin/settings', setting),
  uploadImage: (key, file) => {
    const formData = new FormData();
    formData.append('key', key);
    formData.append('file', file);
    return api.post('/admin/settings/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  delete: (key) => apiDelete(`/admin/settings/${key}`),
};

export const landingSlidesAPI = {
  getPublic: () => apiGet('/public/landing-slides'),
  getAllAdmin: () => apiGet('/admin/landing-slides'),
  create: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/landing-slides', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  delete: (id) => apiDelete(`/admin/landing-slides/${id}`),
};

export const galleryAPI = {
  getPublicAlbums: () => apiGet('/public/gallery/albums'),
  getPublicItems: (albumId) => apiGet(`/public/gallery/albums/${albumId}/items`),
  getAllAlbums: () => apiGet('/admin/gallery/albums'),
  createAlbum: (name, description) => apiPost('/admin/gallery/albums', { name, description }),
  updateAlbum: (id, data) => apiPut(`/admin/gallery/albums/${id}`, data),
  deleteAlbum: (id) => apiDelete(`/admin/gallery/albums/${id}`),
  getItemsByAlbum: (albumId) => apiGet(`/admin/gallery/albums/${albumId}/items`),
  uploadItem: (albumId, file, title, description) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    return api.post(`/admin/gallery/albums/${albumId}/items`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  deleteItem: (id) => apiDelete(`/admin/gallery/items/${id}`),
};

export default api;