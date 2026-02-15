import React from 'react';
import '../StudentManagement.css';

const StudentPagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="student-pagination" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                style={{ padding: '8px 16px', border: '1px solid #e0e0e0', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
            >
                Prev
            </button>

            <span style={{ display: 'flex', alignItems: 'center' }}>
                Page {currentPage} of {totalPages}
            </span>

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                style={{ padding: '8px 16px', border: '1px solid #e0e0e0', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
            >
                Next
            </button>
        </div>
    );
};

export default StudentPagination;
