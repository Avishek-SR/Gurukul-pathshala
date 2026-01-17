import React, { useState, useEffect } from 'react';

import './StudentLayout.css';

const StudentLayout = ({ onLogout }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch student data from backend on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch('http://localhost:8080/api/student/profile', {
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
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // Handle real logout (clear backend session)
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call parent logout function
    if (onLogout) onLogout();
    
    // You can also call backend logout endpoint here if you have one
    // fetch('http://localhost:8080/api/auth/logout', { method: 'POST' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading student dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-layout-container">
      {/* Header Section */}
      <header className="student-layout-header">
        <div className="portal-brand-section">
          <div className="portal-logo-container">
            <div className="portal-logo">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="portal-title">
              <h2>Student Portal</h2>
              <p>GURUKUL Pathshala</p>
            </div>
          </div>
        </div>
        
        <div className="student-profile-section">
          <div className="profile-info-container">
            <div className="profile-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="profile-details">
              <h4>{student?.name || 'Student'}</h4>
              <p>{student?.id || 'S000000'} | {student?.program || 'Program'}</p>
              <p className="profile-email">{student?.email || ''}</p>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="student-portal-content">
        {/* Welcome Banner */}
        <section className="welcome-banner">
          <div className="banner-content">
            <h1>Welcome back, <span className="highlight">{student?.name?.split(' ')[0] || 'Student'}</span>!</h1>
            <p className="banner-description">
              You have {student?.pendingTasks || 0} pending assignments, 2 upcoming exams, and 1 scheduled meeting with your advisor. 
              Check your dashboard for the latest updates and important notifications.
            </p>
          </div>
          <div className="banner-status">
            <span className="status-badge">Student</span>
            <span className="status-badge">{student?.year || 'Year'}</span>
          </div>
        </section>

        {/* Stats Dashboard */}
        <section className="stats-dashboard">
          <h3 className="section-title">Academic Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-box">
                <i className="fas fa-book"></i>
              </div>
              <div className="stat-content">
                <h4>Current GPA</h4>
                <div className="stat-value">{student?.gpa || '0.00'}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-box">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stat-content">
                <h4>Attendance</h4>
                <div className="stat-value">{student?.attendance || 0}%</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-box">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="stat-content">
                <h4>Pending Tasks</h4>
                <div className="stat-value">{student?.pendingTasks || 0}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-box">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <h4>Credit Hours</h4>
                <div className="stat-value">{student?.creditHours || 0}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="services-section">
          <h3 className="section-title">Student Services</h3>
          <div className="services-grid">
            <div className="service-card">
              <div className="card-header">
                <i className="fas fa-graduation-cap"></i>
                <h4>Academic Tools</h4>
              </div>
              <ul className="service-list">
                <li><i className="fas fa-file-alt"></i> View Grades & Transcripts</li>
                <li><i className="fas fa-calendar-alt"></i> Class Schedule & Timetable</li>
                <li><i className="fas fa-clipboard-check"></i> Course Registration</li>
                <li><i className="fas fa-chart-line"></i> Academic Progress Tracker</li>
                <li><i className="fas fa-book-open"></i> Learning Resources</li>
              </ul>
            </div>
            
            <div className="service-card">
              <div className="card-header">
                <i className="fas fa-university"></i>
                <h4>Campus Services</h4>
              </div>
              <ul className="service-list">
                <li><i className="fas fa-book-reader"></i> Library Access & E-Resources</li>
                <li><i className="fas fa-flask"></i> Lab Reservations</li>
                <li><i className="fas fa-bus"></i> Campus Transport Schedule</li>
                <li><i className="fas fa-utensils"></i> Mess & Cafeteria Booking</li>
                <li><i className="fas fa-dumbbell"></i> Sports Facility Booking</li>
              </ul>
            </div>
            
            <div className="service-card">
              <div className="card-header">
                <i className="fas fa-file-invoice-dollar"></i>
                <h4>Finance & Payments</h4>
              </div>
              <ul className="service-list">
                <li><i className="fas fa-money-check-alt"></i> Fee Payment & Receipts</li>
                <li><i className="fas fa-hand-holding-usd"></i> Scholarship Applications</li>
                <li><i className="fas fa-receipt"></i> Transaction History</li>
                <li><i className="fas fa-question-circle"></i> Financial Aid Information</li>
                <li><i className="fas fa-credit-card"></i> Payment Methods Setup</li>
              </ul>
            </div>
            
            <div className="service-card">
              <div className="card-header">
                <i className="fas fa-users"></i>
                <h4>Student Support</h4>
              </div>
              <ul className="service-list">
                <li><i className="fas fa-user-md"></i> Health Center Appointments</li>
                <li><i className="fas fa-briefcase"></i> Career Counseling</li>
                <li><i className="fas fa-comments"></i> Student Forums & Discussions</li>
                <li><i className="fas fa-calendar-check"></i> Event Registration</li>
                <li><i className="fas fa-headset"></i> 24/7 Tech Support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="calendar-section">
          <div className="calendar-header">
            <i className="fas fa-calendar-day"></i>
            <h3>Upcoming Events & Deadlines</h3>
          </div>
          <div className="events-grid">
            <div className="event-card">
              <div className="event-date">Tomorrow, 10:00 AM</div>
              <div className="event-title">Data Structures Midterm</div>
              <div className="event-location">Room 304, Block B</div>
            </div>
            <div className="event-card">
              <div className="event-date">Dec 15, 2:00 PM</div>
              <div className="event-title">Project Submission Deadline</div>
              <div className="event-desc">Software Engineering Project</div>
            </div>
            <div className="event-card">
              <div className="event-date">Dec 18, 11:00 AM</div>
              <div className="event-title">Career Fair 2023</div>
              <div className="event-location">Main Auditorium</div>
            </div>
            <div className="event-card">
              <div className="event-date">Dec 20, 3:00 PM</div>
              <div className="event-title">Faculty Advisor Meeting</div>
              <div className="event-desc">Dr. Smith's Office</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentLayout;