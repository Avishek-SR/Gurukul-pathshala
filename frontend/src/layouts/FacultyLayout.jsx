import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './FacultyLayout.css';
import {
  Home,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Settings,
  Bell,
  UserCircle,
  ChevronDown,
  LogOut,
  Search,
  Menu,
  X,
  Calendar,
  MessageSquare,
  HelpCircle,
  Award,
  Eye,
  Clock,
  GraduationCap,
  Library,
  Mail,
  ChevronRight
} from 'lucide-react';


const FacultyLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home size={20} />,
      path: '/faculty',
      exact: true
    },
    {
      id: 'courses',
      label: 'My Courses',
      icon: <BookOpen size={20} />,
      path: '/faculty/courses',
      description: 'Manage your courses'
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: <FileText size={20} />,
      path: '/faculty/assignments',
      description: 'Create & grade assignments'
    },
    {
      id: 'students',
      label: 'Students',
      icon: <Users size={20} />,
      path: '/faculty/students',
      description: 'Student management'
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <Clock size={20} />,
      path: '/faculty/attendance',
      description: 'Track student attendance'
    },
    {
      id: 'grades',
      label: 'Grades',
      icon: <Award size={20} />,
      path: '/faculty/grades',
      description: 'Grade management'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 size={20} />,
      path: '/faculty/analytics',
      description: 'Performance insights'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar size={20} />,
      path: '/faculty/calendar',
      description: 'Schedule & events'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      id: 'new-course',
      label: 'New Course',
      icon: <BookOpen size={18} />,
      action: () => navigate('/faculty/courses/new')
    },
    {
      id: 'grade-assignment',
      label: 'Grade Assignment',
      icon: <FileText size={18} />,
      action: () => navigate('/faculty/assignments/grade')
    },
    {
      id: 'take-attendance',
      label: 'Take Attendance',
      icon: <Clock size={18} />,
      action: () => navigate('/faculty/attendance/take')
    },
    {
      id: 'send-announcement',
      label: 'Send Announcement',
      icon: <MessageSquare size={18} />,
      action: () => navigate('/faculty/announcements/new')
    }
  ];

  // Get current page title
  const getPageTitle = () => {
    const currentItem = navItems.find(item => 
      location.pathname.startsWith(item.path)
    );
    return currentItem?.label || 'Dashboard';
  };

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Start with Home
    breadcrumbs.push({ label: 'Home', path: '/' });
    
    // Add Faculty
    breadcrumbs.push({ label: 'Faculty', path: '/faculty' });
    
    // Add current page if not dashboard
    const currentItem = navItems.find(item => 
      location.pathname.startsWith(item.path) && item.id !== 'dashboard'
    );
    
    if (currentItem) {
      breadcrumbs.push({ 
        label: currentItem.label, 
        path: currentItem.path 
      });
    }
    
    return breadcrumbs;
  };

  return (
    <div className="faculty-layout">
      {/* Header */}
      <header className="faculty-layout__header">
        <div className="faculty-layout__header-container">
          {/* Left: Logo & Menu Toggle */}
          <div className="faculty-layout__header-left">
            <button 
              className="faculty-layout__menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="faculty-layout__logo">
              <GraduationCap className="faculty-layout__logo-icon" size={28} />
              <div>
                <h1 className="faculty-layout__logo-text">Gurukul LMS</h1>
                <p className="faculty-layout__logo-subtext">Faculty Portal</p>
              </div>
            </div>
          </div>

          {/* Center: Search */}
          <div className="faculty-layout__header-center">
            <div className="faculty-layout__search-wrapper">
              <Search className="faculty-layout__search-icon" size={20} />
              <input
                type="text"
                placeholder="Search courses, students, assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="faculty-layout__search-input"
              />
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="faculty-layout__header-right">
            {/* Quick Action Buttons */}
            <div className="faculty-layout__quick-actions">
              {quickActions.slice(0, 2).map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="faculty-layout__quick-action-btn"
                  title={action.label}
                >
                  {action.icon}
                  <span className="faculty-layout__action-label">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Notifications */}
            <button className="faculty-layout__notification-btn">
              <Bell size={22} />
              <span className="faculty-layout__notification-badge">3</span>
            </button>

            {/* User Profile */}
            <div className="faculty-layout__user-profile">
              <button 
                className="faculty-layout__user-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div className="faculty-layout__user-avatar">
                  <UserCircle size={36} />
                </div>
                <div className="faculty-layout__user-info">
                  <span className="faculty-layout__user-name">{user?.name || 'Faculty Member'}</span>
                  <span className="faculty-layout__user-role">Professor</span>
                </div>
                <ChevronDown className={`faculty-layout__dropdown-icon ${isUserDropdownOpen ? 'open' : ''}`} size={18} />
              </button>

              {/* User Dropdown */}
              {isUserDropdownOpen && (
                <div className="faculty-layout__user-dropdown">
                  <div className="faculty-layout__dropdown-header">
                    <div className="faculty-layout__dropdown-avatar">
                      <UserCircle size={48} />
                    </div>
                    <div>
                      <h3>{user?.name || 'Faculty Member'}</h3>
                      <p>{user?.email || 'faculty@gurukul.edu'}</p>
                      <span className="faculty-layout__user-department">Department of Computer Science</span>
                    </div>
                  </div>
                  
                  <div className="faculty-layout__dropdown-menu">
                    <Link to="/faculty/profile" className="faculty-layout__dropdown-item">
                      <UserCircle size={18} />
                      My Profile
                    </Link>
                    <Link to="/faculty/settings" className="faculty-layout__dropdown-item">
                      <Settings size={18} />
                      Settings
                    </Link>
                    <Link to="/faculty/help" className="faculty-layout__dropdown-item">
                      <HelpCircle size={18} />
                      Help & Support
                    </Link>
                    <button onClick={handleLogout} className="faculty-layout__dropdown-item faculty-layout__logout">
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="faculty-layout__overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="faculty-layout__container">
        {/* Sidebar */}
        <aside className={`faculty-layout__sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="faculty-layout__sidebar-header">
            <div className="faculty-layout__sidebar-user">
              <div className="faculty-layout__sidebar-avatar">
                <UserCircle size={48} />
              </div>
              <div className="faculty-layout__sidebar-user-info">
                <h3>{user?.name || 'Dr. John Smith'}</h3>
                <p>Computer Science Department</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="faculty-layout__sidebar-nav">
            <div className="faculty-layout__nav-section">
              <h3 className="faculty-layout__nav-section-title">Navigation</h3>
              <ul className="faculty-layout__nav-list">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      end={item.exact}
                      className={({ isActive }) => 
                        `faculty-layout__nav-link ${isActive ? 'active' : ''}`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="faculty-layout__nav-icon">{item.icon}</span>
                      <div className="faculty-layout__nav-content">
                        <span className="faculty-layout__nav-label">{item.label}</span>
                        {item.description && (
                          <span className="faculty-layout__nav-description">{item.description}</span>
                        )}
                      </div>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div className="faculty-layout__nav-section">
              <h3 className="faculty-layout__nav-section-title">Quick Links</h3>
              <div className="faculty-layout__quick-links">
                <Link to="/faculty/timetable" className="faculty-layout__quick-link">
                  <Calendar size={18} />
                  <span>Timetable</span>
                </Link>
                <Link to="/faculty/library" className="faculty-layout__quick-link">
                  <Library size={18} />
                  <span>Library</span>
                </Link>
                <Link to="/faculty/reports" className="faculty-layout__quick-link">
                  <BarChart3 size={18} />
                  <span>Reports</span>
                </Link>
              </div>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="faculty-layout__sidebar-footer">
            <div className="faculty-layout__system-status">
              <div className="faculty-layout__status-indicator active"></div>
              <span>System Active</span>
            </div>
            <Link to="/faculty/help" className="faculty-layout__help-link">
              <HelpCircle size={18} />
              <span>Need Help?</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="faculty-layout__main-content">
          {/* Breadcrumb */}
          <div className="faculty-layout__breadcrumb-container">
            <nav className="faculty-layout__breadcrumb">
              {getBreadcrumbs().map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <ChevronRight size={16} className="faculty-layout__breadcrumb-separator" />}
                  <Link to={crumb.path} className="faculty-layout__breadcrumb-item">
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
            
            {/* Page Title */}
            <div className="faculty-layout__page-header">
              <h1 className="faculty-layout__page-title">{getPageTitle()}</h1>
              {location.pathname === '/faculty' && (
                <p className="faculty-layout__page-subtitle">Welcome back! Here's what's happening today.</p>
              )}
            </div>
          </div>

          {/* Page Content (Outlet for all pages) */}
          <div className="faculty-layout__content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="faculty-layout__footer">
        <div className="faculty-layout__footer-container">
          <div className="faculty-layout__footer-left">
            <div className="faculty-layout__footer-logo">
              <GraduationCap size={20} />
              <span>Gurukul Learning Management System</span>
            </div>
            <p className="faculty-layout__footer-copyright">
              © {new Date().getFullYear()} Gurukul University. All rights reserved.
            </p>
          </div>
          
          <div className="faculty-layout__footer-right">
            <div className="faculty-layout__footer-links">
              <Link to="/faculty/privacy">Privacy Policy</Link>
              <Link to="/faculty/terms">Terms of Service</Link>
              <Link to="/faculty/contact">Contact IT Support</Link>
            </div>
            <div className="faculty-layout__footer-actions">
              <button className="faculty-layout__footer-btn">
                <Mail size={16} />
                <span>Email Admin</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FacultyLayout;