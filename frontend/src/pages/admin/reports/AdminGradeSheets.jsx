import React, { useState, useEffect } from 'react';
import { gradeService } from '../../../services/gradeService';
import './AdminGradeSheets.css';

const AdminGradeSheets = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeProg, setActiveProg] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    const data = gradeService.getStudents();
    setStudents(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const programs = ['All', 'B.Tech Computer Science', 'B.Tech Electronics', 'MBA'];

  const filteredStudents = students.filter(s => {
    const matchesProg = activeProg === 'All' || s.program === activeProg;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProg && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-grades-container">
      <div className="grades-header">
        <h1>Student Grade Sheets & Transcripts</h1>
        <p>Search, review, and print verified academic statements of marks and official transcripts.</p>
      </div>

      <div className="grades-filter-bar">
        <div className="prog-filter-tabs">
          {programs.map(p => (
            <button
              key={p}
              className={`prog-tab ${activeProg === p ? 'active' : ''}`}
              onClick={() => setActiveProg(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search student by name or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="students-transcript-grid">
        {filteredStudents.map(student => (
          <div key={student.id} className="student-transcript-card">
            <div>
              <div className="card-top-profile">
                <img
                  src={student.profilePictureUrl || 'https://via.placeholder.com/150'}
                  alt={student.name}
                />
                <div className="card-top-info">
                  <h3>{student.name}</h3>
                  <span>Roll: {student.rollNo} • {student.program}</span>
                </div>
              </div>

              <div className="card-metrics-row">
                <div className="c-metric">
                  <span className="c-lbl">Status</span>
                  <span className="c-val" style={{ fontSize: '0.9rem', color: student.status === 'Evaluated' ? '#059669' : '#d97706' }}>
                    {student.status}
                  </span>
                </div>
                <div className="c-metric">
                  <span className="c-lbl">GPA (4.0)</span>
                  <span className="c-val">{student.gpa}</span>
                </div>
                <div className="c-metric">
                  <span className="c-lbl">Percentage</span>
                  <span className="c-val">{student.percentage}%</span>
                </div>
              </div>
            </div>

            <button
              className="btn-view-sheet"
              onClick={() => setSelectedStudent(student)}
            >
              <i className="fas fa-file-invoice"></i> View & Print Grade Sheet
            </button>
          </div>
        ))}
      </div>

      {/* Transcript View Modal */}
      {selectedStudent && (
        <div className="transcript-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="transcript-modal-wrapper" onClick={e => e.stopPropagation()}>
            <div className="modal-actions-bar">
              <h3>Official Grade Transcript Preview</h3>
              <div className="modal-btn-group">
                <button className="btn-print-action" onClick={handlePrint}>
                  <i className="fas fa-print"></i> Print Official Sheet
                </button>
                <button className="btn-close-modal" onClick={() => setSelectedStudent(null)}>
                  <i className="fas fa-times"></i> Close
                </button>
              </div>
            </div>

            {/* Printable Transcript Document */}
            <div className="official-transcript-sheet">
              <div className="university-header">
                <div className="uni-logo-title">
                  <div className="uni-emblem"><i className="fas fa-university"></i></div>
                  <div className="uni-titles">
                    <h1>Gurukul Pathshala</h1>
                    <h2>Institute of Higher Education & Technology</h2>
                  </div>
                </div>
                <span className="sheet-badge-title">OFFICIAL STATEMENT OF GRADES</span>
              </div>

              {/* Student Profile Info Grid */}
              <div className="sheet-student-info">
                <div className="info-grid">
                  <div className="info-item"><span className="lbl">Student Name:</span><span className="val">{selectedStudent.name}</span></div>
                  <div className="info-item"><span className="lbl">Roll Number:</span><span className="val">{selectedStudent.rollNo}</span></div>
                  <div className="info-item"><span className="lbl">Program:</span><span className="val">{selectedStudent.program}</span></div>
                  <div className="info-item"><span className="lbl">Semester / Term:</span><span className="val">{selectedStudent.semester}</span></div>
                  <div className="info-item"><span className="lbl">Academic Year:</span><span className="val">{selectedStudent.academicYear || '2025-2026'}</span></div>
                  <div className="info-item"><span className="lbl">Issue Date:</span><span className="val">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                </div>
              </div>

              {/* Marks Table */}
              <table className="sheet-marks-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Subject Title</th>
                    <th className="text-center">Credits</th>
                    <th className="text-center">Marks Obtained</th>
                    <th className="text-center">Max Marks</th>
                    <th className="text-center">Letter Grade</th>
                    <th className="text-center">Grade Point</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedStudent.subjects || []).map((sub, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{sub.code || `MOD-${idx+1}`}</td>
                      <td>{sub.subject}</td>
                      <td className="text-center">{sub.credit}</td>
                      <td className="text-center" style={{ fontWeight: 700 }}>{sub.score}</td>
                      <td className="text-center">{sub.maxScore || 100}</td>
                      <td className="text-center grade-badge-print" style={{ color: sub.color || '#1e293b' }}>
                        {sub.grade || 'N/A'}
                      </td>
                      <td className="text-center">{sub.gradePoint !== undefined ? sub.gradePoint.toFixed(1) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Statistics Box */}
              <div className="sheet-summary-box">
                <div className="sum-item">
                  <span className="sum-lbl">Total Credits</span>
                  <span className="sum-val">{selectedStudent.totalCredits}</span>
                </div>
                <div className="sum-item">
                  <span className="sum-lbl">Aggregate Score</span>
                  <span className="sum-val">{selectedStudent.totalScore} / {selectedStudent.maxTotalScore}</span>
                </div>
                <div className="sum-item">
                  <span className="sum-lbl">Percentage</span>
                  <span className="sum-val">{selectedStudent.percentage}%</span>
                </div>
                <div className="sum-item">
                  <span className="sum-lbl">SGPA (4.0 Scale)</span>
                  <span className="sum-val highlight">{selectedStudent.gpa}</span>
                </div>
                <div className="sum-item">
                  <span className="sum-lbl">Final Status</span>
                  <span className="sum-val" style={{ fontSize: '1.1rem', color: selectedStudent.resultStatus.includes('PASSED') ? '#059669' : '#dc2626' }}>
                    {selectedStudent.resultStatus}
                  </span>
                </div>
              </div>

              {selectedStudent.remarks && (
                <div style={{ marginBottom: '2.5rem', padding: '1rem', background: '#f8fafc', borderLeft: '4px solid #3b82f6', fontStyle: 'italic', fontSize: '0.9rem', color: '#475569' }}>
                  <strong>Remarks:</strong> "{selectedStudent.remarks}"
                </div>
              )}

              {/* Official Signatures */}
              <div className="sheet-signatures">
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>Prepared By / Checker</span>
                </div>

                <div className="official-seal">
                  Official Seal
                </div>

                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>Controller of Examinations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGradeSheets;
