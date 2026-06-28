// GradesOverview.jsx
import React, { useState, useEffect } from 'react';
import { fetchStudentsFromDB, mergeStudentWithGrades, calculateGradeMetrics } from '../../../services/gradeService';
import './GradesOverview.css';

const GradesOverview = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentGrades = async () => {
      try {
        const res = await fetchStudentsFromDB('STUDENT');
        if (res && res.length > 0) {
          const merged = mergeStudentWithGrades(res[0]);
          setStudentData(merged);
        }
      } catch (err) {
        console.error('Failed to load student grades:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStudentGrades();
  }, []);

  if (loading) {
    return (
      <div className="grades-overview" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.8rem', color: '#6366F1', marginBottom: '10px' }}></i>
        <p>Loading your academic records...</p>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="grades-overview" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <i className="fas fa-folder-open" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
        <p>No academic profile found.</p>
      </div>
    );
  }

  const grades = studentData.subjects || [];

  // Stats calculation
  const scores = grades.map(g => Number(g.score) || 0);
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const totalCredits = studentData.totalCredits || 0;

  return (
    <div className="grades-overview">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-chart-line"></i>
          <div>
            <h3 style={{ margin: 0 }}>Grades Overview ({studentData.name})</h3>
            <small style={{ color: '#64748B', fontSize: '0.8rem' }}>Roll No: {studentData.userId} &bull; {studentData.program}</small>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="gpa-display" style={{ background: '#EEF2FF', color: '#4F46E5', padding: '6px 14px', borderRadius: '20px', fontWeight: 700 }}>
            GPA: {studentData.gpa} / 4.0
          </span>
          <span className="gpa-display" style={{ background: '#F0FDF4', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontWeight: 700 }}>
            {studentData.percentage}% ({studentData.resultStatus})
          </span>
        </div>
      </div>
      
      <div className="grades-stats">
        <div className="stat-item">
          <div className="stat-value">{highestScore}</div>
          <div className="stat-label">Highest Score</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{lowestScore}</div>
          <div className="stat-label">Lowest Score</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{avgScore}%</div>
          <div className="stat-label">Average Percentage</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalCredits}</div>
          <div className="stat-label">Total Credit Hours</div>
        </div>
      </div>
      
      {grades.length === 0 ? (
        <div style={{ background: '#fff', padding: '3rem', textAlign: 'center', borderRadius: '12px', color: '#94A3B8', border: '1px solid #E2E8F0' }}>
          <i className="fas fa-clipboard-list" style={{ fontSize: '2.5rem', marginBottom: '12px', color: '#CBD5E1' }}></i>
          <h4 style={{ color: '#475569', margin: '0 0 6px' }}>No Grades Evaluated Yet</h4>
          <p style={{ margin: 0 }}>Your teachers have not uploaded marks for this semester yet.</p>
        </div>
      ) : (
        <div className="grades-table">
          <table>
            <thead>
              <tr>
                <th>Subject / Module</th>
                <th>Code</th>
                <th>Credit</th>
                <th>Full Marks</th>
                <th>Obtained</th>
                <th>Grade</th>
                <th>Grade Point</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((item, index) => {
                const m = calculateGradeMetrics(item.score, item.maxScore || 100);
                return (
                  <tr key={index}>
                    <td className="subject-cell">
                      <div className="subject-icon">
                        <i className="fas fa-book"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{item.subject}</div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 'bold', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{item.code}</span></td>
                    <td className="credit-cell">{item.credit}</td>
                    <td>{item.maxScore || 100}</td>
                    <td className="score-cell" style={{ fontWeight: 700 }}>{item.score}</td>
                    <td>
                      <span 
                        className="grade-badge"
                        style={{ backgroundColor: m.color, color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', display: 'inline-block' }}
                      >
                        {m.grade}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{m.gradePoint.toFixed(1)}</td>
                    <td>
                      <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div 
                          className="status-dot"
                          style={{ 
                            width: '8px', height: '8px', borderRadius: '50%',
                            backgroundColor: m.grade === 'F' ? '#EF4444' : m.percentage >= 75 ? '#10B981' : '#F59E0B'
                          }}
                        ></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: m.grade === 'F' ? '#EF4444' : '#334155' }}>
                          {m.grade === 'F' ? 'Fail' : m.percentage >= 75 ? 'Distinction' : 'Passed'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {studentData.remarks && (
        <div style={{ marginTop: '20px', background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-comment-alt" style={{ color: '#6366F1' }}></i> Faculty Remarks
          </h4>
          <p style={{ margin: 0, color: '#334155', fontStyle: 'italic', fontSize: '0.9rem' }}>{studentData.remarks}</p>
        </div>
      )}
    </div>
  );
};

export default GradesOverview;