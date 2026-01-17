// AttendanceTracker.jsx
import React from 'react';
import './Attendance.css';

const Attendance = () => {
  const attendanceData = [
    { subject: 'Mathematics', attended: 45, total: 50, percentage: 90 },
    { subject: 'Physics', attended: 42, total: 48, percentage: 87.5 },
    { subject: 'Computer Science', attended: 48, total: 50, percentage: 96 },
    { subject: 'English', attended: 44, total: 46, percentage: 95.6 },
    { subject: 'Chemistry', attended: 40, total: 45, percentage: 88.9 },
  ];

  return (
    <div className="attendance-tracker">
      <div className="dashboard-header">
        <i className="fas fa-calendar-check"></i>
        <h3>Attendance Tracker</h3>
        <span className="overall-attendance">Overall: 91.4%</span>
      </div>
      
      <div className="attendance-grid">
        {attendanceData.map((item, index) => (
          <div key={index} className="attendance-card">
            <div className="subject-header">
              <h4>{item.subject}</h4>
              <span className="attendance-percentage">{item.percentage}%</span>
            </div>
            <div className="attendance-details">
              <div className="attendance-stats">
                <span>Attended: {item.attended}</span>
                <span>Total: {item.total}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="attendance-summary">
        <div className="summary-card warning">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <h4>Low Attendance Alert</h4>
            <p>Physics attendance below 90%</p>
          </div>
        </div>
        <div className="summary-card info">
          <i className="fas fa-bullhorn"></i>
          <div>
            <h4>Upcoming Class</h4>
            <p>Mathematics - Tomorrow 9 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;