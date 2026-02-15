import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './FacultyLayout.css';

const FacultyLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Responsive Check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-home', path: '/faculty', exact: true },
    { id: 'assignments', label: 'Assignments', icon: 'fa-file-alt', path: '/faculty/assignments' },
    { id: 'students', label: 'Students', icon: 'fa-user-graduate', path: '/faculty/students' },
    { id: 'attendance', label: 'Attendance', icon: 'fa-calendar-check', path: '/faculty/attendance' },
    { id: 'grades', label: 'Grades', icon: 'fa-chalkboard-teacher', path: '/faculty/grades' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line', path: '/faculty/analytics' },
    { id: 'timetable', label: 'Timetable', icon: 'fa-calendar-alt', path: '/faculty/timetable' }
  ];

  const getPageTitle = () => {
    const currentItem = navItems.find(item =>
      item.path === location.pathname || (item.path !== '/faculty' && location.pathname.startsWith(item.path))
    );
    return currentItem?.label || 'Dashboard';
  };

  return (
    <div className="faculty-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && window.innerWidth <= 1024 && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`faculty-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="faculty-logo">
            <i className="fas fa-chalkboard-teacher"></i>
            <h2>Faculty Portal</h2>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
          </button>
        </div>

        <div className="sidebar-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              onClick={() => window.innerWidth <= 1024 && setSidebarOpen(false)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="faculty-profile-mini">
            <div className="mini-avatar">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="mini-details">
              <span>{user?.name?.split(' ')[0] || 'Faculty'}</span>
              <small>{user?.role || 'PROFESSOR'}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="faculty-main">
        {/* Header */}
        <header className="faculty-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
            <div className="breadcrumb">
              <span>Faculty</span>
              <i className="fas fa-chevron-right"></i>
              <span>{getPageTitle()}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="faculty-profile" ref={menuRef} onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              <div className="profile-trigger">
                <div className="profile-avatar">
                  {user?.profilePictureUrl ? (
                    <img
                      src={
                        user.profilePictureUrl.startsWith('http')
                          ? user.profilePictureUrl
                          : `${user.profilePictureUrl}`
                      }
                      alt="Profile"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="profile-placeholder">
                      {user?.name?.charAt(0) || 'F'}
                    </div>
                  )}
                </div>
                <i className={`fas fa-chevron-${profileMenuOpen ? 'up' : 'down'}`} style={{ fontSize: '0.8rem', color: '#666' }}></i>
              </div>

              {profileMenuOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-header">
                    <h4>{user?.name || 'Faculty Member'}</h4>
                    <p>{user?.email || 'faculty@gurukul.edu'}</p>
                  </div>
                  <div className="dropdown-items">
                    <Link to="/faculty/profile" className="dropdown-item">
                      <i className="fas fa-user-circle"></i>
                      <span>My Profile</span>
                    </Link>
                    <Link to="/faculty/settings" className="dropdown-item">
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </Link>
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

        {/* Content Outlet */}
        <main className="faculty-content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="faculty-footer">
          <p>© {new Date().getFullYear()} Gurukul Pathshala Faculty Portal</p>
        </footer>
      </div>
    </div>
  );
};

export default FacultyLayout;