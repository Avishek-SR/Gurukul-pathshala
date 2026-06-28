import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchStudentsFromDB,
  mergeStudentWithGrades,
  calculateGradeMetrics,
  enrichStudentGradeData,
  gradeService
} from '../../../services/gradeService';
import toast from 'react-hot-toast';
import './UploadGrades.css';

const UploadGrades = () => {
  const [students, setStudents]           = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);

  const [editableSubjects, setEditableSubjects] = useState([]);
  const [remarks, setRemarks]             = useState('');
  const [academicYear, setAcademicYear]   = useState('2081-2082');
  const [semester, setSemester]           = useState('');

  const [newSubCode, setNewSubCode]       = useState('');
  const [newSubName, setNewSubName]       = useState('');
  const [newSubCredit, setNewSubCredit]   = useState(3);
  const [newSubMax, setNewSubMax]         = useState(100);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const dbStudents = await fetchStudentsFromDB();
      const enriched   = dbStudents.map(mergeStudentWithGrades);
      setStudents(enriched);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setEditableSubjects(JSON.parse(JSON.stringify(student.subjects || [])));
    setRemarks(student.remarks || '');
    setAcademicYear(student.academicYear || '2081-2082');
    setSemester(student.semester || '');
  };

  const handleMarkChange = (index, val) => {
    const updated = [...editableSubjects];
    updated[index].score = Math.min(updated[index].maxScore || 100, Math.max(0, Number(val) || 0));
    setEditableSubjects(updated);
  };

  const handleMaxScoreChange = (index, val) => {
    const updated = [...editableSubjects];
    updated[index].maxScore = Math.max(1, Number(val) || 100);
    if (updated[index].score > updated[index].maxScore) {
      updated[index].score = updated[index].maxScore;
    }
    setEditableSubjects(updated);
  };

  const handleCreditChange = (index, val) => {
    const updated = [...editableSubjects];
    updated[index].credit = Math.max(1, Number(val) || 1);
    setEditableSubjects(updated);
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) {
      toast.error('Subject code and name are required');
      return;
    }
    setEditableSubjects(prev => [...prev, {
      code: newSubCode.toUpperCase().trim(),
      subject: newSubName.trim(),
      credit: Number(newSubCredit) || 3,
      score: 0,
      maxScore: Number(newSubMax) || 100
    }]);
    setNewSubCode(''); setNewSubName(''); setNewSubCredit(3); setNewSubMax(100);
    toast.success('Subject added');
  };

  const handleRemoveSubject = (index) => {
    setEditableSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveGrades = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      gradeService.saveStudentGrades(
        selectedStudent.userId,
        editableSubjects,
        'Evaluated',
        remarks,
        academicYear,
        semester
      );
      toast.success(`Grades saved for ${selectedStudent.name}!`);
      await loadStudents();
      // Refresh selected student
      const refreshed = (await fetchStudentsFromDB()).find(s => s.userId === selectedStudent.userId);
      if (refreshed) setSelectedStudent(mergeStudentWithGrades(refreshed));
    } catch (err) {
      toast.error('Failed to save grades.');
    } finally {
      setSaving(false);
    }
  };

  // Live preview GPA
  const liveGPA = () => {
    if (!editableSubjects.length) return '0.00';
    let wSum = 0, cSum = 0;
    editableSubjects.forEach(s => {
      const { gpa4 } = calculateGradeMetrics(s.score, s.maxScore || 100);
      wSum += gpa4 * (Number(s.credit) || 0);
      cSum += Number(s.credit) || 0;
    });
    return cSum > 0 ? (wSum / cSum).toFixed(2) : '0.00';
  };

  const livePercentage = () => {
    if (!editableSubjects.length) return 0;
    const total = editableSubjects.reduce((a, s) => a + (Number(s.score) || 0), 0);
    const max   = editableSubjects.reduce((a, s) => a + (Number(s.maxScore) || 100), 0);
    return max > 0 ? Math.round((total / max) * 100) : 0;
  };

  const filtered = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
           s.userId.toLowerCase().includes(q) ||
           (s.program || '').toLowerCase().includes(q);
  });

  const statusBadge = (status) => {
    const map = { Evaluated: '#10B981', Pending: '#F59E0B', Draft: '#6B7280' };
    return { background: map[status] || '#6B7280', color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 };
  };

  const pct = livePercentage();
  const gpa = liveGPA();

  return (
    <div className="upload-grades-container">
      {/* ─── Left Panel: Student List ─── */}
      <div className="grades-left-panel">
        <div className="grades-panel-header">
          <h2><i className="fas fa-clipboard-list"></i> Students</h2>
          <span className="student-count-badge">{students.length}</span>
        </div>

        <div className="grades-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, ID or class..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="student-list-scroll">
          {loading ? (
            <div className="grades-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Loading students...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="grades-empty">
              <i className="fas fa-user-slash"></i>
              <p>No students found</p>
            </div>
          ) : filtered.map(student => (
            <div
              key={student.userId}
              className={`student-list-item ${selectedStudent?.userId === student.userId ? 'active' : ''}`}
              onClick={() => handleSelectStudent(student)}
            >
              <div className="student-item-avatar">
                {student.profilePictureUrl
                  ? <img src={student.profilePictureUrl} alt={student.name} />
                  : <span>{student.name?.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div className="student-item-info">
                <strong>{student.name}</strong>
                <small>{student.userId} • {student.program || 'N/A'}</small>
                {student.section && <small>Section: {student.section}</small>}
              </div>
              <span style={statusBadge(student.status)}>{student.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right Panel: Grade Editor ─── */}
      <div className="grades-right-panel">
        {!selectedStudent ? (
          <div className="grades-placeholder">
            <i className="fas fa-hand-pointer" style={{ fontSize: '3rem', color: '#CBD5E1' }}></i>
            <h3>Select a Student</h3>
            <p>Click on any student from the list to enter or edit their marks.</p>
          </div>
        ) : (
          <>
            {/* Student Header */}
            <div className="grade-editor-header">
              <div className="grade-student-meta">
                <div className="grade-student-avatar-lg">
                  {selectedStudent.profilePictureUrl
                    ? <img src={selectedStudent.profilePictureUrl} alt={selectedStudent.name} />
                    : <span>{selectedStudent.name?.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div>
                  <h2>{selectedStudent.name}</h2>
                  <p>
                    <strong>ID:</strong> {selectedStudent.userId} &nbsp;|&nbsp;
                    <strong>Class/Program:</strong> {selectedStudent.program || 'N/A'} &nbsp;|&nbsp;
                    <strong>Section:</strong> {selectedStudent.section || '—'}
                  </p>
                </div>
              </div>
              <div className="grade-live-stats">
                <div className="live-stat">
                  <span className="live-stat-val" style={{ color: pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444' }}>
                    {pct}%
                  </span>
                  <span className="live-stat-label">Overall</span>
                </div>
                <div className="live-stat">
                  <span className="live-stat-val">{gpa}</span>
                  <span className="live-stat-label">GPA (4.0)</span>
                </div>
              </div>
            </div>

            {/* Term Info */}
            <div className="grade-term-row">
              <div className="grade-term-field">
                <label>Academic Year</label>
                <input type="text" value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="e.g. 2081-2082" />
              </div>
              <div className="grade-term-field">
                <label>Semester / Term</label>
                <input type="text" value={semester} onChange={e => setSemester(e.target.value)} placeholder="e.g. Term 1, Semester 2" />
              </div>
            </div>

            {/* Subject Table */}
            <div className="grade-subjects-table-wrap">
              <table className="grade-subjects-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Code</th>
                    <th>Subject / Module</th>
                    <th>Credit</th>
                    <th>Full Marks</th>
                    <th>Obtained</th>
                    <th>Grade</th>
                    <th>GP</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {editableSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                        No subjects yet. Add subjects below.
                      </td>
                    </tr>
                  ) : editableSubjects.map((sub, i) => {
                    const m = calculateGradeMetrics(sub.score, sub.maxScore || 100);
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><span className="sub-code-badge">{sub.code}</span></td>
                        <td>{sub.subject}</td>
                        <td>
                          <input
                            type="number" min={1} max={10}
                            className="grade-num-input"
                            value={sub.credit}
                            onChange={e => handleCreditChange(i, e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number" min={1} max={1000}
                            className="grade-num-input"
                            value={sub.maxScore || 100}
                            onChange={e => handleMaxScoreChange(i, e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number" min={0} max={sub.maxScore || 100}
                            className={`grade-num-input mark-input ${m.grade === 'F' ? 'fail' : ''}`}
                            value={sub.score}
                            onChange={e => handleMarkChange(i, e.target.value)}
                          />
                        </td>
                        <td>
                          <span className="grade-badge" style={{ background: m.color }}>
                            {m.grade}
                          </span>
                        </td>
                        <td>{m.gradePoint.toFixed(1)}</td>
                        <td>
                          <button className="remove-sub-btn" onClick={() => handleRemoveSubject(i)} title="Remove">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Subject Row */}
            <form className="add-subject-form" onSubmit={handleAddSubject}>
              <h4><i className="fas fa-plus-circle"></i> Add Subject</h4>
              <div className="add-sub-fields">
                <input placeholder="Code (e.g. ENG101)" value={newSubCode} onChange={e => setNewSubCode(e.target.value)} />
                <input placeholder="Subject Name" value={newSubName} onChange={e => setNewSubName(e.target.value)} style={{ flex: 2 }} />
                <input type="number" min={1} max={10} placeholder="Credit" value={newSubCredit} onChange={e => setNewSubCredit(e.target.value)} style={{ width: '80px' }} />
                <input type="number" min={1} placeholder="Full Marks" value={newSubMax} onChange={e => setNewSubMax(e.target.value)} style={{ width: '100px' }} />
                <button type="submit" className="add-sub-btn">+ Add</button>
              </div>
            </form>

            {/* Remarks */}
            <div className="grade-remarks-section">
              <label>Remarks / Comments</label>
              <textarea
                rows={2}
                placeholder="Optional teacher remarks for this student..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>

            {/* Save Button */}
            <div className="grade-save-row">
              <button className="grade-save-btn" onClick={handleSaveGrades} disabled={saving}>
                {saving
                  ? <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  : <><i className="fas fa-save"></i> Save &amp; Publish Grades</>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadGrades;
