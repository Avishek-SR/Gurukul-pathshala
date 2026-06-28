import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../../contexts/AuthContext';
import axios from '../../../api/axiosConfig'; // Import configured axios instance for Captcha
import logo from '../../../assets/logo.svg';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth(); // Use global auth context

  // Redirect logic if already logged in (Synced with AuthContext)
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user.role);
    }
  }, [isAuthenticated, user]);

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const redirectUser = (role) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'FACULTY':
        navigate('/faculty');
        break;
      case 'STUDENT':
        navigate('/student');
        break;
      default:
        navigate('/');
    }
  };

  const refreshCaptcha = async () => {
    try {
      const res = await axios.get('public/captcha');
      const data = res.data;
      setCaptcha(data.code);
      setCaptchaId(data.id);
      setCaptchaInput('');
    } catch (e) {
      console.error("Captcha load error:", e);
      setError('Could not connect to server. Make sure the backend is running on port 8080.');
    }
  };

  const handleLogin = async () => {
    setError('');

    if (!userId || !password || !captchaInput) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      // Use AuthContext login to ensure Global State is synced with LocalStorage
      const result = await login({
        userId,
        password,
        captchaId,
        captchaValue: captchaInput
      });

      if (result.success) {
        // Clear sensitive data
        setUserId('');
        setPassword('');
        setCaptchaInput('');
        refreshCaptcha();

        console.log('Login successful, User:', result.user);

        // Redirect based on the FRESH user object from Context
        setLoading(false);
        redirectUser(result.user.role);
      } else {
        setError(result.error);
        refreshCaptcha();
        setLoading(false);
      }

    } catch (e) {
      console.error("Login Exception:", e);
      setError('An unexpected error occurred during login.');
      refreshCaptcha();
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  /* REMOVED GLOBAL KEYPRESS LISTENER causing double submission */

  const onSubmit = (e) => {
    e.preventDefault();
    if (!loading) {
      handleLogin();
    }
  };

  return (
    <div className="app-container">
      {!isMobile && (
        <div className="visual-cards">
          <div className="geometry-overlay"></div>
          <h1 className="main-title">GURUKUL Pathshala</h1>

          <div className="user-type-grid">
            <div className="grid-row-middle">
              <div className="user-type-card">
                <h2>Student</h2>
                <div className="user-svg-container">
                  <i className="fas fa-graduation-cap fa-5x" style={{ color: 'var(--primary-medium)' }}></i>
                </div>
              </div>
              <div className="user-type-card">
                <h2>Faculty</h2>
                <div className="user-svg-container">
                  <i className="fas fa-laptop-code fa-5x" style={{ color: 'var(--primary-medium)' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="login-section">
        <div className="login-form-container">
          <div className="login-header">
            <div className="gurukul-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logo} alt="Gurukul Logo" style={{ width: '60px', height: '60px', marginRight: '15px' }} />
              <div className="gurukul-text">
                <h1>GURUKUL</h1>
                <p>Pathshala</p>
              </div>
            </div>
          </div>

          <form className="login-form" onSubmit={onSubmit}>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <label>User ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="admin001"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={loading}
            />

            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <span
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </span>
            </div>

            <label>Security Check</label>
            <div className="captcha-row">
              <div className="captcha-display">{captcha}</div>
              <button
                type="button"
                className="refresh-btn"
                onClick={refreshCaptcha}
                disabled={loading}
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>

            <input
              type="text"
              className="form-input"
              placeholder="Enter CAPTCHA code"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
              disabled={loading}
            />

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            <div className="form-links">
              <a href="#">Forgot Password?</a>
              <a href="#">Tech Support</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;