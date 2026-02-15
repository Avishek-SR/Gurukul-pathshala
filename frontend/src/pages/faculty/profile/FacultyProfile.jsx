import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import facultyService from '../../../services/faculty.service';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Book,
    Save,
    X,
    Edit2,
    Loader2,
    Building
} from 'lucide-react';
import './FacultyProfile.css';

const FacultyProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const queryClient = useQueryClient();

    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ['facultyProfile'],
        queryFn: facultyService.getProfile,
        onSuccess: (data) => {
            setFormData({
                mobileNumber: data.mobileNumber || '',
                address: data.address || '',
                bio: data.bio || '',
            });
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: facultyService.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries(['facultyProfile']);
            setIsEditing(false);
            // Optional: Show success toast
        },
        onError: (error) => {
            console.error('Failed to update profile:', error);
            // Optional: Show error toast
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                mobileNumber: profile.mobileNumber || '',
                address: profile.address || '',
                bio: profile.bio || '',
            });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="profile-loading">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="profile-error">
                <h2>Failed to load profile</h2>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="faculty-profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                {!isEditing && (
                    <button
                        className="edit-btn"
                        onClick={() => setIsEditing(true)}
                    >
                        <Edit2 size={18} /> Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-content">
                {/* Read-only Information Card */}
                <div className="profile-card info-card">
                    <div className="card-header">
                        <h2>Personal Information</h2>
                        <p className="subtitle">These details are managed by administrators</p>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <label>Full Name</label>
                            <div className="info-value">
                                <User size={18} />
                                <span>{profile.name}</span>
                            </div>
                        </div>

                        <div className="info-item">
                            <label>Email Address</label>
                            <div className="info-value">
                                <Mail size={18} />
                                <span>{profile.email}</span>
                            </div>
                        </div>

                        <div className="info-item">
                            <label>Department</label>
                            <div className="info-value">
                                <Building size={18} />
                                <span>{profile.department || 'Not Assigned'}</span>
                            </div>
                        </div>

                        <div className="info-item">
                            <label>Role</label>
                            <div className="info-value">
                                <Book size={18} />
                                <span>{profile.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editable Details Card */}
                <div className="profile-card editable-card">
                    <div className="card-header">
                        <h2>Contact & Bio</h2>
                        <p className="subtitle">Manage your contact details and biography</p>
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="mobileNumber">Phone Number</label>
                            <div className="input-wrapper">
                                <Phone size={18} />
                                <input
                                    type="text"
                                    id="mobileNumber"
                                    name="mobileNumber"
                                    value={isEditing ? formData.mobileNumber : (profile.mobileNumber || 'Not set')}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <div className="input-wrapper">
                                <MapPin size={18} />
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={isEditing ? formData.address : (profile.address || 'Not set')}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Enter your address"
                                />
                            </div>
                        </div>

                        <div className="form-group bio-group">
                            <label htmlFor="bio">Biography</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={isEditing ? formData.bio : (profile.bio || 'No biography added yet')}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Tell us about yourself..."
                                rows={5}
                            />
                        </div>

                        {isEditing && (
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCancel}
                                >
                                    <X size={18} /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={updateProfileMutation.isPending}
                                >
                                    {updateProfileMutation.isPending ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FacultyProfile;
