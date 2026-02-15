import React, { useState, useEffect } from 'react';
import './StudentCourses.css';

const MyClasses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8">Loading classes...</div>;

    return (
        <div className="student-page">


            {courses.length === 0 ? (
                <div className="empty-state-card">
                    <p>You are not enrolled in any classes yet.</p>
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map(course => (
                        <div key={course.id} className="course-card">
                            <div className="course-card-header">
                                <span className="course-code">{course.code}</span>
                                <span className="course-fee">₹{course.fee}</span>
                            </div>
                            <h3>{course.name}</h3>
                            <p className="course-desc">{course.description}</p>

                            <div className="course-footer">
                                <div className="faculty-info">
                                    <div className="faculty-avatar">
                                        {course.facultyName?.charAt(0) || 'T'}
                                    </div>
                                    <span>{course.facultyName || 'TBA'}</span>
                                </div>
                                <span className="duration-badge">{course.duration}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyClasses;
