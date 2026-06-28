import React, { useState, useEffect, useRef } from 'react';
import {
  fetchStudentsFromDB,
  fetchSchoolSettings,
  mergeStudentWithGrades,
  gradeService
} from '../../../services/gradeService';
import defaultLogo from '../../../assets/logo.svg';
import toast from 'react-hot-toast';
import './AdminCertificates.css';

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

const CertificateView = ({ student, schoolInfo, certType }) => {
  const schoolName    = schoolInfo['site_name']       || 'Gurukul Pathshala';
  const schoolAddress = schoolInfo['contact_address'] || 'Kathmandu, Nepal';
  const logoUrl       = resolveLogoUrl(schoolInfo['site_logo']);
  const academicYear  = student.academicYear || schoolInfo['academic_year'] || '2081-2082';
  const today         = student.certificateDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certNo        = student.certificateNo || `CERT-${student.userId || '2026'}`;

  return (
    <div className="cert-wrap">
      <div>
        <div className="cert-header">
          <img src={logoUrl} alt="School Logo" className="cert-logo" onError={(e) => { e.target.src = defaultLogo; }} />
          <h1 className="cert-school-name">{schoolName}</h1>
          <div className="cert-school-sub">{schoolAddress} &bull; AFFILIATED TO NATIONAL EXAMINATION BOARD</div>
        </div>

        <div className="cert-title-box">
          <div className="cert-title">{certType.toUpperCase()}</div>
        </div>

        {certType === 'Character Certificate' ? (
          <div className="cert-body">
            This is to certify that <strong>{student.name}</strong>, Roll Number <strong>{student.userId}</strong>, has been a bona fide student of <strong>{schoolName}</strong> studying in <strong>{student.program || 'Class X'}</strong> during the academic year <strong>{academicYear}</strong>.
            <br /><br />
            During their period of study in this institution, their moral character, conduct, and behavior have been found to be <strong>EXEMPLARY</strong>. They bore a good moral character and took active participation in co-curricular activities. We wish them all success in their future endeavors.
          </div>
        ) : certType === 'Merit / Distinction Certificate' ? (
          <div className="cert-body">
            This Certificate of Merit is proudly awarded to <strong>{student.name}</strong>, Roll Number <strong>{student.userId}</strong> of <strong>{student.program || 'Class X'}</strong>, in recognition of their outstanding academic excellence and achieving <strong>{student.resultStatus || 'DISTINCTION'}</strong> with a Grade Point Average of <strong>{student.gpa || '3.80'} / 4.0</strong> in the Annual Examination of Academic Year <strong>{academicYear}</strong>.
            <br /><br />
            Their dedication, perseverance, and intellectual commitment bring great honor to our institution.
          </div>
        ) : (
          <div className="cert-body">
            This is to proudly certify that <strong>{student.name}</strong>, Enrollment / Roll No. <strong>{student.userId}</strong>, has satisfactorily completed the prescribed course of study for <strong>{student.program || 'Class X'}</strong> during the academic year <strong>{academicYear}</strong>.
            <br /><br />
            Having been examined and evaluated by the faculty of <strong>{schoolName}</strong>, they have successfully passed the final examination securing an overall GPA of <strong>{student.gpa || '3.60'}</strong> on a 4.0 scale (<strong>{student.percentage || '85'}%</strong> - <strong>{student.resultStatus || 'PASSED WITH DISTINCTION'}</strong>).
          </div>
        )}
      </div>

      <div className="cert-footer">
        <div className="cert-date-box">
          <div><strong>Certificate No:</strong> {certNo}</div>
          <div><strong>Date of Issue:</strong> {today}</div>
        </div>

        <div className="cert-sign-box">
          <div className="cert-sign-line"></div>
          <div className="cert-sign-label">Class Teacher</div>
        </div>

        <div className="cert-sign-box">
          <div className="cert-sign-line"></div>
          <div className="cert-sign-label">Principal / Campus Chief</div>
        </div>
      </div>
    </div>
  );
};

