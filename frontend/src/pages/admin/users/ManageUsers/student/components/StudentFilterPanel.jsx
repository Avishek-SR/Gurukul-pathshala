import React from 'react';
import '../StudentManagement.css';

const StudentFilterPanel = ({ filters, setFilters }) => {
    const classes = [
        "Nursery", "LKG", "UKG",
        "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
        "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
    ];
    const sections = ["A", "B", "C", "D", "E"];

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="student-filter-panel" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <select
                value={filters.program || ''}
                onChange={(e) => handleChange('program', e.target.value)}
                className="filter-select"
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}
            >
                <option value="">All Classes</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
                value={filters.section || ''}
                onChange={(e) => handleChange('section', e.target.value)}
                className="filter-select"
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}
            >
                <option value="">All Sections</option>
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>

            <select
                value={filters.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                className="filter-select"
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}
            >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>
    );
};

export default StudentFilterPanel;
