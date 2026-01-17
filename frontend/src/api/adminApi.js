// src/api/adminApi.js
import axiosInstance from './axiosConfig';

export const adminApi = {
  // Dashboard statistics
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard/stats');
    return response.data;
  },

  // User management
  getAllUsers: async (params = {}) => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },

  // Course management
  getAllCourses: async () => {
    const response = await axiosInstance.get('/admin/courses');
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await axiosInstance.post('/admin/courses', courseData);
    return response.data;
  },

  // Department management
  getAllDepartments: async () => {
    const response = await axiosInstance.get('/admin/departments');
    return response.data;
  },

  // System settings
  getSystemSettings: async () => {
    const response = await axiosInstance.get('/admin/settings');
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await axiosInstance.put('/admin/settings', settings);
    return response.data;
  },

  // Backup management
  createBackup: async () => {
    const response = await axiosInstance.post('/admin/backup');
    return response.data;
  },

  // Import/Export data
  exportData: async (type) => {
    const response = await axiosInstance.get(`/admin/export/${type}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  importData: async (type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(
      `/admin/import/${type}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
};