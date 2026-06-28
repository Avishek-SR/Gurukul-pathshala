import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchStudentsFromDB,
  fetchSchoolSettings,
  mergeStudentWithGrades,
  enrichStudentGradeData,
  calculateGradeMetrics
} from '../../../services/gradeService';
import toast from 'react-hot-toast';
import './AdminGradeSheets.css';

const AdminGradeSheets = () => {
  const [students, setStudents]       = useState([]);
  const [selectedStudent, setSelected] = useState(null);
  const [searchQuery, setSearch]      = useState('');
  const [loading, setLoading]         = useState(true);
  const [schoolInfo, setSchoolInfo]   = useState({});
  const printRef                      = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dbStudents, settings] = await Promise.all([
        fetchStudentsFromDB(),
        fetchSchoolSettings()
      ]);
      setSchoolInfo(settings);
      setStudents(dbStudents.map(mergeStudentWithGrades));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePrint = () => {
    if (!selectedStudent) return;
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Grade Sheet – ${selectedStudent.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; background: #fff; }
          .gs-print-wrap { width: 190mm; margin: 0 auto; padding: 8mm 10mm; }

          /* Header */
          .gs-school-header { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 10px; }
          .gs-school-header img { height: 55px; margin-bottom: 4px; }
          .gs-school-name { font-size: 16pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
          .gs-school-sub  { font-size: 9pt; color: #444; margin-top: 1px; }
          .gs-doc-title   { font-size: 12pt; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;
                            margin: 8px 0; padding: 4px 0; border-top: 1px solid #000; border-bottom: 1px solid #000; }

          /* Student Info Table */
          .gs-info-table  { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          .gs-info-table td { padding: 3px 6px; font-size: 10pt; vertical-align: top; }
          .gs-info-table .lbl { font-weight: bold; width: 38%; color: #333; }
          .gs-info-table .val { border-bottom: 1px dotted #999; width: 62%; }
          .gs-info-section { border: 1px solid #ccc; padding: 6px 8px; margin-bottom: 10px; }
          .gs-section-title { font-size: 9pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;
                               background: #f0f0f0; padding: 2px 6px; margin-bottom: 5px; border-left: 3px solid #333; }

          /* Marks Table */
          .gs-marks-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt; }
          .gs-marks-table th { background: #2c2c2c; color: #fff; padding: 5px 6px; text-align: center; font-size: 9.5pt; }
          .gs-marks-table td { padding: 4px 6px; border: 1px solid #ccc; text-align: center; }
          .gs-marks-table tr:nth-child(even) td { background: #f8f8f8; }
          .gs-marks-table td:nth-child(3) { text-align: left; }
          .gs-marks-table .fail-row td { background: #fff0f0 !important; }

          /* Summary */
          .gs-summary { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          .gs-summary td { padding: 4px 8px; border: 1px solid #ccc; font-size: 10pt; }
          .gs-summary .s-lbl { font-weight: bold; background: #f5f5f5; width: 40%; }
          .gs-result-box { text-align: center; padding: 6px; border: 2px solid #000;
                           font-size: 12pt; font-weight: bold; letter-spacing: 2px; margin-bottom: 12px; }
          .gs-result-pass { color: #1a6b3a; border-color: #1a6b3a; }
          .gs-result-fail { color: #c0392b; border-color: #c0392b; }

          /* Grade Legend */
          .gs-legend { display: flex; gap: 6px; flex-wrap: wrap; font-size: 8.5pt; margin-bottom: 12px; }
          .gs-legend-item { border: 1px solid #ccc; padding: 2px 6px; border-radius: 3px; }

          /* Signature */
          .gs-sign-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 10px; }
          .gs-sign-block { text-align: center; width: 28%; }
          .gs-sign-line  { border-top: 1px solid #000; margin-bottom: 4px; }
          .gs-sign-label { font-size: 9pt; font-weight: bold; }

          /* Watermark */
          .gs-watermark { text-align: center; font-size: 8pt; color: #aaa; margin-top: 14px;
                          border-top: 1px dotted #ccc; padding-top: 6px; }

          @page { size: A4 portrait; margin: 10mm 10mm; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="gs-print-wrap">${printContent}</div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const filtered = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
           s.userId.toLowerCase().includes(q) ||
           (s.program || '').toLowerCase().includes(q);
  });

  const schoolName    = schoolInfo['site_name']    || 'Gurukul Pathshala';
  const schoolAddress = schoolInfo['contact_address'] || '';
  const schoolPhone   = schoolInfo['contact_phone']   || '';
  const schoolEmail   = schoolInfo['contact_email']   || '';
  const logoUrl       = schoolInfo['site_logo']
    ? `http://localhost:3000${schoolInfo['site_logo']}`
    : null;
  const academicYear  = schoolInfo['academic_year'] || '';

  const today = new Date().toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' });

  const GradeSheetContent = ({ s }) => {
    const isFail = s.resultStatus === 'NEEDS RE-EXAMINATION';
    return (
      <div className="gs-print-wrap">
        {/* School Header */}
        <div className="gs-school-header">
          {logoUrl && <img src={logoUrl} alt="School Logo" />}
          <div className="gs-school-name">{schoolName}</div>
          <div className="gs-school-sub">{schoolAddress}{schoolAddress && schoolPhone ? ' | ' : ''}{schoolPhone}</div>
          {schoolEmail && <div className="gs-school-sub">{schoolEmail}</div>}
          <div className="gs-doc-title">Statement of Marks / Grade Sheet</div>
        </div>

        {/* Student Information */}
        <div className="gs-info-section">
          <div className="gs-section-title">Student Information</div>
          <table className="gs-info-table">
            <tbody>
              <tr>
                <td className="lbl">Student Name</td>
                <td className="val"><strong>{s.name}</strong></td>
              </tr>
              <tr>
                <td className="lbl">Enrollment / Roll No.</td>
                <td className="val">{s.userId}</td>
              </tr>
              <tr>
                <td className="lbl">Class / Program</td>
                <td className="val">{s.program || '—'}</td>
              </tr>
              <tr>
                <td className="lbl">Section</td>
                <td className="val">{s.section || '—'}</td>
              </tr>
              {s.gender && (
                <tr>
                  <td className="lbl">Gender</td>
                  <td className="val">{s.gender}</td>
                </tr>
              )}
              {s.dob && (
                <tr>
                  <td className="lbl">Date of Birth</td>
                  <td className="val">{s.dob}</td>
                </tr>
              )}
              <tr>
                <td className="lbl">Academic Year</td>
                <td className="val">{s.academicYear || academicYear || '—'}</td>
              </tr>
              {s.semester && (
                <tr>
                  <td className="lbl">Term / Semester</td>
                  <td className="val">{s.semester}</td>
                </tr>
              )}
              <tr>
                <td className="lbl">Issue Date</td>
                <td className="val">{today}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Marks Table */}
        {s.subjects?.length > 0 ? (
          <div className="gs-info-section">
            <div className="gs-section-title">Academic Performance</div>
            <table className="gs-marks-table">
              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>Code</th>
                  <th>Subject / Module</th>
                  <th>Credit</th>
                  <th>Full<br/>Marks</th>
                  <th>Pass<br/>Marks</th>
                  <th>Obtained</th>
                  <th>%</th>
                  <th>Grade</th>
                  <th>GP</th>
                </tr>
              </thead>
              <tbody>
                {s.subjects.map((sub, i) => {
                  const m = calculateGradeMetrics(sub.score, sub.maxScore || 100);
                  const passMarks = Math.ceil((sub.maxScore || 100) * 0.4);
                  return (
                    <tr key={i} className={m.grade === 'F' ? 'fail-row' : ''}>
                      <td>{i + 1}</td>
                      <td>{sub.code}</td>
                      <td style={{ textAlign: 'left' }}>{sub.subject}</td>
                      <td>{sub.credit}</td>
                      <td>{sub.maxScore || 100}</td>
                      <td>{passMarks}</td>
                      <td><strong>{sub.score}</strong></td>
                      <td>{m.percentage}%</td>
                      <td><strong>{m.grade}</strong></td>
                      <td>{m.gradePoint.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gs-info-section" style={{ textAlign: 'center', color: '#888', padding: '16px' }}>
            No marks entered yet. Faculty needs to enter grades first.
          </div>
        )}

        {/* Summary */}
        {s.subjects?.length > 0 && (
          <>
            <div className="gs-info-section">
              <div className="gs-section-title">Summary</div>
              <table className="gs-summary">
                <tbody>
                  <tr>
                    <td className="s-lbl">Total Marks Obtained</td>
                    <td>{s.totalScore} / {s.maxTotalScore}</td>
                    <td className="s-lbl">Overall Percentage</td>
                    <td><strong>{s.percentage}%</strong></td>
                  </tr>
                  <tr>
                    <td className="s-lbl">Total Credit Hours</td>
                    <td>{s.totalCredits}</td>
                    <td className="s-lbl">GPA (4.0 Scale)</td>
                    <td><strong>{s.gpa}</strong></td>
                  </tr>
                  <tr>
                    <td className="s-lbl">GPA (10.0 Scale)</td>
                    <td><strong>{s.gpa10}</strong></td>
                    <td className="s-lbl">Subjects Appeared</td>
                    <td>{s.subjects.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={`gs-result-box ${isFail ? 'gs-result-fail' : 'gs-result-pass'}`}>
              {s.resultStatus}
            </div>
          </>
        )}

        {/* Remarks */}
        {s.remarks && (
          <div className="gs-info-section">
            <div className="gs-section-title">Remarks</div>
            <p style={{ fontSize: '10pt', padding: '2px 0' }}>{s.remarks}</p>
          </div>
        )}

        {/* Grade Legend */}
        <div className="gs-info-section">
          <div className="gs-section-title">Grade Scale</div>
          <div className="gs-legend">
            {[['A+','≥90','10.0'],['A','80–89','9.0'],['B+','75–79','8.0'],['B','70–74','7.0'],
              ['C','60–69','6.0'],['D','50–59','5.0'],['F','<50','0.0']].map(([g,r,p]) => (
              <span key={g} className="gs-legend-item">{g}: {r}% (GP {p})</span>
            ))}
          </div>
        </div>

        {/* Signature */}
        <div className="gs-sign-row">
          <div className="gs-sign-block">
            <div className="gs-sign-line"></div>
            <div className="gs-sign-label">Class Teacher</div>
          </div>
          <div className="gs-sign-block">
            <div className="gs-sign-line"></div>
            <div className="gs-sign-label">Examination Controller</div>
          </div>
          <div className="gs-sign-block">
            <div className="gs-sign-line"></div>
            <div className="gs-sign-label">Principal / Head</div>
          </div>
        </div>

        <div className="gs-watermark">
          This is a computer-generated document. • {schoolName} • {today}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-grades-container">
      {/* ─── Left sidebar ─── */}
      <div className="ags-left">
        <div className="ags-panel-header">
          <h2><i className="fas fa-file-alt"></i> Grade Sheets</h2>
          <span className="ags-count">{students.length} students</span>
        </div>

        <div className="ags-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, ID, or class..."
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="ags-list-scroll">
          {loading ? (
            <div className="ags-loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="ags-empty"><i className="fas fa-folder-open"></i><p>No students found</p></div>
          ) : filtered.map(s => (
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
                <small>{s.userId}</small>
                <small>{s.program || 'N/A'}{s.section ? ` – ${s.section}` : ''}</small>
              </div>
              <div className="ags-item-right">
                <span className={`ags-pct ${s.percentage >= 75 ? 'good' : s.percentage >= 50 ? 'ok' : 'bad'}`}>
                  {s.subjects?.length > 0 ? `${s.percentage}%` : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right grade sheet preview ─── */}
      <div className="ags-right">
        {!selectedStudent ? (
          <div className="ags-placeholder">
            <i className="fas fa-file-invoice" style={{ fontSize: '3.5rem', color: '#CBD5E1' }}></i>
            <h3>Select a Student</h3>
            <p>Choose a student from the list to preview their grade sheet.</p>
          </div>
        ) : (
          <>
            <div className="ags-preview-toolbar">
              <h3>{selectedStudent.name}'s Grade Sheet</h3>
              <button className="ags-print-btn" onClick={handlePrint}>
                <i className="fas fa-print"></i> Print / Download PDF
              </button>
            </div>

            <div className="ags-preview-area">
              <div className="ags-a4-sheet" ref={printRef}>
                <GradeSheetContent s={selectedStudent} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminGradeSheets;
