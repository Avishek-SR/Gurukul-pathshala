import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchStudentsFromDB,
  mergeStudentWithGrades,
  calculateGradeMetrics,
  getCurrentUserRole,
  gradeService
} from '../../../services/gradeService';
import toast from 'react-hot-toast';
import './UploadGrades.css';

const UploadGrades = () => {
  const userRole = getCurrentUserRole();

  const [students, setStudents]           = useState([]);
  const [selectedStudent, setSelected]    = useState(null);
  const [searchQuery, setSearch]          = useState('');
  const [activeClass, setActiveClass]     = useState('All');
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
      const dbStudents = await fetchStudentsFromDB(userRole);
      setStudents(dbStudents.map(mergeStudentWithGrades));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students. Check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const handleSelectStudent = (student) => {
    setSelected(student);
    setEditableSubjects(JSON.parse(JSON.stringify(student.subjects || [])));
    setRemarks(student.remarks || '');
    setAcademicYear(student.academicYear || '2081-2082');
    setSemester(student.semester || '');
  };

  const handleMarkChange = (i, val) => {
    const u = [...editableSubjects];
    u[i].score = Math.min(u[i].maxScore || 100, Math.max(0, Number(val) || 0));
    setEditableSubjects(u);
  };
  const handleMaxChange = (i, val) => {
    const u = [...editableSubjects];
    u[i].maxScore = Math.max(1, Number(val) || 100);
    if (u[i].score > u[i].maxScore) u[i].score = u[i].maxScore;
    setEditableSubjects(u);
  };
  const handleCreditChange = (i, val) => {
    const u = [...editableSubjects];
    u[i].credit = Math.max(1, Number(val) || 1);
    setEditableSubjects(u);
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) { toast.error('Code and name required'); return; }
    setEditableSubjects(p => [...p, {
      code: newSubCode.toUpperCase().trim(),
      subject: newSubName.trim(),
      credit: Number(newSubCredit) || 3,
      score: 0,
      maxScore: Number(newSubMax) || 100
    }]);
    setNewSubCode(''); setNewSubName(''); setNewSubCredit(3); setNewSubMax(100);
    toast.success('Subject added');
  };

  const handleRemove = (i) => setEditableSubjects(p => p.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      gradeService.saveStudentGrades(
        selectedStudent.userId, editableSubjects, 'Evaluated', remarks, academicYear, semester
      );
      toast.success(`Grades saved for ${selectedStudent.name}`);
      await loadStudents();
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  };

  // Live stats
  const livePct = () => {
    if (!editableSubjects.length) return 0;
    const t = editableSubjects.reduce((a, s) => a + (Number(s.score)||0), 0);
    const m = editableSubjects.reduce((a, s) => a + (Number(s.maxScore)||100), 0);
    return m > 0 ? Math.round((t / m) * 100) : 0;
  };
  const liveGPA = () => {
    if (!editableSubjects.length) return '0.00';
    let w = 0, c = 0;
    editableSubjects.forEach(s => {
      const { gpa4 } = calculateGradeMetrics(s.score, s.maxScore || 100);
      w += gpa4 * (Number(s.credit)||0); c += Number(s.credit)||0;
    });
    return c > 0 ? (w/c).toFixed(2) : '0.00';
  };

  // Group by class/program for filter tabs
  const classes = ['All', ...Array.from(new Set(students.map(s => s.program || 'General').filter(Boolean))).sort()];

  const filtered = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchClass = activeClass === 'All' || s.program === activeClass;
    const matchQ = s.name.toLowerCase().includes(q) || s.userId.toLowerCase().includes(q) || (s.section||'').toLowerCase().includes(q);
    return matchClass && matchQ;
  });

  const pct = livePct();

  return (
    <div className="upload-grades-container">
      {/* ─── Left Panel ─── */}
      <div className="grades-left-panel">
        <div className="grades-panel-header">
          <h2><i className="fas fa-users"></i> Students</h2>
          <span className="student-count-badge">{students.length}</span>
        </div>

        <div className="grades-search">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search name, ID, section..." value={searchQuery} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Class filter tabs */}
        {classes.length > 1 && (
          <div className="grades-class-tabs">
            {classes.map(c => (
              <button key={c} className={`class-tab ${activeClass === c ? 'active' : ''}`} onClick={() => setActiveClass(c)}>
                {c === 'All' ? 'All Classes' : c}
              </button>
            ))}
          </div>
        )}

        <div className="student-list-scroll">
          {loading ? (
            <div className="grades-loading"><i className="fas fa-spinner fa-spin"></i><span>Loading...</span></div>
          ) : filtered.length === 0 ? (
            <div className="grades-empty"><i className="fas fa-user-slash"></i><p>No students found</p></div>
          ) : filtered.map(s => (
            <div
              key={s.userId}
              className={`student-list-item ${selectedStudent?.userId === s.userId ? 'active' : ''}`}
              onClick={() => handleSelectStudent(s)}
            >
              <div className="student-item-avatar">
                {s.profilePictureUrl
                  ? <img src={s.profilePictureUrl} alt={s.name} />
                  : <span>{s.name?.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div className="student-item-info">
                <strong>{s.name}</strong>
                <small>{s.userId} • {s.program || 'N/A'}{s.section ? ` (${s.section})` : ''}</small>
              </div>
              <span className={`status-dot ${s.status === 'Evaluated' ? 'done' : 'pending'}`}></span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="grades-right-panel">
        {!selectedStudent ? (
          <div className="grades-placeholder">
            <div className="placeholder-icon"><i className="fas fa-clipboard-list"></i></div>
            <h3>Select a Student to Grade</h3>
            <p>Choose any student from the list to enter or update their marks.</p>
          </div>
        ) : (
          <>
            {/* Student Header Card */}
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
                    <i className="fas fa-id-card" style={{marginRight:4,color:'#94A3B8'}}></i>
                    {selectedStudent.userId} &nbsp;|&nbsp;
                    <i className="fas fa-graduation-cap" style={{marginRight:4,color:'#94A3B8'}}></i>
                    {selectedStudent.program || 'N/A'} {selectedStudent.section ? `· Sec ${selectedStudent.section}` : ''}
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
                  <span className="live-stat-val">{liveGPA()}</span>
                  <span className="live-stat-label">GPA (4.0)</span>
                </div>
                <div className="live-stat">
                  <span className="live-stat-val">{editableSubjects.length}</span>
                  <span className="live-stat-label">Subjects</span>
                </div>
              </div>
            </div>

            {/* Term Info */}
            <div className="grade-term-row">
              <div className="grade-term-field">
                <label><i className="fas fa-calendar-alt"></i> Academic Year</label>
                <input type="text" value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="e.g. 2081-2082" />
              </div>
              <div className="grade-term-field">
                <label><i className="fas fa-layer-group"></i> Term / Semester</label>
                <input type="text" value={semester} onChange={e => setSemester(e.target.value)} placeholder="e.g. Term 1 / Semester 2" />
              </div>
            </div>

            {/* Marks Table */}
            <div className="grade-subjects-table-wrap">
              <div className="table-header-bar">
                <span><i className="fas fa-table"></i> Subject Marks</span>
                <span className="table-count">{editableSubjects.length} subjects</span>
              </div>
              <table className="grade-subjects-table">
                <thead>
                  <tr>
                    <th style={{width:'32px'}}>#</th>
                    <th>Code</th>
                    <th style={{textAlign:'left'}}>Subject Name</th>
                    <th>Credit</th>
                    <th>Full Marks</th>
                    <th>Obtained</th>
                    <th>Grade</th>
                    <th>GP</th>
                    <th style={{width:'36px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {editableSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="empty-table-msg">
                        <i className="fas fa-plus-circle"></i> No subjects yet — add them below
                      </td>
                    </tr>
                  ) : editableSubjects.map((sub, i) => {
                    const m = calculateGradeMetrics(sub.score, sub.maxScore || 100);
                    return (
                      <tr key={i} className={m.grade === 'F' ? 'fail-row' : ''}>
                        <td>{i + 1}</td>
                        <td><span className="sub-code-badge">{sub.code}</span></td>
                        <td style={{textAlign:'left'}}>{sub.subject}</td>
                        <td><input type="number" min={1} max={10} className="grade-num-input" value={sub.credit} onChange={e => handleCreditChange(i, e.target.value)} /></td>
                        <td><input type="number" min={1} className="grade-num-input" value={sub.maxScore || 100} onChange={e => handleMaxChange(i, e.target.value)} /></td>
                        <td><input type="number" min={0} max={sub.maxScore || 100} className={`grade-num-input mark-input ${m.grade === 'F' ? 'fail' : ''}`} value={sub.score} onChange={e => handleMarkChange(i, e.target.value)} /></td>
                        <td><span className="grade-badge" style={{ background: m.color }}>{m.grade}</span></td>
                        <td style={{fontWeight:700}}>{m.gradePoint.toFixed(1)}</td>
                        <td><button className="remove-sub-btn" onClick={() => handleRemove(i)} title="Remove subject"><i className="fas fa-times"></i></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Subject */}
            <form className="add-subject-form" onSubmit={handleAddSubject}>
              <div className="add-sub-title"><i className="fas fa-plus-circle"></i> Add Subject</div>
              <div className="add-sub-fields">
                <input placeholder="Code" value={newSubCode} onChange={e => setNewSubCode(e.target.value)} style={{width:'100px'}} />
                <input placeholder="Subject Name" value={newSubName} onChange={e => setNewSubName(e.target.value)} style={{flex:2}} />
                <input type="number" min={1} max={10} placeholder="Credit" value={newSubCredit} onChange={e => setNewSubCredit(e.target.value)} style={{width:'80px'}} />
                <input type="number" min={1} placeholder="Full Marks" value={newSubMax} onChange={e => setNewSubMax(e.target.value)} style={{width:'110px'}} />
                <button type="submit" className="add-sub-btn"><i className="fas fa-plus"></i> Add</button>
              </div>
            </form>

            {/* Remarks */}
            <div className="grade-remarks-section">
              <label><i className="fas fa-comment-alt"></i> Remarks</label>
              <textarea rows={2} placeholder="Optional teacher remarks..." value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>

            {/* Save */}
            <div className="grade-save-row">
              <div className="save-hint">
                <i className="fas fa-info-circle"></i>
                Changes are saved locally and visible to admin for printing.
              </div>
              <button className="grade-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-check-circle"></i> Save & Publish Grades</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadGrades;
