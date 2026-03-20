import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PublicFacultyManagement.css';

const PublicFacultyManagement = ({ currentUser }) => {
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const canManage = currentUser?.superAdmin || currentUser?.permissions?.includes('MANAGE_FACULTY');

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/admin/users/role/FACULTY', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFacultyMembers(data.filter(f => f.active)); // Only show active on public 
            }
        } catch (error) {
            console.error('Error fetching faculty:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleEditClick = (faculty) => {
        setEditingFaculty({ ...faculty });
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditingFaculty(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const token = sessionStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('/api/files/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (uploadResponse.ok) {
                const result = await uploadResponse.json();
                let url = result.fileUrl;

                if (url && url.startsWith('/api/uploads')) {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
                    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
                    url = `${baseUrl}${url}`;
                }

                setEditingFaculty(prev => ({ ...prev, profilePictureUrl: url }));
            } else {
                alert('Failed to upload image. Please try again.');
            }
        } catch (error) {
            console.error("Image upload error:", error);
            alert('Error connecting to upload service.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`/api/admin/users/${editingFaculty.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editingFaculty)
            });

            if (response.ok) {
                alert('Public Profile Updated Successfully!');
                setShowEditModal(false);
                fetchFaculty(); // Refresh the grid
            } else {
                alert('Failed to update profile details.');
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("An error occurred while saving.");
        }
    };

    return (
        <div className="public-faculty-admin-container">
            <div className="pf-header">
                <h2><i className="fas fa-id-card"></i> Manage Public Faculty Display</h2>
                <p>This grid visually represents exactly what parents and students see on the landing page.</p>
            </div>

            {loading ? (
                <div className="pf-loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i> Loading...
                </div>
            ) : (
                <div className="pf-faculty-grid">
                    {facultyMembers.map(member => (
                        <div key={member.id} className="pf-faculty-card">
                            <div className="pf-img-container">
                                <img
                                    src={member.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=e0e0e0&color=888888&size=300`}
                                    alt={member.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=e0e0e0&color=888888&size=300`;
                                    }}
                                />
                                {canManage && (
                                    <div className="pf-edit-overlay" onClick={() => handleEditClick(member)}>
                                        <button className="pf-edit-btn">
                                            <i className="fas fa-edit"></i> Edit Public Profile
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="pf-faculty-info">
                                <h3>{member.name}</h3>
                                <div className="pf-faculty-role">{member.designation || "Faculty"}</div>
                                <div className="pf-faculty-qual">{member.department || "General"}</div>
                            </div>
                        </div>
                    ))}
                    {facultyMembers.length === 0 && (
                        <div className="pf-empty-state">
                            <i className="fas fa-users-slash"></i>
                            <p>No active faculty found to display.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingFaculty && (
                <div className="pf-modal-overlay">
                    <div className="pf-modal">
                        <div className="pf-modal-header">
                            <h3>Edit Public Profile</h3>
                            <button onClick={handleCloseModal} className="pf-close-btn">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="pf-modal-body">

                            {/* Image Section */}
                            <div className="pf-form-group pf-image-upload-section">
                                <div className="pf-current-image-preview">
                                    <img
                                        src={editingFaculty.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(editingFaculty.name || 'Faculty')}&background=e0e0e0&color=888888&size=150`}
                                        alt="Preview"
                                    />
                                    {uploadingImage && <div className="pf-uploading-overlay"><i className="fas fa-spinner fa-spin"></i></div>}
                                </div>
                                <div className="pf-upload-controls">
                                    <label className="pf-upload-btn-label">
                                        <i className="fas fa-camera"></i> Change Photo
                                        <input
                                            type="file"
                                            accept="image/jpeg, image/png, image/webp"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    <small>Square images recommended (e.g. 500x500px)</small>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="pf-form-group">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    value={editingFaculty.name || ''}
                                    onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                                    required
                                />
                                <small>Full Name displayed on the card.</small>
                            </div>

                            <div className="pf-form-group">
                                <label>Designation / Role Title</label>
                                <input
                                    type="text"
                                    value={editingFaculty.designation || ''}
                                    onChange={(e) => setEditingFaculty({ ...editingFaculty, designation: e.target.value })}
                                    placeholder="e.g. Senior Science Teacher"
                                />
                            </div>

                            <div className="pf-form-group">
                                <label>Department / Qualifications</label>
                                <input
                                    type="text"
                                    value={editingFaculty.department || ''}
                                    onChange={(e) => setEditingFaculty({ ...editingFaculty, department: e.target.value })}
                                    placeholder="e.g. M.Sc. Physics"
                                />
                            </div>

                            <div className="pf-form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={editingFaculty.email || ''}
                                    onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
                                    placeholder="faculty@gurukul.edu"
                                />
                            </div>

                            <div className="pf-form-group">
                                <label>Contact Number</label>
                                <input
                                    type="text"
                                    value={editingFaculty.mobileNumber || ''}
                                    onChange={(e) => setEditingFaculty({ ...editingFaculty, mobileNumber: e.target.value })}
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            <div className="pf-form-group">
                                <label>Bio & Other Details</label>
                                <textarea
                                    value={editingFaculty.bio || ''}
                                    onChange={(e) => setEditingFaculty({ ...editingFaculty, bio: e.target.value })}
                                    placeholder="Write a short bio about the faculty member, their history, or achievements..."
                                    rows="4"
                                    className="pf-textarea"
                                />
                            </div>

                            <div className="pf-modal-footer">
                                <button type="button" className="pf-cancel-btn" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="pf-save-btn" disabled={uploadingImage}>
                                    {uploadingImage ? 'Uploading...' : 'Save Public Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicFacultyManagement;
