import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { settingsAPI, noticeAPI } from "../services/api";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  const [showSearch, setShowSearch] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    site_logo_text: 'Gurukul Pathshala',
    contact_email: 'gurukulpathshala76@gmail.com',
    contact_phone: '+977-9819782671',
    contact_address: 'Lahan-8, Nepal'
  });

  const searchRef = useRef(null);
  const userRef = useRef(null);
  const navMenuRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Fetch settings
    const fetchSettings = async () => {
      try {
        const data = await settingsAPI.getPublic();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };
    fetchSettings();

    // Fetch Notices
    const fetchNotices = async () => {
      try {
        const data = await noticeAPI.getActive();
        setNotices(data);
      } catch (err) {
        console.error("Failed to fetch notices", err);
      }
    };
    fetchNotices();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearch && searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (showUser && userRef.current && !userRef.current.contains(event.target)) {
        setShowUser(false);
      }
      if (showNavMenu && navMenuRef.current && !navMenuRef.current.contains(event.target)) {
        setShowNavMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch, showUser, showNavMenu]);

  const handleHomeClick = () => {
    if (showNavMenu) {
      setShowNavMenu(false);
    }
  };


  return (
    <div className="main-layout-wrapper">
      <header className="main-layout-header">
        <div className="main-layout-logo-section">
          <div className="main-layout-logo">
            <i className="fas fa-atom"></i>
          </div>
          <span className="main-layout-title">{settings.site_logo_text}</span>
        </div>

        {!isMobile && (
          <nav className="main-layout-desktop-nav">
            <NavLink to="/" className="main-layout-nav-link" onClick={handleHomeClick}>Home</NavLink>

            <NavLink to="/admissions" className="main-layout-nav-link">Admissions</NavLink>
            <NavLink to="/academics" className="main-layout-nav-link">Academics</NavLink>
            <NavLink to="/notices" className="main-layout-nav-link">Notices</NavLink>
            <NavLink to="/our-faculty" className="main-layout-nav-link">Faculty</NavLink>
            <NavLink to="/gallery" className="main-layout-nav-link">Gallery</NavLink>
            <NavLink to="/about" className="main-layout-nav-link">About</NavLink>
            <NavLink to="/contact" className="main-layout-nav-link">Contact</NavLink>
          </nav>
        )}

        <div className="main-layout-icon-section">
          <div className="main-layout-icon-dropdown" ref={searchRef}>
            <i className="fas fa-search main-layout-icon" onClick={() => setShowSearch(!showSearch)} />
            {showSearch && (
              <div className="main-layout-dropdown-menu main-layout-search-menu">
                <input type="text" placeholder="Search notices, events..." className="main-layout-search-input" />
              </div>
            )}
          </div>

          <div className="main-layout-icon-dropdown" ref={userRef}>
            <i className="fas fa-user main-layout-icon" onClick={() => setShowUser(!showUser)} />
            {showUser && (
              <ul className="main-layout-dropdown-menu main-layout-user-menu">
                <li>
                  <NavLink
                    to="/login"
                    className="main-layout-dropdown-link"
                    onClick={() => setShowUser(false)}
                  >
                    Faculty Login
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/parent/login"
                    className="main-layout-dropdown-link"
                    onClick={() => setShowUser(false)}
                  >
                    Parent Login
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className="main-layout-dropdown-link"
                    onClick={() => setShowUser(false)}
                  >
                    Student Login
                  </NavLink>
                </li>
              </ul>
            )}
          </div>

          {isMobile && (
            <div className="main-layout-icon-dropdown" ref={navMenuRef}>
              <i className="fas fa-bars main-layout-icon" onClick={() => setShowNavMenu(!showNavMenu)} />
              {showNavMenu && (
                <ul className="main-layout-dropdown-menu main-layout-nav-menu">
                  <li>
                    <NavLink to="/" className="main-layout-dropdown-link" onClick={handleHomeClick}>Home</NavLink>
                  </li>
                  <li><NavLink to="/about" className="main-layout-dropdown-link">About</NavLink></li>
                  <li><NavLink to="/admissions" className="main-layout-dropdown-link">Admissions</NavLink></li>
                  <li><NavLink to="/academics" className="main-layout-dropdown-link">Academics</NavLink></li>
                  <li><NavLink to="/notices" className="main-layout-dropdown-link">Notices</NavLink></li>
                  <li><NavLink to="/our-faculty" className="main-layout-dropdown-link">Faculty</NavLink></li>
                  <li><NavLink to="/gallery" className="main-layout-dropdown-link">Gallery</NavLink></li>
                  <li><NavLink to="/contact" className="main-layout-dropdown-link">Contact</NavLink></li>
                </ul>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Global Notice Bar for Public Landing Page */}
      {notices.length > 0 && (
        <div className="public-notice-bar" style={{
          background: 'linear-gradient(135deg, var(--primary-medium), var(--primary-accent))',
          color: 'white',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          position: 'sticky',
          top: '80px', // Assuming header is around 80px high
          zIndex: 990
        }}>
          <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-bullhorn"></i> Important:
          </div>
          <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'inline-block', animation: 'scrollNotice 35s linear infinite', paddingLeft: '100%' }}>
              {notices.map((n, i) => (
                <React.Fragment key={n.id}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '4px', marginRight: '6px', color: '#fff' }}>{n.type || 'NOTICE'}</span>
                  <span style={{ fontSize: '0.9rem', marginRight: '6px', color: '#fff' }}>{n.title}</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.9, color: '#fff' }}>({new Date(n.publishDate).toLocaleDateString()})</span>
                  {i < notices.length - 1 && <span style={{ margin: '0 15px', color: 'rgba(255,255,255,0.5)' }}>|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <span onClick={() => navigate('/notices')} style={{ cursor: 'pointer', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold', padding: '4px 12px', border: '1px solid white', borderRadius: '4px', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary-medium)' }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white' }}>
              View All
            </span>
          </div>
          <style>
            {`
              @keyframes scrollNotice {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
              }
            `}
          </style>
        </div>
      )}

      <main className="main-layout-content">{children}</main>

      <footer className="main-layout-footer">
        <div className="main-layout-container">
          <div className="main-layout-footer-content">
            <div className="main-layout-footer-brand">
              <div className="main-layout-footer-logo">
                <i className="fas fa-atom"></i>
              </div>
              <h3>{settings.site_logo_text.toUpperCase()}</h3>
              <p>{settings.contact_address}</p>
            </div>

            <div className="main-layout-footer-links">
              <div className="main-layout-footer-column">
                <h4>Contact Us</h4>
                <p><i className="fas fa-map-marker-alt"></i> {settings.contact_address}</p>
                <p><i className="fas fa-envelope"></i> {settings.contact_email}</p>
                <p><i className="fas fa-phone"></i> {settings.contact_phone}</p>
              </div>

              <div className="main-layout-footer-column">
                <h4>Quick Links</h4>
                <ul>
                  <li><Link to="/admissions">Admissions</Link></li>
                  <li><Link to="/gallery">Gallery</Link></li>
                  <li><Link to="/our-faculty">Faculty</Link></li>
                  <li><Link to="/academics">Academics</Link></li>
                </ul>
              </div>

              <div className="main-layout-footer-column">
                <h4>Follow Us</h4>
                <div className="main-layout-social-icons">
                  <a href="#"><i className="fab fa-facebook"></i></a>
                  <a href="#"><i className="fab fa-instagram"></i></a>
                  <a href="#"><i className="fab fa-youtube"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                </div>
                <p>Connect with us on social media</p>
              </div>
            </div>
          </div>

          <div className="main-layout-footer-bottom">
            <p>© {new Date().getFullYear()} {settings.site_logo_text}. All Rights Reserved.</p>
            <div className="main-layout-footer-terms">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}