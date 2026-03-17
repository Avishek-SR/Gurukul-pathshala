import React, { useState, useEffect } from 'react';
import './AdmissionsManagement.css';
import { adminAdmissions, settingsAPI, publicAdmission } from '../../../services/api';

const AdmissionsManagement = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admissionsOpen, setAdmissionsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '', dob: '', gender: '', parentName: '', parentEmail: '', classApplying: '', mobileNumber: '', message: ''
  });

  useEffect(() => {
    fetchApplications();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settings = await settingsAPI.getAllAdmin();
      const openSetting = settings.find(s => s.settingKey === 'admissions_open');
      if (openSetting) {
        setAdmissionsOpen(openSetting.settingValue === 'true');
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  const toggleAdmissionsStatus = async () => {
    try {
        const newValue = !admissionsOpen;
        await settingsAPI.update({
            key: 'admissions_open',
            value: newValue ? 'true' : 'false',
            description: 'Controls if the public admissions form is open',
            group: 'general'
        });
        setAdmissionsOpen(newValue);
    } catch(err) {
        console.error('Failed to update status', err);
        alert('Failed to update admissions status.');
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await adminAdmissions.getAllApplications();
      setApplications(data || []);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this application and generate a new Student ID?")) return;
    try {
      await adminAdmissions.approveApplication(id);
      await fetchApplications();
      setActiveTab('approved');
    } catch (error) {
      console.error('Failed to approve application', error);
      alert('Failed to approve application. It may have already been processed.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this application?")) return;
    try {
      await adminAdmissions.rejectApplication(id);
      await fetchApplications();
      setActiveTab('rejected');
    } catch (error) {
      console.error('Failed to reject application', error);
      alert('Failed to reject application.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this application?")) return;
    try {
      await adminAdmissions.deleteApplication(id);
      await fetchApplications();
    } catch (error) {
      console.error('Failed to delete application', error);
      alert('Failed to delete application.');
    }
  };

  const filterApplications = () => {
    if (activeTab === 'new' || activeTab === 'in-progress') {
       return applications.filter(app => app.status === 'PENDING');
    }
    return applications.filter(app => app.status.toLowerCase() === activeTab);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await publicAdmission.submitApplication(formData);
      setShowModal(false);
      setFormData({ studentName: '', dob: '', gender: '', parentName: '', parentEmail: '', classApplying: '', mobileNumber: '', message: '' });
      fetchApplications();
    } catch (err) {
      console.error('Failed to submit manual application', err);
      alert('Failed to submit application. Please check input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="admissions-container">
      <div className="admissions-header">
        <div>
          <h2><i className="fas fa-file-signature"></i> Admissions Hub</h2>
          <p>Review and process incoming student enrollment applications.</p>
        </div>
        <div className="header-actions" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
           <div className="status-toggle" style={{display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
             <span style={{fontWeight: '600', color: admissionsOpen ? '#15803d' : '#b91c1c'}}>
               <i className={`fas ${admissionsOpen ? 'fa-door-open' : 'fa-door-closed'}`}></i> Admissions {admissionsOpen ? 'Open' : 'Closed'}
             </span>
             <label className="switch" style={{position: 'relative', display: 'inline-block', width: '40px', height: '20px', margin: 0}}>
               <input type="checkbox" checked={admissionsOpen} onChange={toggleAdmissionsStatus} style={{opacity: 0, width: 0, height: 0}} />
               <span style={{
                 position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                 backgroundColor: admissionsOpen ? '#10b981' : '#ccc', transition: '.4s', borderRadius: '20px'
               }}>
                 <span style={{
                   position: 'absolute', content: '""', height: '16px', width: '16px', left: '2px', bottom: '2px',
                   backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                   transform: admissionsOpen ? 'translateX(20px)' : 'translateX(0)'
                 }} />
               </span>
             </label>
           </div>
           <button className="new-admission-btn" onClick={() => setShowModal(true)}>
             <i className="fas fa-plus"></i> Manual Application
           </button>
        </div>
      </div>

      <div className="admissions-stats">
        <div className="stat-card">
          <div className="stat-icon new"><i className="fas fa-inbox"></i></div>
          <div className="stat-info">
            <h3>{applications.filter(a => a.status === 'PENDING').length}</h3>
            <p>New Applications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon review"><i className="fas fa-tasks"></i></div>
          <div className="stat-info">
            <h3>0</h3>
            <p>In Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info">
            <h3>{applications.filter(a => a.status === 'APPROVED').length}</h3>
            <p>Approved this Term</p>
          </div>
        </div>
      </div>

      <div className="admissions-board">
        <div className="board-tabs">
          <button className={`board-tab ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>New</button>
          <button className={`board-tab ${activeTab === 'in-progress' ? 'active' : ''}`} onClick={() => setActiveTab('in-progress')}>In Progress</button>
          <button className={`board-tab ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>Approved</button>
          <button className={`board-tab ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>Rejected</button>
        </div>

        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Applicant Name</th>
                <th>Applied For</th>
                <th>Date Submitted</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Loading applications...</td></tr>
              ) : filterApplications().length === 0 ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No applications found for this status.</td></tr>
              ) : (
                filterApplications().map(app => (
                  <tr key={app.id}>
                    <td className="fw-500 text-primary">{app.applicationId}</td>
                    <td className="fw-600">
                      {app.studentName}
                      <br/>
                      <small style={{color: '#64748b', fontWeight: 'normal'}}>{app.generatedStudentId ? `ID: ${app.generatedStudentId}` : ''}</small>
                    </td>
                    <td>{app.classApplying}</td>
                    <td>{new Date(app.submissionDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="action-btn btn-view"
                        >
                          <i className="fas fa-eye"></i> View Details
                        </button>
                        {app.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(app.id)} className="action-btn btn-approve">Approve</button>
                            <button onClick={() => handleReject(app.id)} className="action-btn btn-reject">Reject</button>
                          </>
                        )}
                        {app.status !== 'PENDING' && (
                          <button onClick={() => handleDelete(app.id)} className="action-btn btn-delete">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', zIndex: 1000, justifyContent: 'center', alignItems: 'center'}}>
          <div className="modal-content" style={{background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
               <h3 style={{margin: 0, fontSize: '1.5rem', color: '#1e293b'}}>Manual Application Submission</h3>
               <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b'}}>&times;</button>
            </div>
            <form onSubmit={handleManualSubmit}>
               <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Student Name *</label>
                    <input type="text" name="studentName" required value={formData.studentName} onChange={handleInputChange} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Date of Birth *</label>
                    <input type="date" name="dob" required value={formData.dob} onChange={handleInputChange} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Gender *</label>
                    <select name="gender" required value={formData.gender} onChange={handleInputChange} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px'}}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Class Applying For *</label>
                    <select name="classApplying" required value={formData.classApplying} onChange={handleInputChange} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px'}}>
                      <option value="">Select Class</option>
                      <option value="Nursery">Nursery</option>
                      <option value="LKG">LKG</option>
                      <option value="UKG">UKG</option>
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                    </select>
                  </div>
               </div>
               <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Parent Name *</label>
                    <input type="text" name="parentName" required value={formData.parentName} onChange={handleInputChange} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Parent Email *</label>
                    <input type="email" name="parentEmail" required value={formData.parentEmail} onChange={handleInputChange} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px'}} />
                  </div>
               </div>
               <div style={{marginBottom: '15px'}}>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Mobile Number *</label>
                    <input type="tel" name="mobileNumber" pattern="[0-9]{10}" required value={formData.mobileNumber} onChange={handleInputChange} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px'}} />
               </div>
               <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                  <button type="button" onClick={() => setShowModal(false)} style={{padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'}}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} style={{padding: '10px 20px', background: '#20b2aa', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'}}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Details Modal ── */}
      {selectedApp && (
        <div
          onClick={() => setSelectedApp(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex',
            zIndex: 1100, justifyContent: 'center', alignItems: 'center'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '14px', width: '90%', maxWidth: '640px',
              maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #20b2aa, #178a83)',
              padding: '20px 24px', borderRadius: '14px 14px 0 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{color:'#fff', margin:0, fontSize:'1.25rem'}}>
                  <i className="fas fa-file-alt" style={{marginRight:'10px'}}></i>
                  Application Details
                </h3>
                <p style={{color:'rgba(255,255,255,0.8)', margin:'4px 0 0', fontSize:'0.85rem'}}>
                  {selectedApp.applicationId}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                  width: '34px', height: '34px', cursor: 'pointer', color: '#fff',
                  fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >&times;</button>
            </div>

            {/* Status Banner */}
            <div style={{
              padding: '10px 24px',
              background: selectedApp.status === 'APPROVED' ? '#dcfce7'
                : selectedApp.status === 'REJECTED' ? '#fee2e2'
                : '#fef9c3',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{
                fontWeight: '700', fontSize: '0.9rem',
                color: selectedApp.status === 'APPROVED' ? '#15803d'
                  : selectedApp.status === 'REJECTED' ? '#b91c1c'
                  : '#92400e'
              }}>
                <i className={`fas fa-${
                  selectedApp.status === 'APPROVED' ? 'check-circle'
                  : selectedApp.status === 'REJECTED' ? 'times-circle'
                  : 'clock'
                }`} style={{marginRight:'6px'}}></i>
                Status: {selectedApp.status}
              </span>
              {selectedApp.generatedStudentId && (
                <span style={{marginLeft:'auto', background:'#20b2aa', color:'#fff', padding:'3px 10px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:'600'}}>
                  Student ID: {selectedApp.generatedStudentId}
                </span>
              )}
            </div>

            {/* Details Body */}
            <div style={{padding: '20px 24px'}}>

              {/* Section: Student Info */}
              <h4 style={{color:'#20b2aa', marginBottom:'12px', fontSize:'0.95rem', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                <i className="fas fa-user-graduate" style={{marginRight:'8px'}}></i>Student Information
              </h4>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
                {[
                  {label: 'Full Name', value: selectedApp.studentName},
                  {label: 'Date of Birth', value: selectedApp.dob ? new Date(selectedApp.dob).toLocaleDateString() : '—'},
                  {label: 'Gender', value: selectedApp.gender || '—'},
                  {label: 'Class Applying For', value: selectedApp.classApplying || '—'},
                ].map(({label, value}) => (
                  <div key={label} style={{background:'#f8fafc', borderRadius:'8px', padding:'10px 14px'}}>
                    <div style={{fontSize:'0.75rem', color:'#64748b', fontWeight:'600', marginBottom:'3px'}}>{label}</div>
                    <div style={{fontSize:'0.95rem', fontWeight:'600', color:'#1e293b'}}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Section: Parent / Contact Info */}
              <h4 style={{color:'#20b2aa', marginBottom:'12px', fontSize:'0.95rem', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                <i className="fas fa-users" style={{marginRight:'8px'}}></i>Parent / Contact Information
              </h4>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
                {[
                  {label: 'Parent / Guardian Name', value: selectedApp.parentName || '—'},
                  {label: 'Parent Email', value: selectedApp.parentEmail || '—'},
                  {label: 'Mobile Number', value: selectedApp.mobileNumber || '—'},
                ].map(({label, value}) => (
                  <div key={label} style={{background:'#f8fafc', borderRadius:'8px', padding:'10px 14px'}}>
                    <div style={{fontSize:'0.75rem', color:'#64748b', fontWeight:'600', marginBottom:'3px'}}>{label}</div>
                    <div style={{fontSize:'0.95rem', fontWeight:'600', color:'#1e293b'}}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Section: Application Info */}
              <h4 style={{color:'#20b2aa', marginBottom:'12px', fontSize:'0.95rem', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                <i className="fas fa-info-circle" style={{marginRight:'8px'}}></i>Application Information
              </h4>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
                {[
                  {label: 'Application ID', value: selectedApp.applicationId || '—'},
                  {label: 'Date Submitted', value: selectedApp.submissionDate ? new Date(selectedApp.submissionDate).toLocaleDateString('en-IN', {day:'2-digit', month:'long', year:'numeric'}) : '—'},
                  {label: 'Reviewed / Processed Date', value: selectedApp.reviewDate ? new Date(selectedApp.reviewDate).toLocaleDateString() : '—'},
                ].map(({label, value}) => (
                  <div key={label} style={{background:'#f8fafc', borderRadius:'8px', padding:'10px 14px'}}>
                    <div style={{fontSize:'0.75rem', color:'#64748b', fontWeight:'600', marginBottom:'3px'}}>{label}</div>
                    <div style={{fontSize:'0.95rem', fontWeight:'600', color:'#1e293b'}}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Message / Notes */}
              {selectedApp.message && (
                <>
                  <h4 style={{color:'#20b2aa', marginBottom:'8px', fontSize:'0.95rem', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                    <i className="fas fa-comment-alt" style={{marginRight:'8px'}}></i>Message / Notes
                  </h4>
                  <div style={{background:'#f8fafc', borderRadius:'8px', padding:'12px 14px', marginBottom:'20px', color:'#334155', lineHeight:'1.6'}}>
                    {selectedApp.message}
                  </div>
                </>
              )}

              {/* Footer Actions */}
              <div style={{display:'flex', gap:'10px', justifyContent:'flex-end', borderTop:'1px solid #e2e8f0', paddingTop:'16px'}}>
                {selectedApp.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => { handleApprove(selectedApp.id); setSelectedApp(null); }}
                      style={{padding:'9px 20px', background:'#dcfce7', color:'#15803d', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}
                    ><i className="fas fa-check" style={{marginRight:'6px'}}></i>Approve</button>
                    <button
                      onClick={() => { handleReject(selectedApp.id); setSelectedApp(null); }}
                      style={{padding:'9px 20px', background:'#fee2e2', color:'#b91c1c', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}
                    ><i className="fas fa-times" style={{marginRight:'6px'}}></i>Reject</button>
                  </>
                )}
                <button
                  onClick={() => setSelectedApp(null)}
                  style={{padding:'9px 20px', background:'#f1f5f9', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500', color:'#475569'}}
                >Close</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionsManagement;
