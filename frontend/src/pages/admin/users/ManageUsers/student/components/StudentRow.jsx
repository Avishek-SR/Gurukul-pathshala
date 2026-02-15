import React from 'react';
import '../StudentManagement.css';
import StudentActions from './StudentActions';

const StudentRow = ({ student, onStatusChange, onEdit, onDelete, onView, onResetPassword, onFaceReg, canEdit, canDelete }) => {
    return (
        <tr>
            <td>
                <div className="student-id-cell">
                    <i className="fas fa-graduation-cap"></i>
                    <span>{student.userId || 'N/A'}</span>
                </div>
            </td>
            <td>{student.name}</td>
            <td>{student.dob || 'N/A'}</td>
            <td>{student.gender || 'N/A'}</td>
            <td>{student.email}</td>
            <td>{student.parentPhoneNumber || 'N/A'}</td>
            <td>
                <span className="student-program-badge">{student.program || 'Not assigned'}</span>
            </td>
            <td>
                <span className="student-year-badge">Section {student.section || 'A'}</span>
            </td>
            <td>
                <div className="student-status-cell">
                    <span className={`student-status-dot ${student.active ? 'active' : 'inactive'}`}></span>
                    <span>{student.active ? 'Active' : 'Inactive'}</span>
                </div>
            </td>
            <td>
                <StudentActions
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
            </td>
        </tr>
    );
};

export default StudentRow;
