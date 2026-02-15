import React from 'react';
import '../StudentManagement.css';

const StudentStats = ({ students }) => {
    const activeCount = students.filter(s => s.active).length;
    // Count unique Classes (stored in 'program')
    const classCount = new Set(students.map(s => s.program).filter(Boolean)).size;

    return (
        <div className="student-stats">
            <div className="student-stat-card">
                <div className="student-stat-icon total">
                    <i className="fas fa-users"></i>
                </div>
                <div className="student-stat-content">
                    <h3>{students.length}</h3>
                    <p>Total Students</p>
                </div>
            </div>
            <div className="student-stat-card">
                <div className="student-stat-icon active">
                    <i className="fas fa-check-circle"></i>
                </div>
                <div className="student-stat-content">
                    <h3>{activeCount}</h3>
                    <p>Active Students</p>
                </div>
            </div>
            <div className="student-stat-card">
                <div className="student-stat-icon program">
                    <i className="fas fa-school"></i>
                </div>
                <div className="student-stat-content">
                    <h3>{classCount}</h3>
                    <p>Classes</p>
                </div>
            </div>
        </div>
    );
};

export default StudentStats;
