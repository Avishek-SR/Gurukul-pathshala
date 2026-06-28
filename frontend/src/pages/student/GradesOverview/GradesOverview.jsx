// GradesOverview.jsx
import React, { useState, useEffect } from 'react';
import { gradeService } from '../../../services/gradeService';
import './GradesOverview.css';

const GradesOverview = () => {
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    // Fetch from gradeService (defaults to first student Avishek Sharma or current student)
    const allStudents = gradeService.getStudents();
    const storedUser = sessionStorage.getItem('user');
    let targetStudent = allStudents[0];
    
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        const match = allStudents.find(s => s.email === u.email || s.name.includes(u.name));
        if (match) targetStudent = match;
      } catch (e) {}
    }
    setStudentData(targetStudent || allStudents[0]);
  }, []);

  if (!studentData) return null;

  const grades = studentData.subjects || [];

  // Stats calculation
  const scores = grades.map(g => Number(g.score) || 0);
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const totalCredits = studentData.totalCredits || grades.reduce((acc, curr) => acc + (Number(curr.credit) || 0), 0);

  return (
    <div className="grades-overview">
      <div className="dashboard-header">
        <i className="fas fa-chart-line"></i>
        <h3>Grades Overview ({studentData.name})</h3>
        <span className="gpa-display">GPA: {studentData.gpa}</span>
      </div>
      
      <div className="grades-stats">
        <div className="stat-item">
          <div className="stat-value">{highestScore}%</div>
          <div className="stat-label">Highest Score</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{lowestScore}%</div>
          <div className="stat-label">Lowest Score</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{avgScore}%</div>
          <div className="stat-label">Average</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalCredits}</div>
          <div className="stat-label">Credit Hours</div>
        </div>
      </div>
      
      <div className="grades-table">
        <table>
          <thead>
            <tr>
              <th>Subject Module</th>
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
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.code}</div>
                  </div>
                </td>
                <td>
                  <span 
                    className="grade-badge"
                    style={{ backgroundColor: item.color || '#3B82F6' }}
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
                                       item.score >= 75 ? '#FFC107' : '#F44336'
                      }}
                    ></div>
                    <span>{item.score >= 90 ? 'Excellent' : 
                          item.score >= 75 ? 'Good' : 'Needs Improvement'}</span>
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