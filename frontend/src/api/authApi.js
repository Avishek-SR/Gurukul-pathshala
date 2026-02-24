// src/api/authApi.js
import axiosInstance from './axiosConfig';

export const authApi = {
  // Login with email and password
  login: async (credentials) => {
    const response = await axiosInstance.post('auth/login', credentials);
    return response.data;
  },

  // Register new user (admin only)
  register: async (userData) => {
    const response = await axiosInstance.post('auth/register', userData);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await axiosInstance.get('auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axiosInstance.put('auth/change-password', passwordData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axiosInstance.post('auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await axiosInstance.post('auth/refresh-token');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetData) => {
    const response = await axiosInstance.post('auth/reset-password', resetData);
    return response.data;
  }
};