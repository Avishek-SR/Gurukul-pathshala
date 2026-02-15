import React, { useState } from 'react';

const AddAdminForm = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        email: '',
        personalEmail: '',
        mobileNumber: '',
        citizenship: '',
        gender: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content">
                <div className="admin-modal-header">
                    <h3>Add New Admin</h3>
                    <button onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="admin-modal-form">
                    <div className="admin-form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Admin User"
                        />
                    </div>
                    <div className="admin-form-group admin-grid-2">
                        <div>
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                required
                                value={formData.dob}
                                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Gender</label>
                            <select
                                required
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="admin-form-group admin-grid-2">
                        <div>
                            <label>Work Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Auto-generated if empty"
                            />
                        </div>
                        <div>
                            <label>Personal Email</label>
                            <input
                                type="email"
                                value={formData.personalEmail}
                                onChange={e => setFormData({ ...formData, personalEmail: e.target.value })}
                                placeholder="personal@example.com"
                            />
                        </div>
                    </div>

                    <div className="admin-form-group admin-grid-2">
                        <div>
                            <label>Mobile Number</label>
                            <input
                                type="tel"
                                required
                                value={formData.mobileNumber}
                                onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                                placeholder="+91..."
                            />
                        </div>
                        <div>
                            <label>Citizenship</label>
                            <input
                                type="text"
                                required
                                value={formData.citizenship}
                                onChange={e => setFormData({ ...formData, citizenship: e.target.value })}
                                placeholder="Nationality"
                            />
                        </div>
                    </div>

                    <div className="form-info">
                        <p><i className="fas fa-info-circle"></i> User ID and Password will be auto-generated.</p>
                        <p>Default Password: <strong>FirstName@ddMM</strong></p>
                    </div>

                    <div className="admin-modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save-btn">Create Admin</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAdminForm;
