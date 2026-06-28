import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchStudentsFromDB,
  fetchSchoolSettings,
  mergeStudentWithGrades,
  calculateGradeMetrics,
} from '../../../services/gradeService';
import toast from 'react-hot-toast';
import './AdminGradeSheets.css';

// ─── Grade Sheet Component (used for both preview & print) ──────────────────
const GradeSheet = ({ s, schoolInfo }) => {
  const schoolName    = schoolInfo['site_name']    || 'Gurukul Pathshala';
  const schoolAddress = schoolInfo['contact_address'] || '';
  const schoolPhone   = schoolInfo['contact_phone']   || '';
  const schoolEmail   = schoolInfo['contact_email']   || '';
  const logoSrc       = schoolInfo['site_logo']
    ? `${window.location.origin}${schoolInfo['site_logo'].startsWith('/') ? '' : '/'}${schoolInfo['site_logo']}`
    : null;
  const academicYearSetting = schoolInfo['academic_year'] || '';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const isFail = s.resultStatus === 'NEEDS RE-EXAMINATION';

  return (
    <div className="gs-page">

      {/* ══ SCHOOL HEADER ══════════════════════════════════════ */}
      <div className="gs-header">
        <div className="gs-header-logo-block">
          {logoSrc && (
            <img src={logoSrc} alt="School Logo" className="gs-logo" onError={e => e.target.style.display='none'} />
          )}
          <div className="gs-header-text">
            <div className="gs-school-name">{schoolName}</div>
            {(schoolAddress || schoolPhone) && (
              <div className="gs-school-contact">
                {schoolAddress}{schoolAddress && schoolPhone ? ' | ' : ''}{schoolPhone}
              </div>
            )}
            {schoolEmail && <div className="gs-school-contact">{schoolEmail}</div>}
          </div>
          {logoSrc && (
            <img src={logoSrc} alt="School Logo" className="gs-logo gs-logo-right" onError={e => e.target.style.display='none'} />
          )}
        </div>
        <div className="gs-doc-banner">
          <span className="gs-doc-title">STATEMENT OF MARKS</span>
          <span className="gs-doc-sub">Academic Grade Report</span>
        </div>
      </div>

      {/* ══ STUDENT INFO ═══════════════════════════════════════ */}
      <div className="gs-info-grid">
        <div className="gs-info-col">
          <div className="gs-info-row"><span className="gs-lbl">Student Name</span><span className="gs-val"><strong>{s.name}</strong></span></div>
          <div className="gs-info-row"><span className="gs-lbl">Enrollment / Roll No.</span><span className="gs-val">{s.userId}</span></div>
          <div className="gs-info-row"><span className="gs-lbl">Class / Program</span><span className="gs-val">{s.program || '—'}</span></div>
          <div className="gs-info-row"><span className="gs-lbl">Section</span><span className="gs-val">{s.section || '—'}</span></div>
          {s.gender && <div className="gs-info-row"><span className="gs-lbl">Gender</span><span className="gs-val">{s.gender}</span></div>}
        </div>
        <div className="gs-info-col">
          {s.dob && <div className="gs-info-row"><span className="gs-lbl">Date of Birth</span><span className="gs-val">{s.dob}</span></div>}
          <div className="gs-info-row"><span className="gs-lbl">Academic Year</span><span className="gs-val">{s.academicYear || academicYearSetting || '—'}</span></div>
          {s.semester && <div className="gs-info-row"><span className="gs-lbl">Term / Semester</span><span className="gs-val">{s.semester}</span></div>}
          <div className="gs-info-row"><span className="gs-lbl">Issue Date</span><span className="gs-val">{today}</span></div>
          <div className="gs-info-row"><span className="gs-lbl">Status</span>
            <span className="gs-val"><span className={`gs-status-chip ${isFail ? 'fail' : 'pass'}`}>{s.resultStatus !== 'N/A' ? (isFail ? 'FAIL' : 'PASS') : 'PENDING'}</span></span>
          </div>
        </div>
      </div>

      {/* ══ MARKS TABLE ════════════════════════════════════════ */}
      {s.subjects?.length > 0 ? (
        <div className="gs-section">
          <div className="gs-section-label">Academic Performance</div>
          <table className="gs-table">
            <thead>
              <tr>
                <th>S.N.</th>
                <th>Code</th>
                <th className="gs-th-left">Subject / Module</th>
                <th>Credit</th>
                <th>Full<br/>Marks</th>
                <th>Pass<br/>Marks</th>
                <th>Obtained</th>
                <th>%</th>
                <th>Grade</th>
                <th>GP (10)</th>
              </tr>
            </thead>
            <tbody>
              {s.subjects.map((sub, i) => {
                const m = calculateGradeMetrics(sub.score, sub.maxScore || 100);
                const passMarks = Math.ceil((sub.maxScore || 100) * 0.4);
                return (
                  <tr key={i} className={m.grade === 'F' ? 'gs-fail-row' : ''}>
                    <td>{i + 1}</td>
                    <td className="gs-code">{sub.code}</td>
                    <td className="gs-th-left">{sub.subject}</td>
                    <td>{sub.credit}</td>
                    <td>{sub.maxScore || 100}</td>
                    <td>{passMarks}</td>
                    <td><strong>{sub.score}</strong></td>
                    <td>{m.percentage}%</td>
                    <td><strong style={{ color: m.color }}>{m.grade}</strong></td>
                    <td>{m.gradePoint.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="gs-no-marks">Marks not entered yet — faculty needs to enter grades first.</div>
      )}

      {/* ══ SUMMARY ════════════════════════════════════════════ */}
      {s.subjects?.length > 0 && (
        <>
          <div className="gs-section">
            <div className="gs-section-label">Summary</div>
            <div className="gs-summary-grid">
              <div className="gs-sum-box">
                <span className="gs-sum-val">{s.totalScore} / {s.maxTotalScore}</span>
                <span className="gs-sum-lbl">Total Marks</span>
              </div>
              <div className="gs-sum-box highlight">
                <span className="gs-sum-val">{s.percentage}%</span>
                <span className="gs-sum-lbl">Percentage</span>
              </div>
              <div className="gs-sum-box">
                <span className="gs-sum-val">{s.gpa}</span>
                <span className="gs-sum-lbl">GPA (4.0 Scale)</span>
              </div>
              <div className="gs-sum-box">
                <span className="gs-sum-val">{s.gpa10}</span>
                <span className="gs-sum-lbl">GPA (10.0 Scale)</span>
              </div>
              <div className="gs-sum-box">
                <span className="gs-sum-val">{s.totalCredits}</span>
                <span className="gs-sum-lbl">Total Credits</span>
              </div>
              <div className="gs-sum-box">
                <span className="gs-sum-val">{s.subjects.length}</span>
                <span className="gs-sum-lbl">Subjects</span>
              </div>
            </div>
          </div>

          <div className={`gs-result-banner ${isFail ? 'fail' : 'pass'}`}>
            {isFail ? '✗' : '✓'}&nbsp;&nbsp;{s.resultStatus}
          </div>
        </>
      )}

      {/* ══ REMARKS ════════════════════════════════════════════ */}
      {s.remarks && (
        <div className="gs-section">
          <div className="gs-section-label">Remarks</div>
          <p className="gs-remarks-text">{s.remarks}</p>
        </div>
      )}

      {/* ══ GRADE LEGEND ═══════════════════════════════════════ */}
      <div className="gs-legend-row">
        <span className="gs-legend-title">Grade Scale:</span>
        {[['A+','≥90%','10.0'],['A','80–89%','9.0'],['B+','75–79%','8.0'],['B','70–74%','7.0'],
          ['C','60–69%','6.0'],['D','50–59%','5.0'],['F','<50%','0.0']].map(([g,r,p]) => (
          <span key={g} className="gs-legend-chip">{g}: {r} (GP {p})</span>
        ))}
      </div>

      {/* ══ SIGNATURES ═════════════════════════════════════════ */}
      <div className="gs-signature-row">
        {['Class Teacher', 'Examination Controller', 'Principal / Head'].map(role => (
          <div key={role} className="gs-sign-block">
            <div className="gs-sign-space"></div>
            <div className="gs-sign-line"></div>
            <div className="gs-sign-label">{role}</div>
          </div>
        ))}
      </div>

      {/* ══ WATERMARK ══════════════════════════════════════════ */}
      <div className="gs-watermark">
        This is a computer-generated document. Verify authenticity with the school office. &bull; {schoolName} &bull; {today}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const AdminGradeSheets = () => {
  const [students, setStudents]       = useState([]);
  const [selectedStudent, setSelected] = useState(null);
  const [searchQuery, setSearch]      = useState('');
  const [activeClass, setActiveClass] = useState('All');
  const [loading, setLoading]         = useState(true);
  const [schoolInfo, setSchoolInfo]   = useState({});
  const printRef                      = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dbStudents, settings] = await Promise.all([
        fetchStudentsFromDB('ADMIN'),
        fetchSchoolSettings()
      ]);
      setSchoolInfo(settings);
      const enriched = dbStudents.map(mergeStudentWithGrades);
      // Sort by program then name
      enriched.sort((a, b) => {
        const p = (a.program || '').localeCompare(b.program || '');
        return p !== 0 ? p : a.name.localeCompare(b.name);
      });
      setStudents(enriched);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Class grouping ──────────────────────────────────────────
  const classes = ['All', ...Array.from(new Set(students.map(s => s.program || 'General').filter(Boolean))).sort()];

  const filtered = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchClass = activeClass === 'All' || s.program === activeClass;
    const matchQ = s.name.toLowerCase().includes(q) || s.userId.toLowerCase().includes(q);
    return matchClass && matchQ;
  });

  // Group filtered by class for display
  const groupedByClass = filtered.reduce((acc, s) => {
    const cls = s.program || 'General';
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(s);
    return acc;
  }, {});

  // ── Print ───────────────────────────────────────────────────
  const handlePrint = () => {
    if (!selectedStudent || !printRef.current) return;
    const win = window.open('', '_blank');
    const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"/>
<title>Grade Sheet – ${selectedStudent.name}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Times New Roman', serif; font-size: 10.5pt; background: #fff; color: #111; }

/* ── Page ── */
.gs-page { width: 190mm; margin: 0 auto; padding: 8mm 10mm 6mm; min-height: 277mm; }

/* ── Header ── */
.gs-header { border-bottom: 3px double #333; padding-bottom: 8px; margin-bottom: 10px; text-align: center; }
.gs-header-logo-block { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 6px; }
.gs-logo { height: 60px; width: auto; object-fit: contain; }
.gs-header-text { flex: 1; }
.gs-school-name { font-size: 18pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; line-height: 1.1; }
.gs-school-contact { font-size: 9pt; color: #555; margin-top: 2px; }
.gs-doc-banner { background: #1e293b; color: #fff; padding: 5px 0; margin-top: 6px; display: flex; flex-direction: column; align-items: center; gap: 1px; }
.gs-doc-title { font-size: 13pt; font-weight: bold; letter-spacing: 4px; }
.gs-doc-sub   { font-size: 8pt; letter-spacing: 2px; opacity: 0.8; }

/* ── Info Grid ── */
.gs-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; border: 1px solid #ccc; padding: 6px 10px; margin-bottom: 8px; }
.gs-info-row  { display: flex; gap: 6px; padding: 2.5px 0; border-bottom: 1px dotted #e0e0e0; font-size: 9.5pt; }
.gs-lbl { font-weight: bold; color: #444; width: 48%; flex-shrink: 0; }
.gs-val { flex: 1; }
.gs-status-chip { display: inline-block; padding: 0 8px; border-radius: 20px; font-size: 8.5pt; font-weight: bold; }
.gs-status-chip.pass { background: #dcfce7; color: #166534; }
.gs-status-chip.fail { background: #fee2e2; color: #991b1b; }

/* ── Section ── */
.gs-section { margin-bottom: 8px; }
.gs-section-label { font-size: 8.5pt; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase;
                     background: #f0f0f0; padding: 3px 8px; border-left: 3px solid #1e293b; margin-bottom: 4px; }

/* ── Table ── */
.gs-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
.gs-table th { background: #1e293b; color: #fff; padding: 5px 4px; text-align: center; border: 1px solid #555; font-size: 8.5pt; }
.gs-table td { padding: 4px 4px; border: 1px solid #ccc; text-align: center; }
.gs-table tr:nth-child(even) td { background: #f9f9f9; }
.gs-th-left { text-align: left !important; padding-left: 7px !important; }
.gs-code { font-family: monospace; font-size: 8.5pt; font-weight: bold; }
.gs-fail-row td { background: #fff0f0 !important; color: #991b1b; }

/* ── Summary ── */
.gs-summary-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 4px; }
.gs-sum-box { border: 1px solid #ddd; padding: 5px 4px; text-align: center; border-radius: 2px; }
.gs-sum-box.highlight { background: #1e293b; border-color: #1e293b; }
.gs-sum-box.highlight .gs-sum-val, .gs-sum-box.highlight .gs-sum-lbl { color: #fff; }
.gs-sum-val { display: block; font-size: 12pt; font-weight: bold; color: #1e293b; line-height: 1.2; }
.gs-sum-lbl { display: block; font-size: 7.5pt; color: #666; margin-top: 2px; }

/* ── Result Banner ── */
.gs-result-banner { text-align: center; padding: 7px; border: 2px solid; font-size: 13pt; font-weight: bold;
                     letter-spacing: 3px; margin: 8px 0; border-radius: 2px; }
.gs-result-banner.pass { color: #166534; border-color: #166534; background: #f0fdf4; }
.gs-result-banner.fail { color: #991b1b; border-color: #991b1b; background: #fef2f2; }

/* ── Remarks ── */
.gs-no-marks   { text-align: center; padding: 16px; color: #888; font-size: 9.5pt; margin-bottom: 8px; border: 1px dashed #ccc; }
.gs-remarks-text { font-size: 9.5pt; padding: 2px 0; }

/* ── Legend ── */
.gs-legend-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; align-items: center; }
.gs-legend-title { font-size: 8pt; font-weight: bold; margin-right: 2px; }
.gs-legend-chip { font-size: 7.5pt; border: 1px solid #ccc; padding: 1px 5px; border-radius: 3px; background: #f9f9f9; }

/* ── Signatures ── */
.gs-signature-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 10px; }
.gs-sign-block { text-align: center; width: 28%; }
.gs-sign-space { height: 30px; }
.gs-sign-line  { border-top: 1.5px solid #333; margin-bottom: 4px; }
.gs-sign-label { font-size: 8.5pt; font-weight: bold; }

/* ── Watermark ── */
.gs-watermark { text-align: center; font-size: 7.5pt; color: #aaa; margin-top: 12px; border-top: 1px dotted #ddd; padding-top: 5px; }

@page { size: A4 portrait; margin: 8mm 8mm; }
</style>
</head><body>
<div>${printRef.current.innerHTML}</div>
</body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="admin-grades-container">
      {/* ─── Left sidebar ─── */}
      <div className="ags-left">
        <div className="ags-panel-header">
          <h2><i className="fas fa-graduation-cap"></i> Grade Sheets</h2>
          <span className="ags-count">{students.length}</span>
        </div>

        <div className="ags-search">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search name or ID..." value={searchQuery} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Class Tabs */}
        {classes.length > 1 && (
          <div className="ags-class-tabs">
            {classes.map(c => (
              <button key={c} className={`ags-class-tab ${activeClass === c ? 'active' : ''}`} onClick={() => setActiveClass(c)}>
                {c === 'All' ? 'All Classes' : c}
              </button>
            ))}
          </div>
        )}

        <div className="ags-list-scroll">
          {loading ? (
            <div className="ags-loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>
          ) : Object.keys(groupedByClass).length === 0 ? (
            <div className="ags-empty"><i className="fas fa-folder-open"></i><p>No students found</p></div>
          ) : Object.entries(groupedByClass).map(([className, classStudents]) => (
            <div key={className} className="ags-class-group">
              <div className="ags-class-group-header">
                <i className="fas fa-chalkboard"></i>
                {className}
                <span className="ags-class-count">{classStudents.length}</span>
              </div>
              {classStudents.map(s => (
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
                      : <span className="ags-pct-na">N/A</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right panel ─── */}
      <div className="ags-right">
        {!selectedStudent ? (
          <div className="ags-placeholder">
            <div className="ags-placeholder-icon"><i className="fas fa-file-invoice"></i></div>
            <h3>Select a Student</h3>
            <p>Choose a student from the list (organized by class) to preview their official grade sheet.</p>
          </div>
        ) : (
          <>
            <div className="ags-preview-toolbar">
              <div className="ags-toolbar-info">
                <h3><i className="fas fa-id-card"></i> {selectedStudent.name}</h3>
                <small>{selectedStudent.program} {selectedStudent.section ? `· Section ${selectedStudent.section}` : ''} · {selectedStudent.userId}</small>
              </div>
              <button className="ags-print-btn" onClick={handlePrint}>
                <i className="fas fa-print"></i> Print / Save PDF
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
