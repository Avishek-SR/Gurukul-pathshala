import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import './AdminLayout.css';
import StudentManagement from '../pages/admin/users/ManageUsers/student/StudentManagement';
import FacultyManagement from '../pages/admin/users/ManageUsers/faculty/FacultyManagement';

import AdminDashboard from '../pages/admin/dashboard/AdminDashboard';
import CourseManagement from '../pages/admin/courses/CourseManagement';
import AttendanceManagement from '../pages/admin/attendance/AttendanceManagement';
import AdminSettings from '../pages/admin/settings/AdminSettings';
import Reports from '../pages/admin/reports/Reports';
import AdminProfile from '../pages/admin/profile/AdminProfile';
import AdminManagement from '../pages/admin/users/ManageUsers/admin/AdminManagement';
import AllUsersManagement from '../pages/admin/users/ManageUsers/AllUsersManagement';
import PublicFacultyManagement from '../pages/admin/users/ManageUsers/faculty/PublicFacultyManagement';
import GlobalActivityLog from '../pages/admin/dashboard/components/GlobalActivityLog';
import AdminActivities from '../pages/admin/activities/AdminActivities';
import TimetableManagement from '../pages/admin/timetable/TimetableManagement';
import NoticeManagement from '../pages/admin/notices/NoticeManagement';


const AdminLayout = ({ onLogout }) => {
  const { user: admin, loading: authLoading, logout } = useAuth(); // Use global auth context
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => { // Use async
    await logout(); // Use context logout
    if (onLogout) onLogout();
  };



  // Check screen size for initial state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when navigating
  const handleMenuClick = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  if (authLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading Admin Portal...</p>
      </div>
    );
  }

  // Prevent rendering if not admin
  if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'ROLE_ADMIN')) {
    return null; // Or a friendly "Access Denied" message if the redirect is slow
  }

  return (
    <div className="admin-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && window.innerWidth <= 1024 && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

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
            onClick={() => handleMenuClick('dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </div>

          {(admin?.superAdmin || admin?.permissions?.includes('MANAGE_STUDENTS')) && (
            <div
              className={`menu-item ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => handleMenuClick('students')}
            >
              <i className="fas fa-user-graduate"></i>
              <span>Students</span>
            </div>
          )}

          {(admin?.superAdmin || admin?.permissions?.includes('MANAGE_ADMINS')) && (
            <div
              className={`menu-item ${activeTab === 'admins' ? 'active' : ''}`}
              onClick={() => handleMenuClick('admins')}
            >
              <i className="fas fa-user-shield"></i>
              <span>Admins</span>
            </div>
          )}

          {(admin?.superAdmin || admin?.permissions?.includes('MANAGE_FACULTY')) && (
            <>
              <div
                className={`menu-item ${activeTab === 'faculty' ? 'active' : ''}`}
                onClick={() => handleMenuClick('faculty')}
              >
                <i className="fas fa-chalkboard-teacher"></i>
                <span>Faculty DB</span>
              </div>
              <div
                className={`menu-item ${activeTab === 'public-faculty' ? 'active' : ''}`}
                onClick={() => handleMenuClick('public-faculty')}
              >
                <i className="fas fa-id-card"></i>
                <span>Public Faculty</span>
              </div>
            </>
          )}

          <div
            className={`menu-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => handleMenuClick('courses')}
          >
            <i className="fas fa-book"></i>
            <span>Courses</span>
          </div>

          <div
            className={`menu-item ${activeTab === 'timetable' ? 'active' : ''}`}
            onClick={() => handleMenuClick('timetable')}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>Timetable</span>
          </div>

          <div
            className={`menu-item ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => handleMenuClick('activities')}
          >
            <i className="fas fa-tasks"></i>
            <span>Classroom Activity</span>
          </div>

          <div
            className={`menu-item ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => handleMenuClick('notices')}
          >
            <i className="fas fa-bullhorn"></i>
            <span>Notices</span>
          </div>

          <div
            className={`menu-item ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => handleMenuClick('attendance')}
          >
            <i className="fas fa-calendar-check"></i>
            <span>Attendance</span>
          </div>

          <div
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleMenuClick('settings')}
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </div>

          <div
            className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleMenuClick('reports')}
          >
            <i className="fas fa-chart-bar"></i>
            <span>Reports</span>
          </div>

          <div
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleMenuClick('profile')}
          >
            <i className="fas fa-user-circle"></i>
            <span>Profile</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="admin-profile-mini">
            <div className="mini-avatar">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="mini-details">
              <span>{admin?.name?.split(' ')[0] || 'Admin'}</span>
              <small style={{ display: 'block', fontSize: '10px' }}>{admin?.userId}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="page-title">
              {activeTab === 'activities' ? 'Classroom Activity' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <div className="breadcrumb">
              <span>Admin</span>
              <i className="fas fa-chevron-right"></i>
              <span>{activeTab}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="admin-profile" ref={menuRef} onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              <div className="profile-trigger">
                <div className="profile-avatar">
                  {admin?.profilePictureUrl ? (
                    <img
                      src={
                        admin.profilePictureUrl?.startsWith('http')
                          ? admin.profilePictureUrl
                          : `${admin.profilePictureUrl}`
                      }
                      alt="Profile"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="fas fa-user-shield"></i>
                  )}
                </div>
                <i className={`fas fa-chevron-${profileMenuOpen ? 'up' : 'down'}`} style={{ fontSize: '0.8rem', color: '#666' }}></i>
              </div>

              {profileMenuOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-header">
                    <h4>{admin?.name || 'Administrator'}</h4>
                    <p>{admin?.email || 'admin@gurukul.com'}</p>
                  </div>
                  <div className="dropdown-items">
                    <button className="dropdown-item" onClick={() => setActiveTab('profile')}>
                      <i className="fas fa-user-circle"></i>
                      <span>My Profile</span>
                    </button>
                    <button className="dropdown-item" onClick={() => setActiveTab('settings')}>
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </button>
                    <div style={{ height: '1px', background: '#eee', margin: '5px 0' }}></div>
                    <button className="dropdown-item logout" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          {activeTab === 'dashboard' && <AdminDashboard onNavigate={setActiveTab} />}
          {activeTab === 'students' && <StudentManagement currentUser={admin} />}
          {activeTab === 'admins' && <AdminManagement currentUser={admin} />}
          {activeTab === 'faculty' && <FacultyManagement currentUser={admin} />}
          {activeTab === 'public-faculty' && <PublicFacultyManagement currentUser={admin} />}
          {activeTab === 'courses' && <CourseManagement />}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'profile' && <AdminProfile />}
          {activeTab === 'all-users' && <AllUsersManagement />}
          {activeTab === 'global-activity' && <GlobalActivityLog />}
          {activeTab === 'timetable' && <TimetableManagement />}
          {activeTab === 'timetable' && <TimetableManagement />}
          {activeTab === 'activities' && <AdminActivities />}
          {activeTab === 'notices' && <NoticeManagement />}
        </main>

        {/* Footer */}
        <footer className="admin-footer">
          <p>© {new Date().getFullYear()} Gurukul Pathshala Admin Panel</p>
        </footer>
      </div>
    </div >
  );
};

export default AdminLayout;