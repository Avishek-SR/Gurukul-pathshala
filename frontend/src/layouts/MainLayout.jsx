import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  const [showSearch, setShowSearch] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const searchRef = useRef(null);
  const userRef = useRef(null);
  const navMenuRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
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
          <span className="main-layout-title">Gurukul Pathshala</span>
        </div>

        {!isMobile && (
          <nav className="main-layout-desktop-nav">
            <NavLink to="/" className="main-layout-nav-link" onClick={handleHomeClick}>Home</NavLink>
            
            <NavLink to="/admissions" className="main-layout-nav-link">Admissions</NavLink>
            <NavLink to="/academics" className="main-layout-nav-link">Academics</NavLink>
            <NavLink to="/faculty" className="main-layout-nav-link">Faculty</NavLink>
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
                  <li><NavLink to="/faculty" className="main-layout-dropdown-link">Faculty</NavLink></li>
                  <li><NavLink to="/gallery" className="main-layout-dropdown-link">Gallery</NavLink></li>
                  <li><NavLink to="/contact" className="main-layout-dropdown-link">Contact</NavLink></li>
                </ul>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="main-layout-content">{children}</main>

      <footer className="main-layout-footer">
        <div className="main-layout-container">
          <div className="main-layout-footer-content">
            <div className="main-layout-footer-brand">
              <div className="main-layout-footer-logo">
                <i className="fas fa-atom"></i>
              </div>
              <h3>GURUKUL PATHSHALA</h3>
              <p>Lahan-8, Nepal</p>
            </div>
            
            <div className="main-layout-footer-links">
              <div className="main-layout-footer-column">
                <h4>Contact Us</h4>
                <p><i className="fas fa-map-marker-alt"></i> Gurukul Pathshala, Lahan-8, Nepal</p>
                <p><i className="fas fa-envelope"></i> gurukulpathshala76@gmail.com</p>
                <p><i className="fas fa-phone"></i> +977-9819782671</p>
              </div>
              
              <div className="main-layout-footer-column">
                <h4>Quick Links</h4>
                <ul>
                  <li><a href="/AdmissionsPage">Admissions</a></li>
                  <li><a href="/GalleryPage">Gallery</a></li>
                  <li><a href="/FacultyPage">Faculty</a></li>
                  <li><a href="/AcademicsPage">Academics</a></li>
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
            <p>© 2025 Gurukul Pathshala. All Rights Reserved.</p>
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