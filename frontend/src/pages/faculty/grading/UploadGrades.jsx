import React, { useState, useEffect } from 'react';
import { gradeService, calculateGradeMetrics } from '../../../services/gradeService';
import toast from 'react-hot-toast';
import './UploadGrades.css';

const UploadGrades = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeProgram, setActiveProgram] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local editable state for the selected student
  const [editableSubjects, setEditableSubjects] = useState([]);
  const [remarks, setRemarks] = useState('');
  
  // New subject inputs
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCredit, setNewSubCredit] = useState(3);

  const loadData = () => {
    const data = gradeService.getStudents();
    setStudents(data);
    if (selectedStudent) {
      const refreshed = data.find(s => s.id === selectedStudent.id);
      if (refreshed) {
        setSelectedStudent(refreshed);
        setEditableSubjects(refreshed.subjects || []);
        setRemarks(refreshed.remarks || '');
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setEditableSubjects(JSON.parse(JSON.stringify(student.subjects || [])));
    setRemarks(student.remarks || '');
  };

  const handleMarkChange = (index, val) => {
    const updated = [...editableSubjects];
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    updated[index].score = num;
    setEditableSubjects(updated);
  };

  const handleCreditChange = (index, val) => {
    const updated = [...editableSubjects];
    updated[index].credit = Math.max(1, Number(val) || 1);
    setEditableSubjects(updated);
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubName || !newSubCode) {
      toast.error('Please provide Subject Code and Name');
      return;
    }
    const added = [...editableSubjects, {
      code: newSubCode.toUpperCase(),
      subject: newSubName,
      credit: Number(newSubCredit) || 3,
      score: 80,
      maxScore: 100
    }];
    setEditableSubjects(added);
    setNewSubCode('');
    setNewSubName('');
    toast.success('Added new subject module');
  };

  const handleRemoveSubject = (index) => {
    const updated = editableSubjects.filter((_, i) => i !== index);
    setEditableSubjects(updated);
  };

  const handleSaveGrades = () => {
    if (!selectedStudent) return;
    try {
      const updatedStudent = gradeService.saveStudentGrades(
        selectedStudent.id,
        editableSubjects,
        'Evaluated',
        remarks
      );
      toast.success(`Grades saved and published for ${selectedStudent.name}!`);
      loadData();
      setSelectedStudent(updatedStudent);
    } catch (err) {
      toast.error('Failed to save student evaluation.');
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo marks and student records to defaults?')) {
      gradeService.resetToDefault();
      toast.success('Demo data restored successfully');
      setSelectedStudent(null);
      loadData();
    }
  };

  // Filter students based on program and search query
  const programs = ['All', 'B.Tech Computer Science', 'B.Tech Electronics', 'MBA'];
  
  const filteredStudents = students.filter(s => {
    const matchesProg = activeProgram === 'All' || s.program === activeProgram;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProg && matchesSearch;
  });

  // Calculate live preview GPA for the editor panel
  const calculateLiveGPA = () => {
    if (!editableSubjects || editableSubjects.length === 0) return '0.00';
    let totCred = 0;
    let totGpa4 = 0;
    editableSubjects.forEach(sub => {
      const metrics = calculateGradeMetrics(sub.score || 0, sub.maxScore || 100);
      const c = Number(sub.credit) || 0;
      totCred += c;
      totGpa4 += metrics.gpa4 * c;
    });
    return totCred > 0 ? (totGpa4 / totCred).toFixed(2) : '0.00';
  };

  // Global summary statistics
  const totalStudents = students.length;
  const evaluatedCount = students.filter(s => s.status === 'Evaluated').length;
  const pendingCount = totalStudents - evaluatedCount;
  const avgGpa = totalStudents > 0
    ? (students.reduce((acc, curr) => acc + Number(curr.gpa || 0), 0) / totalStudents).toFixed(2)
    : '0.00';

  return (
    <div className="faculty-grading-container">
      {/* Header Banner */}
      <div className="grading-header-banner">
        <div className="grading-header-content">
          <h1>Faculty Grade Management Portal</h1>
          <p>Evaluate student academic assignments, input semester marks, verify GPA, and publish official university grade sheets.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grading-metrics-grid">
        <div className="metric-card-glass">
          <div className="metric-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <i className="fas fa-users"></i>
          </div>
          <div className="metric-info">
            <h4>Enrolled Students</h4>
            <div className="metric-value">{totalStudents}</div>
          </div>
        </div>

        <div className="metric-card-glass">
          <div className="metric-icon-wrapper" style={{ background: '#d1fae5', color: '#059669' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="metric-info">
            <h4>Evaluated</h4>
            <div className="metric-value">{evaluatedCount}</div>
          </div>
        </div>

        <div className="metric-card-glass">
          <div className="metric-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="metric-info">
            <h4>Pending Review</h4>
            <div className="metric-value">{pendingCount}</div>
          </div>
        </div>

        <div className="metric-card-glass">
          <div className="metric-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <i className="fas fa-award"></i>
          </div>
          <div className="metric-info">
            <h4>Average Class GPA</h4>
            <div className="metric-value">{avgGpa} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ 4.0</span></div>
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="grading-controls-bar">
        <div className="program-pills">
          {programs.map(prog => (
            <button
              key={prog}
              className={`program-pill ${activeProgram === prog ? 'active' : ''}`}
              onClick={() => setActiveProgram(prog)}
            >
              {prog}
            </button>
          ))}
        </div>

        <div className="search-and-actions">
          <div className="search-input-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by Name or Roll No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="reset-demo-btn" onClick={handleResetDemo} title="Reset Demo Data">
            <i className="fas fa-sync-alt"></i> Reset Demo
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className={`grading-workspace-grid ${selectedStudent ? 'with-panel' : ''}`}>
        {/* Left: Students List */}
        <div className="students-list-panel">
          <div className="students-list-header">
            <h3>Student Roster ({filteredStudents.length})</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Click a student to enter marks</span>
          </div>

          {filteredStudents.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}></i>
              <p>No students found matching the selected filter criteria.</p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <div
                key={student.id}
                className={`student-card-item ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                onClick={() => handleSelectStudent(student)}
              >
                <div className="student-card-left">
                  <img
                    src={student.profilePictureUrl || 'https://via.placeholder.com/150'}
                    alt={student.name}
                    className="student-avatar"
                  />
                  <div className="student-card-info">
                    <h4>{student.name}</h4>
                    <p>{student.rollNo} • {student.program}</p>
                  </div>
                </div>

                <div className="student-card-right">
                  <span className={`status-badge ${student.status === 'Evaluated' ? 'evaluated' : 'pending'}`}>
                    {student.status}
                  </span>
                  <span className="student-gpa-tag">GPA: {student.gpa}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Evaluation Editor Panel */}
        {selectedStudent && (
          <div className="grading-editor-panel">
            <div className="editor-header">
              <div className="editor-student-profile">
                <img
                  src={selectedStudent.profilePictureUrl || 'https://via.placeholder.com/150'}
                  alt={selectedStudent.name}
                />
                <div className="editor-student-info">
                  <h3>{selectedStudent.name}</h3>
                  <span>{selectedStudent.rollNo} • {selectedStudent.semester}</span>
                </div>
              </div>

              <div className="editor-gpa-badge">
                <span className="label">Live GPA Preview</span>
                <span className="value">{calculateLiveGPA()}</span>
              </div>
            </div>

            <div className="editor-body">
              <div className="subjects-table-wrapper">
                <table className="subjects-editor-table">
                  <thead>
                    <tr>
                      <th>Subject Module</th>
                      <th>Credits</th>
                      <th>Marks (Out of 100)</th>
                      <th>Grade</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableSubjects.map((sub, idx) => {
                      const metrics = calculateGradeMetrics(sub.score || 0, sub.maxScore || 100);
                      return (
                        <tr key={idx}>
                          <td className="subject-name-cell">
                            <h5>{sub.subject}</h5>
                            <span>Code: {sub.code}</span>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max="6"
                              style={{ width: '50px', padding: '0.3rem', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                              value={sub.credit}
                              onChange={(e) => handleCreditChange(idx, e.target.value)}
                            />
                          </td>
                          <td>
                            <div className="mark-input-wrapper">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={sub.score}
                                onChange={(e) => handleMarkChange(idx, e.target.value)}
                              />
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ 100</span>
                            </div>
                          </td>
                          <td>
                            <span className="grade-pill-display" style={{ backgroundColor: metrics.color }}>
                              {metrics.grade}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleRemoveSubject(idx)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}
                              title="Remove Subject"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Custom Subject */}
              <div className="add-subject-box">
                <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase' }}>
                  + Add Additional Subject / Lab
                </h5>
                <div className="add-subject-grid">
                  <input
                    type="text"
                    placeholder="Code (e.g. CS409)"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Subject Name (e.g. AI & ML Lab)"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                  />
                  <input
                    type="number"
                    min="1"
                    max="6"
                    placeholder="Cr"
                    value={newSubCredit}
                    onChange={(e) => setNewSubCredit(e.target.value)}
                    title="Credit Hours"
                  />
                  <button type="button" className="add-sub-btn" onClick={handleAddSubject}>
                    Add
                  </button>
                </div>
              </div>

              {/* Faculty Remarks */}
              <div className="remarks-section">
                <label htmlFor="facultyRemarks"><i className="fas fa-comment-dots"></i> Faculty Feedback & Remarks</label>
                <textarea
                  id="facultyRemarks"
                  placeholder="Enter overall assessment commentary or improvement notes for the student..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="editor-footer">
              <button className="btn-cancel" onClick={() => setSelectedStudent(null)}>
                Close Panel
              </button>
              <button className="btn-save-grades" onClick={handleSaveGrades}>
                <i className="fas fa-save"></i> Save & Publish Grades
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadGrades;
