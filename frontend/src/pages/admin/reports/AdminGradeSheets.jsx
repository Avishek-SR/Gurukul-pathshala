import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchStudentsFromDB,
  fetchSchoolSettings,
  mergeStudentWithGrades,
  calculateGradeMetrics,
} from '../../../services/gradeService';
import defaultLogo from '../../../assets/logo.svg';
import toast from 'react-hot-toast';
import './AdminGradeSheets.css';

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

// Helper to resolve logo URL reliably for both preview & print windows
const resolveLogoUrl = (siteLogo) => {
  try {
    if (!siteLogo) return new URL(defaultLogo, window.location.origin).href;
    if (siteLogo.startsWith('http://') || siteLogo.startsWith('https://') || siteLogo.startsWith('data:')) {
      return siteLogo;
    }
    const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    const path = siteLogo.startsWith('/') ? siteLogo : `/${siteLogo}`;
    return new URL(`${baseUrl}${path}`, window.location.origin).href;
  } catch {
    return defaultLogo;
  }
};

// ─── Grade Sheet Component (used for both preview & print) ──────────────────
const GradeSheet = ({ s, schoolInfo }) => {
  const schoolName    = schoolInfo['site_name']       || 'Gurukul Pathshala';
  const schoolAddress = schoolInfo['contact_address'] || 'Kathmandu, Nepal';
  const schoolPhone   = schoolInfo['contact_phone']   || '+977-1-4XXXXXX';
  const schoolEmail   = schoolInfo['contact_email']   || 'info@gurukul.edu.np';
  const logoUrl       = resolveLogoUrl(schoolInfo['site_logo']);
  const academicYear  = s.academicYear || schoolInfo['academic_year'] || '2081-2082';
  const today         = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const isFail        = s.resultStatus === 'NEEDS RE-EXAMINATION';

  return (
    <div className="gs-print-wrap">
      {/* ══ SCHOOL HEADER ══════════════════════════════════════ */}
      <div className="gs-school-header">
        <div className="gs-header-top">
          <div className="gs-logo-container">
            <img 
              src={logoUrl} 
              alt="School Logo" 
              className="gs-header-logo" 
              onError={(e) => { e.target.src = defaultLogo; }} 
            />
          </div>
          <div className="gs-header-text">
            <h1 className="gs-school-name">{schoolName}</h1>
            <p className="gs-school-sub">
              {schoolAddress} {schoolPhone ? `| Tel: ${schoolPhone}` : ''}
            </p>
            {schoolEmail && <p className="gs-school-sub">{schoolEmail}</p>}
          </div>
        </div>
        <div className="gs-doc-title-bar">
          <span className="gs-doc-title">STATEMENT OF MARKS / GRADE SHEET</span>
        </div>
      </div>

      {/* ══ STUDENT INFORMATION ════════════════════════════════ */}
      <div className="gs-info-section">
        <div className="gs-section-title">Student Information</div>
        <table className="gs-info-table">
          <tbody>
            <tr>
              <td className="lbl">Student Name:</td>
              <td className="val"><strong>{s.name}</strong></td>
              <td className="lbl">Academic Year:</td>
              <td className="val">{academicYear}</td>
            </tr>
            <tr>
              <td className="lbl">Enrollment / Roll No:</td>
              <td className="val"><strong>{s.userId}</strong></td>
              <td className="lbl">Term / Semester:</td>
              <td className="val">{s.semester || 'Final Examination'}</td>
            </tr>
            <tr>
              <td className="lbl">Class / Program:</td>
              <td className="val"><strong>{s.program || 'General'}</strong></td>
              <td className="lbl">Section:</td>
              <td className="val">{s.section || 'A'}</td>
            </tr>
            <tr>
              <td className="lbl">Date of Birth:</td>
              <td className="val">{s.dob || '—'}</td>
              <td className="lbl">Issue Date:</td>
              <td className="val">{today}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ══ ACADEMIC PERFORMANCE ═══════════════════════════════ */}
      <div className="gs-info-section">
        <div className="gs-section-title">Academic Performance</div>
        {s.subjects?.length > 0 ? (
          <table className="gs-marks-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }}>S.N.</th>
                <th style={{ width: '85px' }}>Code</th>
                <th style={{ textAlign: 'left' }}>Subject / Module Title</th>
                <th style={{ width: '60px' }}>Credit</th>
                <th style={{ width: '75px' }}>Full Marks</th>
                <th style={{ width: '75px' }}>Pass Marks</th>
                <th style={{ width: '75px' }}>Obtained</th>
                <th style={{ width: '60px' }}>Grade</th>
                <th style={{ width: '75px' }}>Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {s.subjects.map((sub, i) => {
                const m = calculateGradeMetrics(sub.score, sub.maxScore || 100);
                const passMarks = Math.ceil((sub.maxScore || 100) * 0.4);
                return (
                  <tr key={i} className={m.grade === 'F' ? 'fail-row' : ''}>
                    <td>{i + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{sub.code}</td>
                    <td style={{ textAlign: 'left', fontWeight: 600 }}>{sub.subject}</td>
                    <td>{sub.credit}</td>
                    <td>{sub.maxScore || 100}</td>
                    <td>{passMarks}</td>
                    <td style={{ fontWeight: 'bold' }}>{sub.score}</td>
                    <td style={{ fontWeight: 'bold', color: m.grade === 'F' ? '#c0392b' : '#000' }}>{m.grade}</td>
                    <td>{m.gradePoint.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="gs-no-marks">No subject marks evaluated yet for this student.</div>
        )}
      </div>

      {/* ══ SUMMARY & RESULT ═══════════════════════════════════ */}
      {s.subjects?.length > 0 && (
        <div className="gs-summary-row">
          <table className="gs-summary-table">
            <tbody>
              <tr>
                <td className="s-lbl">Total Credit Hours:</td>
                <td className="s-val">{s.totalCredits}</td>
                <td className="s-lbl">Total Marks Obtained:</td>
                <td className="s-val"><strong>{s.totalScore} / {s.maxTotalScore}</strong></td>
              </tr>
              <tr>
                <td className="s-lbl">Percentage:</td>
                <td className="s-val"><strong>{s.percentage}%</strong></td>
                <td className="s-lbl">Grade Point Average (GPA):</td>
                <td className="s-val"><strong>{s.gpa}</strong> (4.0 Scale) / <strong>{s.gpa10}</strong> (10.0 Scale)</td>
              </tr>
            </tbody>
          </table>

          <div className={`gs-result-box ${isFail ? 'gs-result-fail' : 'gs-result-pass'}`}>
            FINAL RESULT: {s.resultStatus}
          </div>
        </div>
      )}

      {/* ══ REMARKS ════════════════════════════════════════════ */}
      {s.remarks && (
        <div className="gs-info-section" style={{ marginBottom: '14px' }}>
          <div className="gs-section-title">Teacher's Remarks</div>
          <p style={{ padding: '4px 6px', fontStyle: 'italic', fontSize: '10pt', color: '#222' }}>"{s.remarks}"</p>
        </div>
      )}

      {/* ══ GRADING LEGEND ═════════════════════════════════════ */}
      <div className="gs-legend">
        <span style={{ fontWeight: 'bold' }}>Grading Scale:</span>
        <span><strong>A+</strong> (≥90%, GP 10.0)</span> &bull;
        <span><strong>A</strong> (80-89%, GP 9.0)</span> &bull;
        <span><strong>B+</strong> (75-79%, GP 8.0)</span> &bull;
        <span><strong>B</strong> (70-74%, GP 7.0)</span> &bull;
        <span><strong>C</strong> (60-69%, GP 6.0)</span> &bull;
        <span><strong>D</strong> (50-59%, GP 5.0)</span> &bull;
        <span><strong>F</strong> (&lt;50%, GP 0.0 - Fail)</span>
      </div>

      {/* ══ SIGNATURES ═════════════════════════════════════════ */}
      <div className="gs-sign-row">
        <div className="gs-sign-block">
          <div className="gs-sign-line"></div>
          <div className="gs-sign-label">Prepared By / Class Teacher</div>
        </div>
        <div className="gs-sign-block">
          <div className="gs-sign-line"></div>
          <div className="gs-sign-label">Controller of Examinations</div>
        </div>
        <div className="gs-sign-block">
          <div className="gs-sign-line"></div>
          <div className="gs-sign-label">Principal / Campus Chief</div>
        </div>
      </div>

      {/* ══ WATERMARK / FOOTER ═════════════════════════════════ */}
      <div className="gs-watermark">
        Note: This statement of marks is issued for official academic purposes. Any alteration renders this document invalid. &bull; {schoolName} &bull; Date: {today}
      </div>
    </div>
  );
};

// ─── Main Admin Grade Sheets Component ──────────────────────────────────────
const AdminGradeSheets = () => {
  const [students, setStudents]        = useState([]);
  const [selectedStudent, setSelected]  = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearch]       = useState('');
  const [loading, setLoading]          = useState(true);
  const [schoolInfo, setSchoolInfo]    = useState({});
  const printRef                       = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dbStudents, settings] = await Promise.all([
        fetchStudentsFromDB('ADMIN'),
        fetchSchoolSettings()
      ]);
      setSchoolInfo(settings);
      const enriched = dbStudents.map(mergeStudentWithGrades);
      enriched.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(enriched);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student grade records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Dynamically get all unique classes preserving standard ordering
  const dynamicClasses = Array.from(new Set([...CLASSES, ...students.map(s => s.program).filter(Boolean)])).sort((a, b) => {
    const idxA = CLASSES.indexOf(a);
    const idxB = CLASSES.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const handleClassClick = (cls) => {
    setSelectedClass(cls);
    const classStudents = students.filter(s => s.program === cls);
    if (classStudents.length > 0) {
      setSelected(classStudents[0]);
    } else {
      setSelected(null);
    }
  };

  const handlePrint = () => {
    if (!selectedStudent || !printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Grade Sheet - ${selectedStudent.name} (${selectedStudent.userId})</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Georgia, serif; font-size: 11pt; color: #000; background: #fff; }
    .gs-print-wrap { width: 190mm; margin: 0 auto; padding: 8mm 5mm; }

    /* Header */
    .gs-school-header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 14px; }
    .gs-header-top { display: flex; align-items: center; justify-content: center; gap: 18px; margin-bottom: 6px; }
    .gs-header-logo { height: 75px; width: auto; object-fit: contain; }
    .gs-header-text { text-align: center; }
    .gs-school-name { font-size: 20pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #000; line-height: 1.15; }
    .gs-school-sub { font-size: 10pt; color: #333; margin-top: 2px; }
    .gs-doc-title-bar { margin-top: 8px; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0; background: #f8f9fa; }
    .gs-doc-title { font-size: 13pt; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; color: #000; }

    /* Section & Tables */
    .gs-info-section { border: 1.5px solid #000; padding: 8px 10px; margin-bottom: 14px; background: #fff; }
    .gs-section-title { font-size: 9.5pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; background: #eaeaea; padding: 3px 8px; margin: -8px -10px 8px -10px; border-bottom: 1.5px solid #000; }
    
    .gs-info-table { width: 100%; border-collapse: collapse; font-size: 10.5pt; }
    .gs-info-table td { padding: 4px 6px; vertical-align: middle; }
    .gs-info-table .lbl { width: 20%; color: #333; font-weight: 600; }
    .gs-info-table .val { width: 30%; border-bottom: 1px dotted #888; }

    .gs-marks-table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 4px; }
    .gs-marks-table th { background: #2c3e50 !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 7px 5px; border: 1px solid #000; text-align: center; font-size: 9.5pt; }
    .gs-marks-table td { padding: 6px 5px; border: 1px solid #000; text-align: center; }
    .gs-marks-table tr:nth-child(even) td { background-color: #f9f9f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .gs-marks-table .fail-row td { background-color: #ffe8e8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    /* Summary */
    .gs-summary-row { margin-bottom: 14px; }
    .gs-summary-table { width: 100%; border-collapse: collapse; font-size: 10.5pt; margin-bottom: 10px; border: 1.5px solid #000; }
    .gs-summary-table td { padding: 6px 8px; border: 1px solid #000; }
    .gs-summary-table .s-lbl { background: #eaeaea !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-weight: bold; width: 25%; }
    .gs-summary-table .s-val { width: 25%; }

    .gs-result-box { text-align: center; padding: 8px; border: 2px solid #000; font-size: 13pt; font-weight: bold; letter-spacing: 2px; }
    .gs-result-pass { background-color: #eafaf1 !important; color: #145a32 !important; border-color: #145a32 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .gs-result-fail { background-color: #fadbd8 !important; color: #78281f !important; border-color: #78281f !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    .gs-no-marks { text-align: center; padding: 20px; color: #666; font-style: italic; }
    .gs-legend { font-size: 8.5pt; color: #444; margin-bottom: 25px; padding: 4px; border: 1px dotted #ccc; text-align: center; }

    /* Signatures */
    .gs-sign-row { display: flex; justify-content: space-between; margin-top: 35px; padding-top: 10px; }
    .gs-sign-block { text-align: center; width: 28%; }
    .gs-sign-line { border-top: 1.5px solid #000; margin-bottom: 5px; }
    .gs-sign-label { font-size: 9.5pt; font-weight: bold; }

    .gs-watermark { text-align: center; font-size: 8pt; color: #777; margin-top: 20px; border-top: 1px dotted #aaa; padding-top: 6px; }

    @page { size: A4 portrait; margin: 10mm 10mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  ${printContent}
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  if (loading) {
    return (
      <div className="ags-loading-page">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading student grade records...</p>
      </div>
    );
  }

  // 1. Render Class Selection Grid (Identical to Course Management Screenshot)
  if (!selectedClass) {
    return (
      <div className="ags-page">
        <div className="ags-header">
          <h1>Grade Sheets Management</h1>
          <p>Select a class to view and print student grade sheets.</p>
        </div>
        <div className="class-grid-container">
          {dynamicClasses.map((cls) => {
            const studentCount = students.filter(s => s.program === cls).length;
            return (
              <div key={cls} className="class-card-item" onClick={() => handleClassClick(cls)}>
                <div className="class-card-icon">📚</div>
                <h3>{cls}</h3>
                <p>{studentCount} {studentCount === 1 ? 'Student' : 'Students'}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Render Grade Sheet View for Selected Class
  const classStudents = students.filter(s => {
    if (s.program !== selectedClass) return false;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.userId.toLowerCase().includes(q) || (s.section || '').toLowerCase().includes(q);
  });

  return (
    <div className="admin-grades-container">
      {/* ─── Left Sidebar (Class Students) ─── */}
      <div className="ags-left">
        <div className="ags-panel-header">
          <button className="ags-back-btn" onClick={() => { setSelectedClass(null); setSelected(null); }}>
            ← Back to Classes
          </button>
        </div>
        
        <div className="ags-class-title-bar">
          <h2>📚 {selectedClass}</h2>
          <span className="ags-count">{classStudents.length} Students</span>
        </div>

        <div className="ags-search">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search student name, roll no..." 
            value={searchQuery} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        <div className="ags-list-scroll">
          {classStudents.length === 0 ? (
            <div className="ags-empty"><i className="fas fa-folder-open"></i><p>No students found in {selectedClass}</p></div>
          ) : classStudents.map(s => (
            <div
              key={s.userId}
              className={`ags-list-item ${selectedStudent?.userId === s.userId ? 'active' : ''}`}
              onClick={() => setSelected(s)}
            >
              <div className="ags-item-avatar">
                {s.profilePictureUrl
                  ? <img src={s.profilePictureUrl} alt={s.name} />
                  : <span>{s.name?.charAt(0)}</span>
                }
              </div>
              <div className="ags-item-info">
                <strong>{s.name}</strong>
                <small>{s.userId}{s.section ? ` · Sec ${s.section}` : ''}</small>
              </div>
              <div>
                {s.subjects?.length > 0
                  ? <span className={`ags-pct ${s.percentage >= 75 ? 'good' : s.percentage >= 50 ? 'ok' : 'bad'}`}>{s.percentage}%</span>
                  : <span className="ags-pct-na">Pending</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right Panel (Preview) ─── */}
      <div className="ags-right">
        {!selectedStudent ? (
          <div className="ags-placeholder">
            <div className="ags-placeholder-icon"><i className="fas fa-file-invoice"></i></div>
            <h3>Select a Student</h3>
            <p>Choose a student from {selectedClass} on the left to preview and print their statement of marks.</p>
          </div>
        ) : (
          <>
            <div className="ags-preview-toolbar">
              <div className="ags-toolbar-info">
                <h3><i className="fas fa-user-graduate"></i> {selectedStudent.name}</h3>
                <small>Roll No: <strong>{selectedStudent.userId}</strong> &bull; Class: <strong>{selectedStudent.program}</strong> &bull; Section: <strong>{selectedStudent.section || 'A'}</strong></small>
              </div>
              <button className="ags-print-btn" onClick={handlePrint}>
                <i className="fas fa-print"></i> Print Formal Grade Sheet (A4)
              </button>
            </div>

            <div className="ags-preview-area">
              <div className="ags-a4-sheet" ref={printRef}>
                <GradeSheet s={selectedStudent} schoolInfo={schoolInfo} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminGradeSheets;