const AdminCertificates = () => {
  const [students, setStudents]       = useState([]);
  const [selectedStudent, setSelected]= useState(null);
  const [selectedClass, setClass]     = useState(null);
  const [schoolInfo, setSchoolInfo]   = useState({});
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [certType, setCertType]       = useState('Course Completion Certificate');
  const printRef = useRef();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [list, settings] = await Promise.all([
        fetchStudentsFromDB('ADMIN'),
        fetchSchoolSettings(),
      ]);
      const merged = (list || []).map(s => mergeStudentWithGrades(s));
      setStudents(merged);
      setSchoolInfo(settings);
      setLoading(false);
    };
    init();
  }, []);

  const classes = Array.from(new Set(students.map(s => s.program || 'General').filter(Boolean))).sort();
  const classStudents = students.filter(s => (s.program || 'General') === selectedClass);
  const filteredStudents = classStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handlePublish = () => {
    if (!selectedStudent) return;
    const updated = gradeService.issueCertificate(selectedStudent.userId, {
      certificateType: certType,
      certificateDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      accessGranted: true
    });
    const refreshed = mergeStudentWithGrades(selectedStudent);
    setSelected(refreshed);
    setStudents(p => p.map(s => s.userId === selectedStudent.userId ? refreshed : s));
    toast.success(`Access granted! Certificate & Marks visible to ${selectedStudent.name} in student portal.`);
  };

  return (
    <div className="ac-container">
      {/* CLASS GRID OR SIDEBAR */}
      {!selectedClass ? (
        <div className="ac-page" style={{ flex: 1 }}>
          <div className="ac-header">
            <h1><i className="fas fa-certificate" style={{ color: '#d4af37', marginRight: '10px' }}></i>Student Certification</h1>
            <p>Select a class to generate, preview, and grant student access to graduation and character certificates</p>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: '#64748B' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#6366F1' }}></i>
              <p style={{ marginTop: '12px' }}>Loading classes...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
              {classes.map(c => {
                const count = students.filter(s => (s.program || 'General') === c).length;
                return (
                  <div
                    key={c}
                    onClick={() => { setClass(c); setSelected(null); }}
                    style={{ background: '#fff', padding: '30px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1.5px solid #E2E8F0', transition: 'all 0.2s' }}
                  >
                    <i className="fas fa-user-graduate" style={{ fontSize: '2.8rem', color: '#d4af37', marginBottom: '14px' }}></i>
                    <h3 style={{ color: '#03045e', margin: '0 0 6px', fontSize: '1.25rem' }}>{c}</h3>
                    <p style={{ color: '#64748B', margin: 0, fontWeight: 600 }}>{count} {count === 1 ? 'Student' : 'Students'}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* LEFT PANEL */}
          <div className="ags-left" style={{ width: '320px', background: '#fff', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
              <button onClick={() => { setClass(null); setSelected(null); }} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '8px', fontWeight: 600, color: '#03045e', cursor: 'pointer', width: '100%' }}>
                <i className="fas fa-arrow-left"></i> Back to Classes
              </button>
            </div>
            <div style={{ padding: '12px 16px', background: '#FAFBFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#1E293B' }}>{selectedClass}</strong>
              <span style={{ background: '#FEF3C7', color: '#D97706', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{classStudents.length}</span>
            </div>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9' }}>
              <input type="text" placeholder="Search student..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredStudents.map(s => (
                <div
                  key={s.userId}
                  onClick={() => setSelected(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F8FAFC', background: selectedStudent?.userId === s.userId ? '#FFFBEB' : 'transparent', borderLeft: selectedStudent?.userId === s.userId ? '3px solid #D97706' : 'none' }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4B5563' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1E293B' }}>{s.name}</strong>
                    <small style={{ color: '#64748B' }}>{s.userId}</small>
                  </div>
                  {s.accessGranted && <i className="fas fa-check-circle" style={{ color: '#10B981', title: 'Visible to Student' }}></i>}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!selectedStudent ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                <i className="fas fa-award" style={{ fontSize: '3.5rem', marginBottom: '14px', color: '#CBD5E1' }}></i>
                <h3 style={{ margin: '0 0 6px', color: '#64748B' }}>Select a Student</h3>
                <p style={{ margin: 0 }}>Choose a student to generate and preview their certificate.</p>
              </div>
            ) : (
              <>
                <div className="ac-toolbar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <strong style={{ fontSize: '1rem', color: '#1E293B' }}>{selectedStudent.name}</strong>
                    <select className="ac-select-type" value={certType} onChange={e => setCertType(e.target.value)}>
                      <option value="Course Completion Certificate">Course Completion Certificate</option>
                      <option value="Character Certificate">Character Certificate</option>
                      <option value="Merit / Distinction Certificate">Merit / Distinction Certificate</option>
                    </select>
                  </div>

                  <div className="ac-btn-group">
                    <button className={`ac-publish-btn ${selectedStudent.accessGranted ? 'published' : ''}`} onClick={handlePublish}>
                      <i className={`fas ${selectedStudent.accessGranted ? 'fa-check-double' : 'fa-share-square'}`}></i>
                      {selectedStudent.accessGranted ? 'Access Granted (Visible to Student)' : 'Grant Student Access'}
                    </button>
                    <button className="ac-print-btn" onClick={handlePrint}>
                      <i className="fas fa-print"></i> Print Certificate
                    </button>
                  </div>
                </div>

                <div className="ac-preview-area">
                  <div className="ac-sheet" ref={printRef}>
                    <CertificateView student={selectedStudent} schoolInfo={schoolInfo} certType={certType} />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCertificates;
