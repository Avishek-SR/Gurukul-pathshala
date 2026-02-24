import React, { useState, useEffect } from 'react';
import { apiGet } from '../../../services/api';
import './PublicPages.css';

const FacultyPage = () => {
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFaculty, setSelectedFaculty] = useState(null);

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const data = await apiGet('/public/faculty');
                setFacultyMembers(data);
            } catch (error) {
                console.error("Error fetching faculty data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFaculty();
    }, []);

    return (
        <>
            <div className="page-header-section">
                <div className="container">
                    <h1>Our Faculty</h1>
                    <p>Meet the dedicated educators shaping the future of our students.</p>
                </div>
            </div>

            <div className="container content-section">
                {loading ? (
                    <div className="loading-spinner">Loading Faculty Data...</div>
                ) : (
                    <div className="faculty-grid">
                        {facultyMembers.map(member => (
                            <div
                                key={member.id}
                                className="faculty-card clickable"
                                onClick={() => setSelectedFaculty(member)}
                            >
                                <div className="faculty-img-container">
                                    <img
                                        src={member.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=e0e0e0&color=888888&size=300`}
                                        alt={member.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=e0e0e0&color=888888&size=300`;
                                        }}
                                    />
                                    <div className="faculty-card-overlay">
                                        <span>View Profile</span>
                                    </div>
                                </div>
                                <div className="faculty-info">
                                    <h3>{member.name}</h3>
                                    <div className="faculty-role">{member.designation || member.role}</div>
                                    <div className="faculty-qual">{member.department}</div>
                                </div>
                            </div>
                        ))}
                        {facultyMembers.length === 0 && (
                            <div style={{ textAlign: 'center', width: '100%', padding: '40px' }}>
                                <h3>No faculty members to display currently.</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Profile Detail Modal */}
            {selectedFaculty && (
                <div className="faculty-modal-overlay" onClick={() => setSelectedFaculty(null)}>
                    <div className="faculty-modal" onClick={e => e.stopPropagation()}>
                        <button className="faculty-modal-close" onClick={() => setSelectedFaculty(null)}>
                            &times;
                        </button>
                        <div className="faculty-modal-content">
                            <div className="faculty-modal-left">
                                <img
                                    src={selectedFaculty.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedFaculty.name)}&background=e0e0e0&color=888888&size=300`}
                                    alt={selectedFaculty.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedFaculty.name)}&background=e0e0e0&color=888888&size=300`;
                                    }}
                                />
                            </div>
                            <div className="faculty-modal-right">
                                <h2>{selectedFaculty.name}</h2>
                                <h4 className="modal-role">{selectedFaculty.designation || selectedFaculty.role}</h4>
                                <h5 className="modal-dept">{selectedFaculty.department}</h5>

                                <div className="modal-contact-info">
                                    {selectedFaculty.email && (
                                        <div className="contact-row">
                                            <i className="fas fa-envelope"></i>
                                            <span>{selectedFaculty.email}</span>
                                        </div>
                                    )}
                                    {selectedFaculty.mobileNumber && (
                                        <div className="contact-row">
                                            <i className="fas fa-phone"></i>
                                            <span>{selectedFaculty.mobileNumber}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedFaculty.bio && (
                                    <div className="modal-bio">
                                        <h3>About</h3>
                                        <p>{selectedFaculty.bio}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FacultyPage;
