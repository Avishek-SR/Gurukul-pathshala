import React from 'react';
import '../StudentManagement.css';

const StudentActions = ({ student, onStatusChange, onEdit, onDelete, onView, onResetPassword, onFaceReg, canEdit, canDelete }) => {
    return (
        <div className="student-actions-cell">
            <button
                className="student-view-btn"
                style={{ background: '#e0f2f1', color: '#00695c' }}
                title="View Profile"
                onClick={() => onView(student)}
            >
                <i className="fas fa-eye"></i>
            </button>

            {canEdit && (
                <>
                    <button
                        className={`status-toggle-btn ${student.active ? 'student-deactivate-btn' : 'student-activate-btn'}`}
                        onClick={() => onStatusChange(student.id, student.active)}
                        title={student.active ? 'Deactivate' : 'Activate'}
                    >
                        <i className={`fas fa-${student.active ? 'user-slash' : 'user-check'}`}></i>
                    </button>
                    <button
                        className="student-edit-btn"
                        title="Edit"
                        onClick={() => onEdit(student)}
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                    <button
                        className="student-reset-pwd-btn"
                        title="Register Face"
                        onClick={() => onFaceReg(student)}
                        style={{
                            background: '#e8eaf6',
                            color: '#3f51b5',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '8px'
                        }}
                    >
                        <i className="fas fa-camera"></i>
                    </button>
                    <button
                        className="student-reset-pwd-btn"
                        title="Reset Password"
                        onClick={() => onResetPassword(student.id)}
                        style={{
                            background: '#fff3cd',
                            color: '#856404',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '8px'
                        }}
                    >
                        <i className="fas fa-key"></i>
                    </button>
                </>
            )}

            {canDelete && (
                <button
                    className="student-delete-btn"
                    onClick={() => onDelete(student.id)}
                    title="Delete"
                >
                    <i className="fas fa-trash"></i>
                </button>
            )}
        </div>
    );
};

export default StudentActions;
