import React, { useRef, useState, useEffect } from 'react';
import '../../student/StudentManagement.css'; // Reusing student styles for consistency
import ActivityTimeline from '../../../../../../components/ActivityTimeline';
import api, { getImageUrl } from '../../../../../../services/api';

const FacultyProfile = ({ faculty, isOpen, onClose }) => {
    const fileInputRef = useRef(null);
    const [currentFaculty, setCurrentFaculty] = useState(faculty);

    useEffect(() => {
        setCurrentFaculty(faculty);
    }, [faculty]);

    if (!isOpen || !currentFaculty) return null;

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

            await api.put(`/admin/users/${currentFaculty.id}`, {
                ...currentFaculty,
                profilePictureUrl: newProfileUrl
            });

            setCurrentFaculty(prev => ({ ...prev, profilePictureUrl: newProfileUrl }));
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error handling file upload.');
        }
    };

    const profileSrc = getImageUrl(currentFaculty.profilePictureUrl);

    return (
        <div className="student-modal-overlay">
            <div className="student-modal" style={{ width: '600px' }}>
                <div className="student-modal-header">
                    <h3>Faculty Profile</h3>
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
                                <i className="fas fa-chalkboard-teacher"></i>
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

                        <h2 style={{ margin: '0', color: '#1a73e8' }}>{currentFaculty.name}</h2>
                        <p style={{ color: '#5f6368', margin: '5px 0' }}>{currentFaculty.userId}</p>
                        <span className={`student-status-dot ${currentFaculty.active ? 'active' : 'inactive'}`} style={{ display: 'inline-block', marginRight: '5px' }}></span>
                        <span>{currentFaculty.active ? 'Active' : 'Inactive'}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Email</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>{currentFaculty.email}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Date of Birth</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>{currentFaculty.dob || 'Not Provided'}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Department</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>{currentFaculty.department || 'Not Assigned'}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#5f6368', display: 'block' }}>Designation</label>
                            <p style={{ fontWeight: '500', margin: '5px 0' }}>{currentFaculty.designation || 'Faculty'}</p>
                        </div>
                    </div>

                    <ActivityTimeline userId={currentFaculty.id} />
                </div>
            </div>
        </div>
    );
};

export default FacultyProfile;
