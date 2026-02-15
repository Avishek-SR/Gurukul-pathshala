import React from 'react';
import '../StudentManagement.css';

const StudentSearchBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="student-search">
            <i className="fas fa-search"></i>
            <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );
};

export default StudentSearchBar;
