// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(sessionStorage.getItem('token'));

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');

      // If no token, do NOT call backend
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await authApi.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // FIX: authApi.login ALREADY returns response.data
      // So 'data' variable holds the actual payload.
      const data = await authApi.login(credentials);

      if (!data) {
        throw new Error('Invalid response from server');
      }

      // Backend returns accessToken and user fields separately
      // ROBUST CHECK: Check all possible token field names
      const token = data.accessToken || data.token || data.jwt;

      if (!token) {
        console.error('Missing token in response:', data);
        throw new Error('No access token received from server');
      }

      const user = {
        id: data.id,
        userId: data.userId || data.id,
        name: data.name,
        role: data.role,
        email: data.email,
        superAdmin: data.superAdmin,
        permissions: data.permissions,
        profilePictureUrl: data.profilePictureUrl
      };

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      // Handle axios error vs standard error
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authApi.updateProfile(profileData);
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update profile failed:', error);
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  };

  // Lightweight helper — merges partial data into the user state and sessionStorage.
  // Use after a successful profile update so the navbar/sidebar avatar refreshes.
  const updateUser = (partialData) => {
    setUser(prev => {
      const merged = { ...prev, ...partialData };
      sessionStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateProfile,
    updateUser,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'FACULTY', // Backend uses FACULTY, not TEACHER
    isStudent: user?.role === 'STUDENT',
    isParent: user?.role === 'PARENT'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};