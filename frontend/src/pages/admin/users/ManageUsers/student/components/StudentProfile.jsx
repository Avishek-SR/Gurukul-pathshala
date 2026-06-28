import React, { useRef, useState, useEffect } from 'react';
import '../StudentManagement.css';
import ActivityTimeline from '../../../../../../components/ActivityTimeline';
import api, { getImageUrl } from '../../../../../../services/api';

const StudentProfile = ({ student, isOpen, onClose }) => {
    const fileInputRef = useRef(null);
    // Local state to handle immediate UI update after upload without refetching parent
    const [currentStudent, setCurrentStudent] = useState(student);

    // Update local state when prop changes
    useEffect(() => {
        setCurrentStudent(student);
    }, [student]);

    if (!isOpen || !currentStudent) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const uploadResult = await api.post('/files/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(r => r.data);

            const newProfileUrl = uploadResult.fileUrl;

            // 1. Update backend user record
            await api.put(`/admin/users/${currentStudent.id}`, {
                ...currentStudent,
                profilePictureUrl: newProfileUrl
            });

            // 2. Update local UI immediately
            setCurrentStudent(prev => ({ ...prev, profilePictureUrl: newProfileUrl }));

            // 3. Notify student portal to re-fetch profile (if open in same browser)
            window.dispatchEvent(new CustomEvent('student:profileUpdated'));
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('File upload failed');
        }
    };

    const profileSrc = getImageUrl(currentStudent.profilePictureUrl);

    return (
        <div className="student-modal-overlay">
            <div className="student-modal" style={{ width: '600px' }}>
                <div className="student-modal-header">
                    <h3>Student Profile</h3>
                    <button onClick={onClose}>×</button>
                </div>
                <div className="student-modal-body">
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                        <div
                            style={{
                                width: '100px', height: '100px',
                                background: '#e8f4fc', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 15px auto', fontSize: '2rem', color: '#1a73e8',
                                cursor: 'pointer', position: 'relative', overflow: 'hidden'
                            }}
                            onClick={() => fileInputRef.current.click()}
                        >
                            {profileSrc ? (
                                <img src={profileSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <i className="fas fa-user-graduate"></i>
                            )}
                            <div className="avatar-hover-overlay" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: 'white', opacity: 0, transition: 'opacity 0.2s'
                            }}>
                                <i className="fas fa-camera" style={{ fontSize: '1.5rem' }}></i>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        <style>{`
                            .student-modal-body div[style*="cursor: pointer"]:hover .avatar-hover-overlay {
                                opacity: 1 !important;
                            }
                        `}</style>

                        <h2 style={{ margin: '0', color: '#1a73e8' }}>{currentStudent.name}</h2>
                        <p style={{ color: '#5f6368', margin: '5px 0' }}>{currentStudent.userId}</p>
                        <span className={`student-status-dot ${currentStudent.active ? 'active' : 'inactive'}`} style={{ display: 'inline-block', marginRight: '5px' }}></span>
                        <span>{currentStudent.active ? 'Active' : 'Inactive'}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Student Email</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>{currentStudent.email}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Date of Birth</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>{currentStudent.dob || 'Not Provided'}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Class</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>{currentStudent.program || 'Not Assigned'}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Section</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>Section {currentStudent.section || 'A'}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Mobile</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>{currentStudent.mobileNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Gender</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>{currentStudent.gender || 'N/A'}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Parent's Email</label>
                            <p style={{ fontWeight: '500', margin: '5px 0', wordBreak: 'break-all' }}>{currentStudent.parentEmail || 'N/A'}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Parent's Mobile</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>{currentStudent.parentPhoneNumber || 'N/A'}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '25px', maxHeight: '350px', overflowY: 'auto', paddingRight: '10px', borderRadius: '8px', border: '1px solid #f1f3f5' }}>
                        <ActivityTimeline userId={currentStudent.id} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
