// src/pages/admin/dashboard/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { apiGet } from '../../../services/api';
import {
  FaUsers,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaMoneyBillWave,
  FaExclamationTriangle,
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet('/admin/dashboard');
        setStats(data);
      } catch (e) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="admin-dashboard"><p className="muted">Loading dashboard...</p></div>;
  }

  if (error) {
    return <div className="admin-dashboard"><p className="error">{error}</p></div>;
  }

  if (!stats) {
    return <div className="admin-dashboard"><p className="muted">No data available.</p></div>;
  }

  const cards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <FaUsers />,
    },
    {
      title: 'Total Faculty',
      value: stats.totalFaculty,
      icon: <FaChalkboardTeacher />,
    },
    {
      title: 'Active Courses',
      value: stats.activeCourses,
      icon: <FaGraduationCap />,
    },
    {
      title: 'Revenue',
      value: `₹${stats.revenue}`,
      icon: <FaMoneyBillWave />,
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: <FaExclamationTriangle />,
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>System overview based on live data</p>
      </div>

      <div className="stats-grid">
        {cards.map((c, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-info">
              <h3>{c.value}</h3>
              <span>{c.title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-note">
        <p>
          Charts and activity feeds will appear automatically once their backend
          modules (attendance, revenue, activities) are implemented.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;