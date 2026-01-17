// GradesOverview.jsx
import React from 'react';
import './GradesOverview.css';

const GradesOverview = () => {
  const grades = [
    { subject: 'Mathematics', grade: 'A+', score: 95, credit: 4 },
    { subject: 'Physics', grade: 'A', score: 88, credit: 3 },
    { subject: 'Computer Science', grade: 'A+', score: 96, credit: 4 },
    { subject: 'English', grade: 'B+', score: 82, credit: 3 },
    { subject: 'Chemistry', grade: 'A-', score: 85, credit: 3 },
    { subject: 'Data Structures', grade: 'A', score: 89, credit: 4 },
  ];

  const getGradeColor = (grade) => {
    if (grade.includes('A+')) return '#4CAF50';
    if (grade.includes('A')) return '#8BC34A';
    if (grade.includes('B+')) return '#FFC107';
    if (grade.includes('B')) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className="grades-overview">
      <div className="dashboard-header">
        <i className="fas fa-chart-line"></i>
        <h3>Grades Overview</h3>
        <span className="gpa-display">GPA: 3.78</span>
      </div>
      
      <div className="grades-stats">
        <div className="stat-item">
          <div className="stat-value">95%</div>
          <div className="stat-label">Highest Score</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">82%</div>
          <div className="stat-label">Lowest Score</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">89%</div>
          <div className="stat-label">Average</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">21</div>
          <div className="stat-label">Credit Hours</div>
        </div>
      </div>
      
      <div className="grades-table">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Grade</th>
              <th>Score</th>
              <th>Credit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((item, index) => (
              <tr key={index}>
                <td className="subject-cell">
                  <div className="subject-icon">
                    <i className="fas fa-book"></i>
                  </div>
                  {item.subject}
                </td>
                <td>
                  <span 
                    className="grade-badge"
                    style={{ backgroundColor: getGradeColor(item.grade) }}
                  >
                    {item.grade}
                  </span>
                </td>
                <td className="score-cell">{item.score}%</td>
                <td className="credit-cell">{item.credit}</td>
                <td>
                  <div className="status-indicator">
                    <div 
                      className="status-dot"
                      style={{ 
                        backgroundColor: item.score >= 90 ? '#4CAF50' : 
                                       item.score >= 80 ? '#FFC107' : '#F44336'
                      }}
                    ></div>
                    <span>{item.score >= 90 ? 'Excellent' : 
                          item.score >= 80 ? 'Good' : 'Needs Improvement'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradesOverview;