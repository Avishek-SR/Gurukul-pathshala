import React, { useState } from 'react';
import GlobalActivityLog from '../dashboard/components/GlobalActivityLog';
import AdminGradeSheets from './AdminGradeSheets';
import './Reports.css';

const Reports = () => {
  const [activeReport, setActiveReport] = useState(null);

  const reportCards = [
    {
      id: 'global-activity',
      title: 'Global Activity Log',
      description: 'View real-time system-wide activity logs for all users.',
      icon: 'fas fa-history',
      color: '#3498db'
    },
    {
      id: 'grade-sheets',
      title: 'Student Grade Sheets & Transcripts',
      description: 'Search students, verify subject marks, and print official university academic transcripts.',
      icon: 'fas fa-graduation-cap',
      color: '#10b981'
    }
  ];

  if (activeReport === 'global-activity') {
    return (
      <div className="reports-page-wrapper">
        <button className="back-to-reports-btn" onClick={() => setActiveReport(null)}>
          <i className="fas fa-arrow-left"></i> Back to Reports
        </button>
        <GlobalActivityLog />
      </div>
    );
  }

  if (activeReport === 'grade-sheets') {
    return (
      <div className="reports-page-wrapper">
        <button className="back-to-reports-btn" onClick={() => setActiveReport(null)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <i className="fas fa-arrow-left"></i> Back to Reports
        </button>
        <AdminGradeSheets />
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>System Reports</h1>
        <p>Access detailed reports and system logs</p>
      </div>

      <div className="reports-grid">
        {reportCards.map(report => (
          <div
            key={report.id}
            className="report-card-item"
            onClick={() => setActiveReport(report.id)}
            style={{ borderLeft: `4px solid ${report.color}` }}
          >
            <div className="report-icon" style={{ color: report.color }}>
              <i className={report.icon}></i>
            </div>
            <div className="report-info">
              <h3>{report.title}</h3>
              <p>{report.description}</p>
            </div>
            <div className="report-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
