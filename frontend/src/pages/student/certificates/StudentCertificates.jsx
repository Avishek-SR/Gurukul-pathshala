import React, { useState, useEffect } from 'react';
import { fetchStudentsFromDB, fetchSchoolSettings, mergeStudentWithGrades } from '../../../services/gradeService';
import defaultLogo from '../../../assets/logo.svg';
import './StudentCertificates.css';
import '../../admin/certificates/AdminCertificates.css';

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
  const academicYear  = student?.academicYear || schoolInfo['academic_year'] || '2081-2082';
  const today         = student?.certificateDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certNo        = student?.certificateNo || `CERT-${student?.userId || '2026'}`;

  return (
    <div className="cert-wrap" style={{ minWidth: '850px' }}>
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
            This is to certify that <strong>{student?.name}</strong>, Roll Number <strong>{student?.userId}</strong>, has been a bona fide student of <strong>{schoolName}</strong> studying in <strong>{student?.program || 'Class X'}</strong> during the academic year <strong>{academicYear}</strong>.
            <br /><br />
            During their period of study in this institution, their moral character, conduct, and behavior have been found to be <strong>EXEMPLARY</strong>. They bore a good moral character and took active participation in co-curricular activities. We wish them all success in their future endeavors.
          </div>
        ) : certType === 'Merit / Distinction Certificate' ? (
          <div className="cert-body">
            This Certificate of Merit is proudly awarded to <strong>{student?.name}</strong>, Roll Number <strong>{student?.userId}</strong> of <strong>{student?.program || 'Class X'}</strong>, in recognition of their outstanding academic excellence and achieving <strong>{student?.resultStatus || 'DISTINCTION'}</strong> with a Grade Point Average of <strong>{student?.gpa || '3.80'} / 4.0</strong> in the Annual Examination of Academic Year <strong>{academicYear}</strong>.
            <br /><br />
            Their dedication, perseverance, and intellectual commitment bring great honor to our institution.
          </div>
        ) : (
          <div className="cert-body">
            This is to proudly certify that <strong>{student?.name}</strong>, Enrollment / Roll No. <strong>{student?.userId}</strong>, has satisfactorily completed the prescribed course of study for <strong>{student?.program || 'Class X'}</strong> during the academic year <strong>{academicYear}</strong>.
            <br /><br />
            Having been examined and evaluated by the faculty of <strong>{schoolName}</strong>, they have successfully passed the final examination securing an overall GPA of <strong>{student?.gpa || '3.60'}</strong> on a 4.0 scale (<strong>{student?.percentage || '85'}%</strong> - <strong>{student?.resultStatus || 'PASSED WITH DISTINCTION'}</strong>).
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

const StudentCertificates = () => {
  const [student, setStudent]       = useState(null);
  const [schoolInfo, setSchoolInfo] = useState({});
  const [loading, setLoading]       = useState(true);
  const [activeCert, setActiveCert] = useState(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [list, settings] = await Promise.all([
        fetchStudentsFromDB('STUDENT'),
        fetchSchoolSettings(),
      ]);
      if (list && list.length > 0) {
        setStudent(mergeStudentWithGrades(list[0]));
      }
      setSchoolInfo(settings);
      setLoading(false);
    };
    init();
  }, []);

  const certOptions = [
    { type: 'Course Completion Certificate', icon: 'fa-graduation-cap', desc: 'Official academic certificate confirming successful completion of the grade curriculum.' },
    { type: 'Character Certificate', icon: 'fa-award', desc: 'Certifies conduct, behavior, and moral character during tenure at Gurukul Pathshala.' },
    { type: 'Merit / Distinction Certificate', icon: 'fa-star', desc: 'Awarded for outstanding academic achievement and maintaining high grade point average.' },
  ];

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}><i className="fas fa-spinner fa-spin"></i> Loading certificates...</div>;
  }

  return (
    <div className="sc-container">
      <div className="sc-header">
        <h1><i className="fas fa-certificate" style={{ color: '#d4af37', marginRight: '12px' }}></i>My Certificates</h1>
        <p>View and download official academic and character certificates issued by Gurukul Pathshala.</p>
      </div>

      {!student?.accessGranted && student?.subjects?.length === 0 ? (
        <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid #E2E8F0', maxWidth: '600px', margin: '40px auto' }}>
          <i className="fas fa-lock" style={{ fontSize: '3rem', color: '#CBD5E1', marginBottom: '16px' }}></i>
          <h3 style={{ color: '#1E293B' }}>Certificates Not Yet Published</h3>
          <p style={{ color: '#64748B' }}>Your final academic evaluations or completion certificates have not yet been released by the administration.</p>
        </div>
      ) : (
        <div className="sc-card-grid">
          {certOptions.map((c, i) => (
            <div key={i} className="sc-card">
              <div>
                <div className="sc-card-icon"><i className={`fas ${c.icon}`}></i></div>
                <h3 className="sc-card-title">{c.type}</h3>
                <p className="sc-card-desc">{c.desc}</p>
              </div>
              <button className="sc-view-btn" onClick={() => setActiveCert(c.type)}>
                <i className="fas fa-eye"></i> View & Print
              </button>
            </div>
          ))}
        </div>
      )}

      {activeCert && (
        <div className="sc-modal-overlay" onClick={() => setActiveCert(null)}>
          <div className="sc-modal-content" onClick={e => e.stopPropagation()}>
            <button className="sc-close-btn" onClick={() => setActiveCert(null)}><i className="fas fa-times"></i></button>
            <div style={{ paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#03045e' }}>{activeCert}</h3>
              <button onClick={() => window.print()} style={{ background: '#03045e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', marginRight: '45px' }}>
                <i className="fas fa-print"></i> Print / Save PDF
              </button>
            </div>
            <div style={{ overflowX: 'auto', border: '1px solid #CBD5E1' }}>
              <CertificateView student={student} schoolInfo={schoolInfo} certType={activeCert} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;
