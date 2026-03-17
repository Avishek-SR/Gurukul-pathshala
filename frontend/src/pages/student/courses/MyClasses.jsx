import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentCourses.css';

const MyClasses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch('/api/student/courses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error("Error fetching courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleSubjectClick = (courseId) => {
        navigate(`/student/assignments?courseId=${courseId}`);
    };

    if (loading) return (
        <div className="sc-loading">
            <div className="sc-spinner"></div>
            <p>Loading your subjects...</p>
        </div>
    );

    return (
        <div className="student-page subjects-page">
            <div className="page-header-simple">
                <h1>My Subjects</h1>
                <p>Click on a subject to view assignments and activities.</p>
            </div>

            {courses.length === 0 ? (
                <div className="empty-state-card">
                    <div className="empty-icon">📚</div>
                    <p>You are not enrolled in any subjects yet.</p>
                </div>
            ) : (
                <div className="subjects-grid">
                    {courses.map(course => (
                        <div 
                            key={course.id} 
                            className="subject-card-premium" 
                            onClick={() => handleSubjectClick(course.id)}
                        >
                            <div className="subj-card-top">
                                <span className="subj-code-pill">{course.code}</span>
                                <div className="subj-icon-circle">📖</div>
                            </div>
                            
                            <div className="subj-card-main">
                                <h3>{course.name}</h3>
                                <p className="subj-desc">{course.description || "No description available."}</p>
                            </div>

                            <div className="subj-card-footer">
                                <div className="instructor-info">
                                    <div className="instructor-avatar">
                                        {course.facultyName?.charAt(0) || 'T'}
                                    </div>
                                    <div className="instructor-details">
                                        <span className="inst-label">Instructor</span>
                                        <span className="inst-name">{course.facultyName || 'To Be Assigned'}</span>
                                    </div>
                                </div>
                                <div className="subj-arrow-btn">
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyClasses;
