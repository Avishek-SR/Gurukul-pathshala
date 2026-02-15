import React, { useState, useEffect } from 'react';

const EditFacultyForm = ({ faculty, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        dob: '',
        department: '',
        designation: '',
        mobileNumber: '',
        citizenship: '',

        gender: '',
        email: '',
        personalEmail: ''
    });

    useEffect(() => {
        if (faculty) {
            setFormData({
                id: faculty.id,
                name: faculty.name || '',
                dob: faculty.dob || '',
                department: faculty.department || '',
                designation: faculty.designation || 'Assistant Professor',
                mobileNumber: faculty.mobileNumber || '',
                citizenship: faculty.citizenship || '',
                gender: faculty.gender || '',
                email: faculty.email || '',
                personalEmail: faculty.personalEmail || ''
            });
        }
    }, [faculty]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="faculty-modal-overlay">
            <div className="faculty-modal">
                <div className="faculty-modal-header">
                    <h3>Edit Faculty</h3>
                    <button onClick={onClose}>×</button>
                </div>
                <div className="faculty-modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="faculty-form-grid">
                            <div className="faculty-form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Dr. John Smith"
                                    required
                                />
                            </div>
                            <div className="faculty-grid-2">
                                <div className="faculty-form-group">
                                    <label>Gender *</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="faculty-form-group">
                                    <label>Citizenship</label>
                                    <input
                                        type="text"
                                        value={formData.citizenship}
                                        onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
                                        placeholder="Nationality"
                                    />
                                </div>
                            </div>

                            <div className="faculty-grid-2">
                                <div className="faculty-form-group">
                                    <label>Work Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="faculty@school.com"
                                        disabled
                                    />
                                </div>
                                <div className="faculty-form-group">
                                    <label>Personal Email</label>
                                    <input
                                        type="email"
                                        value={formData.personalEmail}
                                        onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                                        placeholder="faculty@example.com"
                                    />
                                </div>
                            </div>
                            <div className="faculty-form-group">
                                <label>Mobile Number</label>
                                <input
                                    type="tel"
                                    value={formData.mobileNumber}
                                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                    placeholder="+91..."
                                />
                            </div>
                            <div className="faculty-form-group">
                                <label>Date of Birth *</label>
                                <input
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="faculty-form-group">
                                <label>Department</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="">Select Department</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Electrical Engineering">Electrical Engineering</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Business">Business</option>
                                </select>
                            </div>
                            <div className="faculty-form-group">
                                <label>Designation</label>
                                <select
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                >
                                    <option value="Assistant Professor">Assistant Professor</option>
                                    <option value="Associate Professor">Associate Professor</option>
                                    <option value="Professor">Professor</option>
                                    <option value="Lecturer">Lecturer</option>
                                </select>
                            </div>
                        </div>
                        <div className="faculty-modal-footer">
                            <button type="button" className="cancel-faculty-btn" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="save-faculty-btn">
                                Update Faculty
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
};

// Add styles
const styles = `
    .faculty-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }
`;

export default EditFacultyForm;
