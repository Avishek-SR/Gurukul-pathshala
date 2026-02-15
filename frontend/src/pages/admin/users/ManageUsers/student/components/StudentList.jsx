import React from 'react';
import '../StudentManagement.css';
import StudentRow from './StudentRow';

const StudentList = ({ students, loading, onStatusChange, onEdit, onDelete, onView, onResetPassword, onFaceReg, canEdit, canDelete }) => {
    return (
        <div className="student-table-container">
            {loading ? (
                <div className="student-loading">
                    <i className="fas fa-spinner fa-spin"></i> Loading students...
                </div>
            ) : (
                <>
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>DOB</th>
                                <th>Gender</th>
                                <th>Email</th>
                                <th>Parent Mobile</th>
                                <th>Class</th>
                                <th>Section</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <StudentRow
                                    key={student.id}
                                    student={student}
                                    onStatusChange={onStatusChange}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onView={onView}
                                    onResetPassword={onResetPassword}
                                    onFaceReg={onFaceReg}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                />
                            ))}
                        </tbody>
                    </table>

                    {students.length === 0 && (
                        <div className="student-empty-state">
                            <i className="fas fa-graduation-cap"></i>
                            <p>No students found</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentList;
