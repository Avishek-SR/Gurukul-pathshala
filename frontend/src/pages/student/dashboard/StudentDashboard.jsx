import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import './StudentDashboard.css';
import api, { getImageUrl } from '../../../services/api';

const SUBJECT_COLORS = [
  { bg: '#e0f2fe', icon: '#0284c7', border: '#bae6fd' },
  { bg: '#e0fcf9', icon: '#20b2aa', border: '#b2ebe8' },
  { bg: '#fdf4ff', icon: '#a21caf', border: '#f5d0fe' },
  { bg: '#fff7ed', icon: '#ea580c', border: '#fed7aa' },
  { bg: '#fef2f2', icon: '#dc2626', border: '#fecaca' },
  { bg: '#f0f9ff', icon: '#0369a1', border: '#bae6fd' },
];

const QUICK_ACTIONS = [
  { to: '/student/courses',     icon: '📚', label: 'My Subjects',   desc: 'View enrolled subjects',  color: '#e0fcf9', hover: '#20b2aa' },
  { to: '/student/assignments', icon: '📝', label: 'Assignments',  desc: 'Submit & track tasks',    color: '#f0fcf9', hover: '#20b2aa' },
  { to: '/student/attendance',  icon: '✅', label: 'Attendance',   desc: 'Check your attendance',   color: '#e0fcf9', hover: '#20b2aa' },
  { to: '/student/timetable',   icon: '🗓️', label: 'Timetable',   desc: 'View class schedule',     color: '#e0fcf9', hover: '#20b2aa' },
  { to: '/student/fees',        icon: '💳', label: 'Fee Status',   desc: 'Pay & track fees',        color: '#e0fcf9', hover: '#20b2aa' },
  { to: '/student/profile',     icon: '👤', label: 'My Profile',   desc: 'Update your details',     color: '#e0fcf9', hover: '#20b2aa' },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '🌅' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  return { text: 'Good Evening', emoji: '🌙' };
};

