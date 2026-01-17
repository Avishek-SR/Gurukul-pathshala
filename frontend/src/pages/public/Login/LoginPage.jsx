import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const u = JSON.parse(user);
        redirectUser(u.role);
      } catch {
        // Corrupt storage, clear safely
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
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
      const res = await fetch('http://localhost:8080/api/public/captcha');
      const data = await res.json();
      setCaptcha(data.code);
      setCaptchaId(data.id);
      setCaptchaInput('');
    } catch (e) {
      setError('Unable to load CAPTCHA');
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
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          password,
          captchaId,
          captchaValue: captchaInput
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        refreshCaptcha();
        setLoading(false);
        return;
      }

      // DEBUG: Log what we receive from server
      console.log('Login response data:', data);
      
      // FIX 1: Check if accessToken exists or if it's named differently
      const token = data.accessToken || data.token || data.jwt;
      
      if (!token) {
        setError('No authentication token received from server');
        console.error('Token not found in response:', data);
        refreshCaptcha();
        setLoading(false);
        return;
      }

      // FIX 2: Save token to localStorage
      localStorage.setItem('token', token);
      
      // FIX 3: Ensure user object has all required fields
      const userData = {
        userId: data.userId || data.id || userId,
        name: data.name || 'User',
        role: data.role || 'STUDENT'
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // DEBUG: Verify storage
      console.log('Token saved:', localStorage.getItem('token'));
      console.log('User saved:', localStorage.getItem('user'));

      setLoading(false);

      // Redirect immediately (no need for setTimeout)
      redirectUser(userData.role);

      // Clear form fields
      setUserId('');
      setPassword('');
      setCaptchaInput('');
      refreshCaptcha();

    } catch (e) {
      setError('Server unreachable. Please try again.');
      console.error('Login error:', e);
      refreshCaptcha();
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !loading) {
        handleLogin();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [userId, password, captchaInput, loading]);

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
            <div className="gurukul-brand">
              <div className="gurukul-logo">
                <i className="fas fa-atom fa-2x"></i>
              </div>
              <div className="gurukul-text">
                <h1>GURUKUL</h1>
                <p>Pathshala</p>
              </div>
            </div>
          </div>

          <div className="login-form">
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
              type="button"
              className="login-btn"
              onClick={handleLogin}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;