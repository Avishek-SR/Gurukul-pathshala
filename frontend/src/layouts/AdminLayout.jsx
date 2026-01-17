import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLayout.css';
import StudentManagement from '../pages/admin/users/ManageUsers/student/StudentManagement';
import FacultyManagement from '../pages/admin/users/ManageUsers/faculty/FacultyManagement';

import AdminDashboard from '../pages/admin/dashboard/AdminDashboard';
import CourseManagement from '../pages/admin/courses/CourseManagement';
import AttendanceManagement from '../pages/admin/attendance/AttendanceManagement';
import AdminSettings from '../pages/admin/settings/AdminSettings';
import Reports from '../pages/admin/reports/Reports';



const AdminLayout = ({ onLogout }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();

  // Fetch admin data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (!token || !userRaw) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userRaw);

      setAdmin({
        id: userData.userId,
        name: userData.name,
        email: userData.email || `${userData.userId}@gurukul.com`,
        role: userData.role
      });
    } catch (error) {
      console.error('Error reading admin data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (onLogout) onLogout();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading Admin Portal...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <i className="fas fa-crown"></i>
            <h2>Admin Panel</h2>
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
          </button>
        </div>

        <div className="sidebar-menu">
          <div 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </div>
          
          <div 
            className={`menu-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <i className="fas fa-graduation-cap"></i>
            <span>Students</span>
          </div>
          
          <div 
            className={`menu-item ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => setActiveTab('faculty')}
          >
            <i className="fas fa-chalkboard-teacher"></i>
            <span>Faculty</span>
          </div>
          
          <div 
            className={`menu-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <i className="fas fa-book"></i>
            <span>Courses</span>
          </div>
          
          <div 
            className={`menu-item ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <i className="fas fa-calendar-check"></i>
            <span>Attendance</span>
          </div>
          
          <div 
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </div>
          
          <div 
            className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="fas fa-chart-bar"></i>
            <span>Reports</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="admin-profile-mini">
            <div className="mini-avatar">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="mini-details">
              <span>{admin?.name?.split(' ')[0] || 'Admin'}</span>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <div className="breadcrumb">
              <span>Admin</span>
              <i className="fas fa-chevron-right"></i>
              <span>{activeTab}</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="admin-profile">
              <div className="profile-info">
                <h4>{admin?.name || 'Administrator'}</h4>
                <p>{admin?.email || 'admin@gurukul.com'}</p>
              </div>
              <div className="profile-avatar">
                <i className="fas fa-user-shield"></i>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'students' && <StudentManagement />}
          {activeTab === 'faculty' && <FacultyManagement />}
          {activeTab === 'courses' && <CourseManagement />}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'reports' && <Reports />}
        </main>

        {/* Footer */}
        <footer className="admin-footer">
          <p>© {new Date().getFullYear()} Gurukul Pathshala Admin Panel</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;