const getTodayStr = () =>
  new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const StudentDashboard = () => {
  const { student } = useOutletContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const greeting = getGreeting();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashData, subjects] = await Promise.all([
          api.get('/student/dashboard').then(r => r.data).catch(() => ({})),
          api.get('/student/courses').then(r => r.data).catch(() => []),
        ]);
        setDashboardData({ ...dashData, subjects });
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="sd-loading">
        <div className="sd-loader"></div>
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  const attendance = dashboardData?.attendancePercentage || 0;
  const courses    = dashboardData?.enrolledCourses || 0;
  const pending    = dashboardData?.pendingAssignments || 0;
  const notifs     = dashboardData?.unreadNotifications || 0;
  const subjects   = dashboardData?.subjects || [];

  const attendanceColor =
    attendance >= 75 ? '#16a34a' : attendance >= 50 ? '#f59e0b' : '#dc2626';
  const attendanceBg =
    attendance >= 75 ? '#dcfce7' : attendance >= 50 ? '#fef9c3' : '#fee2e2';

  return (
    <div className="sd-root">

      {/* ── Hero Banner ── */}
      <div className="sd-hero">
        <div className="sd-hero-left">
          <div className="sd-greeting-tag">{greeting.emoji} {greeting.text}</div>
          <h1 className="sd-hero-name">{student?.name || 'Student'} 👋</h1>
          <p className="sd-hero-meta">
            {student?.program && <span className="sd-pill">{student.program}</span>}
            {student?.section && <span className="sd-pill">Section {student.section}</span>}
            {student?.userId  && <span className="sd-pill sd-pill-id">ID: {student.userId}</span>}
          </p>
          <p className="sd-hero-date">{getTodayStr()}</p>
        </div>
        <div className="sd-hero-right">
          <div className="sd-avatar-big">
            {student?.profilePictureUrl
              ? <img src={getImageUrl(student.profilePictureUrl)} alt="avatar" />
              : <span>{student?.name?.charAt(0) || 'S'}</span>}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="sd-stats">
        {/* Courses */}
        <div className="sd-stat-card" style={{ '--accent': '#0284c7', '--accent-bg': '#e0f2fe' }}>
          <div className="sd-stat-icon">📚</div>
          <div className="sd-stat-body">
            <span className="sd-stat-value">{courses}</span>
            <span className="sd-stat-label">Enrolled Courses</span>
          </div>
          <div className="sd-stat-bar" style={{ '--fill': '100%' }}></div>
        </div>

        {/* Attendance */}
        <div className="sd-stat-card" style={{ '--accent': attendanceColor, '--accent-bg': attendanceBg }}>
          <div className="sd-stat-icon">✅</div>
          <div className="sd-stat-body">
            <span className="sd-stat-value">{attendance}%</span>
            <span className="sd-stat-label">Attendance</span>
          </div>
          <div className="sd-stat-bar" style={{ '--fill': `${attendance}%` }}></div>
          <span className={`sd-stat-badge ${attendance >= 75 ? 'good' : attendance >= 50 ? 'warn' : 'bad'}`}>
            {attendance >= 75 ? 'On Track' : attendance >= 50 ? 'Moderate' : 'Low'}
          </span>
        </div>

        {/* Pending Assignments */}
        <div className="sd-stat-card" style={{ '--accent': '#a21caf', '--accent-bg': '#fdf4ff' }}>
          <div className="sd-stat-icon">📝</div>
          <div className="sd-stat-body">
            <span className="sd-stat-value">{pending}</span>
            <span className="sd-stat-label">Pending Tasks</span>
          </div>
          {pending > 0 && <span className="sd-stat-badge bad">Due Soon</span>}
          <div className="sd-stat-bar" style={{ '--fill': pending > 0 ? '60%' : '10%' }}></div>
        </div>

        {/* Notifications */}
        <div className="sd-stat-card" style={{ '--accent': '#ea580c', '--accent-bg': '#fff7ed' }}>
          <div className="sd-stat-icon">🔔</div>
          <div className="sd-stat-body">
            <span className="sd-stat-value">{notifs}</span>
            <span className="sd-stat-label">Notifications</span>
          </div>
          <div className="sd-stat-bar" style={{ '--fill': notifs > 0 ? '50%' : '5%' }}></div>
        </div>
      </div>

      {/* ── Main Two-Column Grid ── */}
      <div className="sd-grid">

        {/* Quick Access */}
        <div className="sd-card sd-quick-access">
          <div className="sd-card-header">
            <h2>Quick Access</h2>
            <span className="sd-card-tag">Jump to any section</span>
          </div>
          <div className="sd-actions-grid">
            {QUICK_ACTIONS.map(action => (
              <Link key={action.to} to={action.to} className="sd-action-tile"
                style={{ '--tile-bg': action.color, '--tile-hover': action.hover }}>
                <span className="sd-action-emoji">{action.icon}</span>
                <span className="sd-action-label">{action.label}</span>
                <span className="sd-action-desc">{action.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Attendance Snapshot */}
        <div className="sd-card sd-attendance-snap">
          <div className="sd-card-header">
            <h2>Attendance Overview</h2>
            <Link to="/student/attendance" className="sd-view-all">View Details →</Link>
          </div>

          {/* Donut chart using conic-gradient */}
          <div className="sd-donut-wrap">
            <div className="sd-donut"
              style={{
                background: `conic-gradient(${attendanceColor} 0% ${attendance}%, #e5e7eb ${attendance}% 100%)`
              }}>
              <div className="sd-donut-hole">
                <span className="sd-donut-pct">{attendance}%</span>
                <span className="sd-donut-sub">Present</span>
              </div>
            </div>
          </div>

          <div className="sd-att-legend">
            <div className="sd-legend-item">
              <span className="sd-legend-dot" style={{ background: attendanceColor }}></span>
              <span>Present</span>
              <strong>{attendance}%</strong>
            </div>
            <div className="sd-legend-item">
              <span className="sd-legend-dot" style={{ background: '#e5e7eb' }}></span>
              <span>Absent</span>
              <strong>{100 - attendance}%</strong>
            </div>
          </div>

          <div className={`sd-att-status ${attendance >= 75 ? 'good' : attendance >= 50 ? 'warn' : 'bad'}`}>
            {attendance >= 75
              ? '🎉 Great! Your attendance is on track.'
              : attendance >= 50
              ? '⚠️ Attendance is moderate. Try to improve.'
              : '🚨 Attendance is low. Please attend classes regularly.'}
          </div>
        </div>
      </div>

      {/* ── My Subjects ── */}
      <div className="sd-card sd-subjects-card">
        <div className="sd-card-header">
          <h2>My Subjects</h2>
          <Link to="/student/courses" className="sd-view-all">View All →</Link>
        </div>

        {subjects.length > 0 ? (
          <div className="sd-subjects-grid">
            {subjects.map((subj, idx) => {
              const colors = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
              return (
                <div key={subj.id} className="sd-subject-card"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                  <div className="sd-subj-icon" style={{ color: colors.icon }}>📖</div>
                  <div className="sd-subj-info">
                    <h4>{subj.name}</h4>
                    <span className="sd-subj-code" style={{ color: colors.icon, background: colors.border }}>
                      {subj.code || 'N/A'}
                    </span>
                  </div>
                  <Link to={`/student/assignments?courseId=${subj.id}`} className="sd-subj-arrow" style={{ color: colors.icon }}>→</Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="sd-empty">
            <span>📚</span>
            <p>No subjects assigned yet. Check back later.</p>
          </div>
        )}
      </div>

      {/* ── Bottom Row: Pending + Today ── */}
      <div className="sd-bottom-row">

        {/* Pending Assignments */}
        <div className="sd-card">
          <div className="sd-card-header">
            <h2>Pending Assignments</h2>
            <Link to="/student/assignments" className="sd-view-all">View All →</Link>
          </div>
          {pending > 0 ? (
            <div className="sd-pending-info">
              <div className="sd-pending-count">{pending}</div>
              <p>assignment{pending !== 1 ? 's' : ''} awaiting your submission.</p>
              <Link to="/student/assignments" className="sd-cta-btn">Go to Assignments →</Link>
            </div>
          ) : (
            <div className="sd-empty">
              <span>🎉</span>
              <p>All caught up! No pending assignments.</p>
            </div>
          )}
        </div>

        {/* Today's Info */}
        <div className="sd-card sd-today-card">
          <div className="sd-card-header">
            <h2>Today</h2>
            <span className="sd-card-tag">{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</span>
          </div>
          <div className="sd-today-items">
            <div className="sd-today-item">
              <span className="sd-today-icon">📅</span>
              <div>
                <strong>{getTodayStr()}</strong>
                <p>School Day</p>
              </div>
            </div>
            <div className="sd-today-item">
              <span className="sd-today-icon">🎓</span>
              <div>
                <strong>{student?.program || '—'}</strong>
                <p>Your Programme</p>
              </div>
            </div>
            <div className="sd-today-item">
              <span className="sd-today-icon">🔖</span>
              <div>
                <strong>Section {student?.section || '—'}</strong>
                <p>Your Section</p>
              </div>
            </div>
            <Link to="/student/timetable" className="sd-cta-btn">View Today's Schedule →</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;