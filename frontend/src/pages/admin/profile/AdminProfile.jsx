import React, { useEffect, useState, useRef } from 'react';
import './AdminProfile.css';
import ActivityTimeline from '../../../components/ActivityTimeline';
import api, { getImageUrl } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const AdminProfile = () => {
    const { updateUser } = useAuth();
    const [admin, setAdmin] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const fileInputRef = useRef(null);

    // Load admin data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get('/auth/profile').then(r => r.data);
                setAdmin(data);
                setFormData(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const data = await api.post('/files/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(r => r.data);

            const newProfileUrl = data.fileUrl;

            // Update local state immediately for instant preview
            setFormData(prev => ({ ...prev, profilePictureUrl: newProfileUrl }));
            setAdmin(prev => ({ ...prev, profilePictureUrl: newProfileUrl }));

            // If not in edit mode, persist immediately
            if (!isEditing) {
                await saveProfile({ ...admin, profilePictureUrl: newProfileUrl });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload profile picture.');
        }
    };

    const saveProfile = async (dataToSave) => {
        try {
            const data = await api.put(`/admin/users/${admin.id}`, dataToSave).then(r => r.data);
            setAdmin(data);
            setIsEditing(false);
            // Sync changes back into the global auth context so navbar avatar updates
            if (updateUser) updateUser(data);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveProfile(formData);
    };

    if (!admin) return <div className="p-4">Loading profile...</div>;

    const profileSrc = getImageUrl(admin.profilePictureUrl);

    return (
        <div className="admin-profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar-large" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer', overflow: 'hidden' }}>
                        {profileSrc ? (
                            <img src={profileSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <i className="fas fa-user-shield"></i>
                        )}
                        <div className="avatar-overlay">
                            <i className="fas fa-camera"></i>
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {!isEditing ? (
                        <>
                            <h2>{admin.name}</h2>
                            <p className="role-badge">{admin.role}</p>
                            <span className={`status-badge ${admin.active ? 'active' : 'inactive'}`}>
                                {admin.active ? 'Active' : 'Inactive'}
                            </span>
                        </>
                    ) : (
                        <div className="edit-header-inputs">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="edit-input-large"
                            />
                        </div>
                    )}
                </div>

                {!isEditing ? (
                    <div className="profile-details-grid">
                        <div className="detail-item">
                            <label>User ID</label>
                            <p>{admin.userId}</p>
                        </div>
                        <div className="detail-item">
                            <label>Email</label>
                            <p>{admin.email}</p>
                        </div>
                        <div className="detail-item">
                            <label>Mobile</label>
                            <p>{admin.mobileNumber || 'Not Set'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Gender</label>
                            <p>{admin.gender || 'Not Set'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Date of Birth</label>
                            <p>{admin.dob || 'Not Set'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Citizenship</label>
                            <p>{admin.citizenship || 'Not Set'}</p>
                        </div>
                    </div>
                ) : (
                    <form id="edit-form" className="profile-edit-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
                        </div>
                        <div className="form-group grid-2">
                            <div>
                                <label>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label>Citizenship</label>
                                <input type="text" name="citizenship" value={formData.citizenship} onChange={handleInputChange} />
                            </div>
                        </div>
                    </form>
                )}

                <div className="profile-actions">
                    {!isEditing ? (
                        <>
                            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                <i className="fas fa-edit"></i> Edit Profile
                            </button>
                            <button className="change-password-btn">
                                <i className="fas fa-key"></i> Change Password
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="cancel-btn" onClick={() => { setIsEditing(false); setFormData(admin); }}>
                                Cancel
                            </button>
                            <button className="save-btn" form="edit-form" type="submit">
                                Save Changes
                            </button>
                        </>
                    )}
                </div>

                {!isEditing && <ActivityTimeline userId={admin.id} />}
            </div>
        </div>
    );
};

export default AdminProfile;
