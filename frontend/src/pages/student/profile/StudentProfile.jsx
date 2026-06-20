import React from 'react';
import { useOutletContext } from 'react-router-dom';
import './StudentProfile.css'; // Premium Vanilla CSS
import { getImageUrl } from '../../../services/api';

const StudentProfile = () => {
  const { student } = useOutletContext();

  if (!student) {
    return (
      <div className="sp-loading-container">
        <div className="sp-spinner"></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

  const formatDOB = (dob) => {
    if (!dob) return 'Not provided';
    if (Array.isArray(dob)) {
      return new Date(dob[0], dob[1] - 1, dob[2]).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="sp-container">
      <div className="sp-card">
        <div className="sp-header">
          <div className="sp-avatar-wrapper">
            {student.profilePictureUrl ? (
              <img
                src={getImageUrl(student.profilePictureUrl)}
                alt={student.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              student.name?.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="sp-header-info">
            <h2>
              {student.name}
              <span className="sp-badge">{student.role === 'STUDENT' ? 'Student' : student.role}</span>
            </h2>
            <p className="sp-header-subtitle">
              <i className="fas fa-graduation-cap"></i>
              {student.program || 'N/A'} • Section {student.section || 'N/A'}
            </p>
            <p className="sp-header-id">ID: {student.id}</p>
          </div>
        </div>

        <div className="sp-content-grid">
          <div className="sp-section">
            <h3 className="sp-section-title">
              <i className="fas fa-user"></i> Personal Information
            </h3>

            <div className="sp-info-group">
              <span className="sp-label">Full Name</span>
              <span className="sp-value">{student.name}</span>
            </div>
            <div className="sp-info-group">
              <span className="sp-label">Email Address</span>
              <span className="sp-value">{student.email}</span>
            </div>
            <div className="sp-info-group">
              <span className="sp-label">Date of Birth</span>
              <span className="sp-value">{formatDOB(student.dob)}</span>
            </div>
            {student.mobileNumber && (
              <div className="sp-info-group">
                <span className="sp-label">Mobile Number</span>
                <span className="sp-value">{student.mobileNumber}</span>
              </div>
            )}
            {student.gender && (
              <div className="sp-info-group">
                <span className="sp-label">Gender</span>
                <span className="sp-value">{student.gender}</span>
              </div>
            )}
          </div>

          <div className="sp-section">
            <h3 className="sp-section-title">
              <i className="fas fa-book"></i> Academic Information
            </h3>

            <div className="sp-info-group">
              <span className="sp-label">Program / Class</span>
              <span className="sp-value">{student.program || 'Not Assigned'}</span>
            </div>
            <div className="sp-info-group">
              <span className="sp-label">Section</span>
              <span className="sp-value">{student.section || 'Not Assigned'}</span>
            </div>
            <div className="sp-info-group">
              <span className="sp-label">Attendance</span>
              <span className="sp-value highlight">
                {student.attendance != null ? `${student.attendance}%` : 'No Data yet'}
              </span>
            </div>
            <div className="sp-info-group">
              <span className="sp-label">Account Status</span>
              <span className={`sp-value ${student.active !== false ? 'status-active' : 'status-inactive'}`}>
                {student.active !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;