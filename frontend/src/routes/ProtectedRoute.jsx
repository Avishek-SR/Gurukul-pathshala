// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles = [] }) => {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Role guard
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;