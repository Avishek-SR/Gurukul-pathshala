import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './StudentLayout.css';

const StudentLayout = ({ onLogout }) => { // onLogout prop kept for compatibility
  const { logout } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

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

  // Fetch Student Data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch('/api/student/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          throw new Error('Failed to load student profile');
        }

        const data = await res.json();
        setStudent(data);
      } catch (error) {
        console.error('Error fetching student data:', error);
        // navigate('/login'); // Optional: redirect if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    if (onLogout) onLogout();
  };

  const navItems = [
    { path: '/student', label: 'Dashboard', icon: 'fa-home', end: true },
    { path: '/student/courses', label: 'My Subjects', icon: 'fa-book' },
    { path: '/student/assignments', label: 'Assignments', icon: 'fa-tasks' },
    { path: '/student/attendance', label: 'Attendance', icon: 'fa-calendar-check' },
    { path: '/student/timetable', label: 'Time Table', icon: 'fa-calendar-alt' },
    { path: '/student/fees', label: 'Fee Status', icon: 'fa-file-invoice-dollar' },
  ];

  const getPageTitle = () => {
    const currentItem = navItems.find(item =>
      item.path === location.pathname || (item.path !== '/student' && location.pathname.startsWith(item.path))
    );
    return currentItem?.label || 'Dashboard';
  };

  if (loading) {
    return (
      <div className="student-loading">
        <div className="student-spinner"></div>
        <p>Loading Student Portal...</p>
      </div>
    );
  }

  return (
    <div className="student-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && window.innerWidth <= 1024 && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`student-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="student-logo">
            <i className="fas fa-graduation-cap"></i>
            <h2>Student Portal</h2>
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
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              onClick={() => window.innerWidth <= 1024 && setSidebarOpen(false)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="student-profile-mini">
            <div className="mini-avatar">
              {student?.profilePictureUrl ? (
                <img
                  src={student.profilePictureUrl}
                  alt={student?.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>
                  {student?.name?.charAt(0) || 'S'}
                </span>
              )}
            </div>
            <div className="mini-details">
              <span>{student?.name?.split(' ')[0] || 'Student'}</span>
              <small>{student?.id || 'ID: 123'}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="student-main">
        {/* Header */}
        <header className="student-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
            <div className="breadcrumb">
              <span>Student</span>
              <i className="fas fa-chevron-right"></i>
              <span>{getPageTitle()}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="student-profile" ref={menuRef} onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              <div className="profile-trigger">
                <div className="profile-avatar">
                  {student?.profilePictureUrl ? (
                    <img
                      src={
                        student.profilePictureUrl?.startsWith('http')
                          ? student.profilePictureUrl
                          : `${student.profilePictureUrl}`
                      }
                      alt="Profile"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span>{student?.name?.charAt(0) || 'S'}</span>
                  )}
                </div>
                <i className={`fas fa-chevron-${profileMenuOpen ? 'up' : 'down'}`} style={{ fontSize: '0.8rem', color: '#666' }}></i>
              </div>

              {profileMenuOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-header">
                    <h4>{student?.name || 'Student'}</h4>
                    <p>{student?.email || 'student@school.com'}</p>
                  </div>
                  <div className="dropdown-items">
                    <Link to="/student/profile" className="dropdown-item">
                      <i className="fas fa-user-circle"></i>
                      <span>My Profile</span>
                    </Link>
                    <Link to="/student/settings" className="dropdown-item">
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
        <main className="student-content">
          <Outlet context={{ student }} />
        </main>

        {/* Footer */}
        <footer className="student-footer">
          <p>© {new Date().getFullYear()} Gurukul Pathshala Student Portal</p>
        </footer>
      </div>
    </div>
  );
};

export default StudentLayout;