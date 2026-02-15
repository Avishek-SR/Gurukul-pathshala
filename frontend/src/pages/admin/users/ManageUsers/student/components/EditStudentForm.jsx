import React, { useState, useEffect } from 'react';
import '../StudentManagement.css';

const EditStudentForm = ({ student, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: '',
        program: '',
        section: 'A',
        parentEmail: '',
        parentPhoneNumber: ''
    });

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                dob: student.dob || '',
                gender: student.gender || '',
                program: student.program || '',
                section: student.section || 'A',
                parentEmail: student.parentEmail || '',
                parentPhoneNumber: student.parentPhoneNumber || ''
            });
        }
    }, [student]);

    if (!isOpen || !student) return null;

    const handleSubmit = () => {
        onSave({ ...student, ...formData });
    };

    return (
        <div className="student-modal-overlay">
            <div className="student-modal">
                <div className="student-modal-header">
                    <h3>Edit Student</h3>
                    <button onClick={onClose}>×</button>
                </div>
                <div className="student-modal-body">
                    <div className="student-form-grid">
                        <div className="student-form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Rahul Kumar"
                            />
                        </div>
                        <div className="student-form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            />
                        </div>
                        <div className="student-form-group">
                            <label>Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="student-form-group">
                            <label>Class</label>
                            <select
                                value={formData.program}
                                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                            >
                                <option value="">Select Class</option>
                                <option value="Nursery">Nursery</option>
                                <option value="LKG">LKG</option>
                                <option value="UKG">UKG</option>
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={`Class ${i + 1}`}>Class {i + 1}</option>
                                ))}
                            </select>
                        </div>
                        <div className="student-form-group">
                            <label>Section</label>
                            <select
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            >
                                <option value="">Select Section</option>
                                {["A", "B", "C", "D", "E"].map(s => (
                                    <option key={s} value={s}>Section {s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="student-form-group">
                            <label>Parent's Email</label>
                            <input
                                type="email"
                                value={formData.parentEmail}
                                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                                placeholder="parent@example.com"
                            />
                        </div>
                        <div className="student-form-group">
                            <label>Parent's Mobile</label>
                            <input
                                type="tel"
                                value={formData.parentPhoneNumber}
                                onChange={(e) => setFormData({ ...formData, parentPhoneNumber: e.target.value })}
                                placeholder="9876543210"
                            />
                        </div>
                    </div>
                </div>
                <div className="student-modal-footer">
                    <button className="cancel-student-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="save-student-btn" onClick={handleSubmit}>
                        Update Student
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStudentForm;
