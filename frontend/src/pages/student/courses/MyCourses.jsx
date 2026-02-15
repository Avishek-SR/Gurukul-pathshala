import React, { useEffect, useState } from 'react';
import { apiGet } from '../../../services/api';
import './MyCourses.css';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await apiGet('/student/courses');
                setCourses(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return <div className="loading-container">Loading courses...</div>;
    }

    return (
        <div className="my-courses-container">
            <div className="page-header">

                <p>Your academic curriculum and subjects.</p>
            </div>

            {courses.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-book-open"></i>
                    <p>No courses assigned yet.</p>
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map(course => (
                        <div key={course.id} className="course-card-student">
                            <div className="course-icon">
                                <i className="fas fa-book"></i>
                            </div>
                            <div className="course-details">
                                <h3>{course.name}</h3>
                                <span className="course-code">{course.code}</span>
                                <p className="course-desc">{course.description || 'No description available.'}</p>
                                <div className="course-meta">
                                    <div className="meta-item">
                                        <i className="fas fa-chalkboard-teacher"></i>
                                        <span>{course.facultyName || 'TBA'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;
