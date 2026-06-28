import React, { useState, useEffect } from 'react';
import './AdmissionsManagement.css';
import { adminAdmissions, settingsAPI, publicAdmission } from '../../../services/api';

// ── Status helpers ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:        { label: 'Pending Review',   color: 'pending',        icon: 'fa-inbox' },
  ACCEPTED:       { label: 'Accepted',         color: 'accepted',       icon: 'fa-envelope-open-text' },
  EXAM_SCHEDULED: { label: 'Exam Scheduled',   color: 'exam_scheduled', icon: 'fa-calendar-check' },
  ADMITTED:       { label: 'Admitted',         color: 'admitted',       icon: 'fa-check-circle' },
  REJECTED:       { label: 'Rejected',         color: 'rejected',       icon: 'fa-times-circle' },
};

// Workflow pipeline stages shown as a visual stepper
const PIPELINE_STEPS = ['PENDING', 'ACCEPTED', 'EXAM_SCHEDULED', 'ADMITTED'];

const StepIndicator = ({ status }) => {
  const currentIdx = PIPELINE_STEPS.indexOf(status);
  return (
    <div className="pipeline-stepper">
      {PIPELINE_STEPS.map((step, idx) => {
        const done    = currentIdx > idx;
        const current = currentIdx === idx && status !== 'REJECTED';
        const cfg     = STATUS_CONFIG[step];
        return (
          <React.Fragment key={step}>
            <div className={`pipeline-step ${done ? 'done' : ''} ${current ? 'current' : ''} ${status === 'REJECTED' ? 'rejected-step' : ''}`}>
              <div className="step-circle">
                {done ? <i className="fas fa-check" /> : <i className={`fas ${cfg.icon}`} />}
              </div>
              <span className="step-label">{cfg.label}</span>
            </div>
            {idx < PIPELINE_STEPS.length - 1 && (
              <div className={`step-connector ${done ? 'done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────
const AdmissionsManagement = () => {
  const [activeTab, setActiveTab]           = useState('pending');
  const [applications, setApplications]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [admissionsOpen, setAdmissionsOpen] = useState(false);
  const [selectedApp, setSelectedApp]       = useState(null);
  const [toast, setToast]                   = useState({ msg: '', type: '' });

  // Manual application modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [manualForm, setManualForm]           = useState({
    studentName: '', dob: '', gender: '', parentName: '', parentEmail: '', classApplying: '', mobileNumber: '', message: ''
  });

  // Accept modal (enter exam details)
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptTargetId, setAcceptTargetId]   = useState(null);
  const [examForm, setExamForm]               = useState({ examDate: '', examVenue: '', examNotes: '' });
  const [isAccepting, setIsAccepting]         = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchSettings();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const fetchSettings = async () => {
    try {
      const settings = await settingsAPI.getAllAdmin();
      const openSetting = settings.find(s => s.settingKey === 'admissions_open');
      if (openSetting) setAdmissionsOpen(openSetting.settingValue === 'true');
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  const toggleAdmissionsStatus = async () => {
    try {
      const newValue = !admissionsOpen;
      await settingsAPI.update({ key: 'admissions_open', value: newValue ? 'true' : 'false', description: 'Controls if the public admissions form is open', group: 'general' });
      setAdmissionsOpen(newValue);
      showToast(`Admissions ${newValue ? 'opened' : 'closed'} successfully.`);
    } catch (err) {
      showToast('Failed to update admissions status.', 'error');
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await adminAdmissions.getAllApplications();
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Action Handlers ──────────────────────────────────────────────────

  const openAcceptModal = (id) => {
    setAcceptTargetId(id);
    setExamForm({ examDate: '', examVenue: '', examNotes: '' });
    setShowAcceptModal(true);
  };

  const handleAccept = async (e) => {
    e.preventDefault();
    if (!examForm.examDate || !examForm.examVenue) {
      showToast('Exam date and venue are required.', 'error');
      return;
    }
    setIsAccepting(true);
    try {
      await adminAdmissions.acceptApplication(acceptTargetId, examForm);
      setShowAcceptModal(false);
      setSelectedApp(null);
      await fetchApplications();
      setActiveTab('accepted');
      showToast('Application accepted! Entrance exam email sent to parent.');
    } catch (err) {
      showToast(err.message || 'Failed to accept application.', 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleMarkExamDone = async (id) => {
    if (!window.confirm('Mark this student\'s entrance exam as completed?')) return;
    try {
      await adminAdmissions.markExamDone(id);
      await fetchApplications();
      showToast('Exam marked as done. You can now evaluate and admit the student.');
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleAdmit = async (id) => {
    if (!window.confirm('Finalize admission? This will create a student account and send credentials to the parent.')) return;
    try {
      await adminAdmissions.admitApplication(id);
      await fetchApplications();
      setSelectedApp(null);
      setActiveTab('admitted');
      showToast('Student admitted! Account created and credentials sent via email.');
    } catch (err) {
      showToast(err.message || 'Failed to admit student.', 'error');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this application? A rejection email will be sent to the parent.')) return;
    try {
      await adminAdmissions.rejectApplication(id);
      await fetchApplications();
      setSelectedApp(null);
      setActiveTab('rejected');
      showToast('Application rejected. Notification email sent to parent.');
    } catch (err) {
      showToast(err.message || 'Failed to reject application.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this application record?')) return;
    try {
      await adminAdmissions.deleteApplication(id);
      await fetchApplications();
      setSelectedApp(null);
      showToast('Application deleted.');
    } catch (err) {
      showToast('Failed to delete application.', 'error');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await publicAdmission.submitApplication(manualForm);
      setShowManualModal(false);
      setManualForm({ studentName: '', dob: '', gender: '', parentName: '', parentEmail: '', classApplying: '', mobileNumber: '', message: '' });
      await fetchApplications();
      showToast('Manual application submitted successfully.');
    } catch (err) {
      showToast('Failed to submit application. Please check input.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Tab Filtering ────────────────────────────────────────────────────

  const TAB_STATUS_MAP = {
    pending:  ['PENDING'],
    accepted: ['ACCEPTED', 'EXAM_SCHEDULED'],
    admitted: ['ADMITTED'],
    rejected: ['REJECTED'],
  };

  const filteredApps = applications.filter(app => (TAB_STATUS_MAP[activeTab] || []).includes(app.status));

  const counts = {
    pending:  applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => ['ACCEPTED', 'EXAM_SCHEDULED'].includes(a.status)).length,
    admitted: applications.filter(a => a.status === 'ADMITTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="admissions-container">

      {/* Toast notification */}
      {toast.msg && (
        <div className={`adm-toast adm-toast--${toast.type}`}>
          <i className={`fas ${toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="admissions-header">
        <div>
          <h2><i className="fas fa-file-signature" /> Admissions Hub</h2>
          <p>Manage the full student admission pipeline — from application to enrolment.</p>
        </div>
        <div className="header-actions">
          <div className={`adm-toggle ${admissionsOpen ? 'open' : 'closed'}`} onClick={toggleAdmissionsStatus}>
            <i className={`fas ${admissionsOpen ? 'fa-door-open' : 'fa-door-closed'}`} />
            <span>Admissions {admissionsOpen ? 'Open' : 'Closed'}</span>
            <div className="toggle-switch">
              <div className={`toggle-thumb ${admissionsOpen ? 'on' : ''}`} />
            </div>
          </div>
          <button className="new-admission-btn" onClick={() => setShowManualModal(true)}>
            <i className="fas fa-plus" /> Manual Entry
          </button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="pipeline-stats">
        {[
          { key: 'pending',  icon: 'fa-inbox',          label: 'Pending Review',  count: counts.pending  },
          { key: 'accepted', icon: 'fa-envelope-open',  label: 'Exam Stage',      count: counts.accepted },
          { key: 'admitted', icon: 'fa-user-graduate',  label: 'Admitted',        count: counts.admitted },
          { key: 'rejected', icon: 'fa-times-circle',   label: 'Rejected',        count: counts.rejected },
        ].map(s => (
          <button key={s.key} className={`pipeline-stat-card stat--${s.key} ${activeTab === s.key ? 'active' : ''}`} onClick={() => setActiveTab(s.key)}>
            <div className="stat-icon-wrap"><i className={`fas ${s.icon}`} /></div>
            <div className="stat-body">
              <span className="stat-count">{s.count}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="admissions-board">
        <div className="board-header">
          <h3 className={`board-title board-title--${activeTab}`}>
            {activeTab === 'pending'  && <><i className="fas fa-inbox" /> New Applications</>}
            {activeTab === 'accepted' && <><i className="fas fa-calendar-check" /> Exam Stage</>}
            {activeTab === 'admitted' && <><i className="fas fa-user-graduate" /> Admitted Students</>}
            {activeTab === 'rejected' && <><i className="fas fa-times-circle" /> Rejected Applications</>}
          </h3>
          <span className="board-count">{filteredApps.length} application{filteredApps.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Applicant</th>
                <th>Class</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="empty-cell"><i className="fas fa-spinner fa-spin" /> Loading...</td></tr>
              ) : filteredApps.length === 0 ? (
                <tr><td colSpan="6" className="empty-cell">No applications in this stage.</td></tr>
              ) : (
                filteredApps.map(app => {
                  const cfg = STATUS_CONFIG[app.status] || {};
                  return (
                    <tr key={app.id}>
                      <td className="app-id-cell">{app.applicationId}</td>
                      <td className="applicant-cell">
                        <span className="applicant-name">{app.studentName}</span>
                        {app.generatedStudentId && <span className="student-id-badge">ID: {app.generatedStudentId}</span>}
                        <span className="parent-info">{app.parentEmail}</span>
                      </td>
                      <td><span className="class-badge">{app.classApplying}</span></td>
                      <td className="date-cell">{new Date(app.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <span className={`status-badge ${cfg.color}`}>
                          <i className={`fas ${cfg.icon}`} /> {cfg.label}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button className="action-btn btn-view" onClick={() => setSelectedApp(app)}>
                            <i className="fas fa-eye" /> Details
                          </button>
                          {app.status === 'PENDING' && (
                            <>
                              <button className="action-btn btn-accept" onClick={() => openAcceptModal(app.id)}>
                                <i className="fas fa-check" /> Accept
                              </button>
                              <button className="action-btn btn-reject" onClick={() => handleReject(app.id)}>
                                <i className="fas fa-times" /> Reject
                              </button>
                            </>
                          )}
                          {app.status === 'ACCEPTED' && (
                            <>
                              <button className="action-btn btn-exam" onClick={() => handleMarkExamDone(app.id)}>
                                <i className="fas fa-calendar-check" /> Mark Exam Done
                              </button>
                              <button className="action-btn btn-reject" onClick={() => handleReject(app.id)}>
                                <i className="fas fa-times" /> Reject
                              </button>
                            </>
                          )}
                          {app.status === 'EXAM_SCHEDULED' && (
                            <>
                              <button className="action-btn btn-admit" onClick={() => handleAdmit(app.id)}>
                                <i className="fas fa-user-graduate" /> Admit
                              </button>
                              <button className="action-btn btn-reject" onClick={() => handleReject(app.id)}>
                                <i className="fas fa-times" /> Reject
                              </button>
                            </>
                          )}
                          {(app.status === 'ADMITTED' || app.status === 'REJECTED') && (
                            <button className="action-btn btn-delete" onClick={() => handleDelete(app.id)}>
                              <i className="fas fa-trash" /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Accept Modal (Enter Exam Details) ─────────────────────── */}
      {showAcceptModal && (
        <div className="modal-overlay" onClick={() => !isAccepting && setShowAcceptModal(false)}>
          <div className="modal-card accept-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head accept-head">
              <div>
                <h3><i className="fas fa-envelope-open-text" /> Accept & Schedule Exam</h3>
                <p>Fill in the entrance examination details. An email will be sent to the parent immediately.</p>
              </div>
              <button className="modal-close" onClick={() => setShowAcceptModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAccept} className="modal-body">
              <div className="form-row">
                <div className="form-field">
                  <label>Exam Date & Time <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 Shrawan 2082 BS, 10:00 AM"
                    value={examForm.examDate}
                    onChange={e => setExamForm(p => ({ ...p, examDate: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label>Venue / Location <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gurukul Pathshala, Main Hall"
                    value={examForm.examVenue}
                    onChange={e => setExamForm(p => ({ ...p, examVenue: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-field">
                <label>Additional Notes <span className="opt">(optional)</span></label>
                <textarea
                  rows="3"
                  placeholder="e.g. Bring pencil and eraser. Arrive 15 minutes early."
                  value={examForm.examNotes}
                  onChange={e => setExamForm(p => ({ ...p, examNotes: e.target.value }))}
                />
              </div>
              <div className="email-preview-box">
                <i className="fas fa-paper-plane" /> An entrance exam notification email will be sent to the parent's registered email address.
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowAcceptModal(false)} disabled={isAccepting}>Cancel</button>
                <button type="submit" className="btn-send" disabled={isAccepting}>
                  {isAccepting ? <><i className="fas fa-spinner fa-spin" /> Sending...</> : <><i className="fas fa-paper-plane" /> Accept & Send Email</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Details Modal ─────────────────────────────────────────── */}
      {selectedApp && (() => {
        const cfg = STATUS_CONFIG[selectedApp.status] || {};
        return (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-card details-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-head details-head">
                <div>
                  <h3><i className="fas fa-file-alt" /> Application Details</h3>
                  <p>{selectedApp.applicationId}</p>
                </div>
                <button className="modal-close" onClick={() => setSelectedApp(null)}>&times;</button>
              </div>

              {/* Pipeline visual */}
              <div className="modal-pipeline">
                {selectedApp.status === 'REJECTED'
                  ? <div className="pipeline-rejected-banner"><i className="fas fa-times-circle" /> Application Rejected</div>
                  : <StepIndicator status={selectedApp.status} />
                }
              </div>

              <div className="modal-body">
                {/* Student Info */}
                <h4 className="section-title"><i className="fas fa-user-graduate" /> Student Information</h4>
                <div className="info-grid">
                  {[
                    { label: 'Full Name',         value: selectedApp.studentName },
                    { label: 'Date of Birth',     value: selectedApp.dob ? new Date(selectedApp.dob).toLocaleDateString() : '—' },
                    { label: 'Gender',            value: selectedApp.gender || '—' },
                    { label: 'Class Applying For', value: selectedApp.classApplying || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="info-card">
                      <span className="info-label">{label}</span>
                      <span className="info-value">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Parent Info */}
                <h4 className="section-title"><i className="fas fa-users" /> Parent / Contact</h4>
                <div className="info-grid">
                  {[
                    { label: 'Parent Name',  value: selectedApp.parentName  || '—' },
                    { label: 'Parent Email', value: selectedApp.parentEmail || '—' },
                    { label: 'Mobile',       value: selectedApp.mobileNumber || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="info-card">
                      <span className="info-label">{label}</span>
                      <span className="info-value">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Exam details if available */}
                {selectedApp.entranceExamDate && (
                  <>
                    <h4 className="section-title"><i className="fas fa-calendar-alt" /> Entrance Exam Details</h4>
                    <div className="info-grid">
                      {[
                        { label: 'Exam Date & Time', value: selectedApp.entranceExamDate },
                        { label: 'Venue',            value: selectedApp.entranceExamVenue || '—' },
                        { label: 'Notes',            value: selectedApp.examNotes || '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="info-card">
                          <span className="info-label">{label}</span>
                          <span className="info-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Student ID if admitted */}
                {selectedApp.generatedStudentId && (
                  <div className="admitted-badge-row">
                    <i className="fas fa-id-card" /> Student Account Created — ID: <strong>{selectedApp.generatedStudentId}</strong>
                  </div>
                )}

                {/* Message */}
                {selectedApp.message && (
                  <>
                    <h4 className="section-title"><i className="fas fa-comment-alt" /> Message / Notes</h4>
                    <div className="info-card" style={{ gridColumn: '1/-1' }}><span className="info-value">{selectedApp.message}</span></div>
                  </>
                )}

                {/* Actions */}
                <div className="modal-footer" style={{ marginTop: '20px' }}>
                  {selectedApp.status === 'PENDING' && (
                    <>
                      <button className="btn-send" onClick={() => { openAcceptModal(selectedApp.id); setSelectedApp(null); }}>
                        <i className="fas fa-check" /> Accept & Schedule Exam
                      </button>
                      <button className="btn-reject-modal" onClick={() => handleReject(selectedApp.id)}>
                        <i className="fas fa-times" /> Reject
                      </button>
                    </>
                  )}
                  {selectedApp.status === 'ACCEPTED' && (
                    <>
                      <button className="btn-exam-modal" onClick={() => { handleMarkExamDone(selectedApp.id); setSelectedApp(null); }}>
                        <i className="fas fa-calendar-check" /> Mark Exam Done
                      </button>
                      <button className="btn-reject-modal" onClick={() => handleReject(selectedApp.id)}>
                        <i className="fas fa-times" /> Reject
                      </button>
                    </>
                  )}
                  {selectedApp.status === 'EXAM_SCHEDULED' && (
                    <>
                      <button className="btn-admit-modal" onClick={() => handleAdmit(selectedApp.id)}>
                        <i className="fas fa-user-graduate" /> Finalize Admission
                      </button>
                      <button className="btn-reject-modal" onClick={() => handleReject(selectedApp.id)}>
                        <i className="fas fa-times" /> Reject
                      </button>
                    </>
                  )}
                  {(selectedApp.status === 'ADMITTED' || selectedApp.status === 'REJECTED') && (
                    <button className="btn-delete-modal" onClick={() => handleDelete(selectedApp.id)}>
                      <i className="fas fa-trash" /> Delete Record
                    </button>
                  )}
                  <button className="btn-cancel" onClick={() => setSelectedApp(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Manual Application Modal ───────────────────────────────── */}
      {showManualModal && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setShowManualModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3><i className="fas fa-plus-circle" /> Manual Application</h3>
                <p>Submit an offline application on behalf of a student.</p>
              </div>
              <button className="modal-close" onClick={() => setShowManualModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleManualSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-field">
                  <label>Student Name <span className="req">*</span></label>
                  <input type="text" name="studentName" required value={manualForm.studentName} onChange={e => setManualForm(p => ({ ...p, studentName: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Date of Birth <span className="req">*</span></label>
                  <input type="date" name="dob" required value={manualForm.dob} onChange={e => setManualForm(p => ({ ...p, dob: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Gender <span className="req">*</span></label>
                  <select name="gender" required value={manualForm.gender} onChange={e => setManualForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Class Applying For <span className="req">*</span></label>
                  <select name="classApplying" required value={manualForm.classApplying} onChange={e => setManualForm(p => ({ ...p, classApplying: e.target.value }))}>
                    <option value="">Select Class</option>
                    {['Nursery','LKG','UKG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Parent Name <span className="req">*</span></label>
                  <input type="text" required value={manualForm.parentName} onChange={e => setManualForm(p => ({ ...p, parentName: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Parent Email <span className="req">*</span></label>
                  <input type="email" required value={manualForm.parentEmail} onChange={e => setManualForm(p => ({ ...p, parentEmail: e.target.value }))} />
                </div>
              </div>
              <div className="form-field">
                <label>Mobile Number <span className="req">*</span></label>
                <input type="tel" required pattern="[0-9]{10}" value={manualForm.mobileNumber} onChange={e => setManualForm(p => ({ ...p, mobileNumber: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowManualModal(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-send" disabled={isSubmitting}>
                  {isSubmitting ? <><i className="fas fa-spinner fa-spin" /> Submitting...</> : <><i className="fas fa-paper-plane" /> Submit Application</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionsManagement;
