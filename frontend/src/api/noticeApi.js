// src/api/noticeApi.js
import axiosInstance from './axiosConfig';

export const noticeApi = {
  // Get all notices (with pagination)
  getAllNotices: async (params = {}) => {
    const response = await axiosInstance.get('/notices', { params });
    return response.data;
  },

  // Get notice by ID
  getNoticeById: async (noticeId) => {
    const response = await axiosInstance.get(`/notices/${noticeId}`);
    return response.data;
  },

  // Create new notice
  createNotice: async (noticeData) => {
    const response = await axiosInstance.post('/notices', noticeData);
    return response.data;
  },

  // Update notice
  updateNotice: async (noticeId, noticeData) => {
    const response = await axiosInstance.put(`/notices/${noticeId}`, noticeData);
    return response.data;
  },

  // Delete notice
  deleteNotice: async (noticeId) => {
    const response = await axiosInstance.delete(`/notices/${noticeId}`);
    return response.data;
  },

  // Get latest notices (homepage)
  getLatestNotices: async (limit = 5) => {
    const response = await axiosInstance.get('/notices/latest', { params: { limit } });
    return response.data;
  },

  // Get notices by type
  getNoticesByType: async (type) => {
    const response = await axiosInstance.get('/notices/type', { params: { type } });
    return response.data;
  },

  // Upload notice attachment
  uploadAttachment: async (noticeId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(
      `/notices/${noticeId}/attachment`,
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