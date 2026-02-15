import React from 'react';
import '../FacultyManagement.css';

const FacultyStats = ({ faculty }) => {
    const activeCount = faculty.filter(f => f.active).length;
    // Count unique Departments
    const departmentCount = new Set(faculty.map(f => f.department).filter(Boolean)).size;

    return (
        <div className="faculty-stats">
            <div className="faculty-stat-card">
                <div className="faculty-stat-icon total">
                    <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <div className="faculty-stat-content">
                    <h3>{faculty.length}</h3>
                    <p>Total Faculty</p>
                </div>
            </div>
            <div className="faculty-stat-card">
                <div className="faculty-stat-icon active">
                    <i className="fas fa-check-circle"></i>
                </div>
                <div className="faculty-stat-content">
                    <h3>{activeCount}</h3>
                    <p>Active Faculty</p>
                </div>
            </div>
            <div className="faculty-stat-card">
                <div className="faculty-stat-icon department">
                    <i className="fas fa-building"></i>
                </div>
                <div className="faculty-stat-content">
                    <h3>{departmentCount}</h3>
                    <p>Departments</p>
                </div>
            </div>
        </div>
    );
};

export default FacultyStats;
