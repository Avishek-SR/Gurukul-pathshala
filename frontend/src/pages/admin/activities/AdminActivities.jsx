import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../../../api/axiosConfig';
import ActivityTopicManager from '../../../components/activities/ActivityTopicManager';
import { BookOpen, ChevronLeft, Layers, Book } from 'lucide-react';
import './AdminActivities.css';

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const AdminActivities = () => {
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Fetch ALL courses for Admin (we could optimize this to fetch by class if backend supported, but filtering client-side is fine for now)
    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['admin-all-courses'],
        queryFn: async () => {
            const { data } = await axios.get('/admin/courses');
            return data;
        }
    });

    const getCoursesForClass = (className) => {
        return courses.filter(c => c.program === className);
    };

    // Step 1: Class Selection View
    if (!selectedClass) {
        return (
            <div className="admin-activities-container">
                <div className="activities-header-section">
                    <div className="header-icon-box">
                        <BookOpen size={24} />
                    </div>
                    <div className="header-text">
                        <h1>Classroom Activities</h1>
                        <p>Select a class to manage activities</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="admin-empty-state">Loading classes...</div>
                ) : (
                    <div className="class-grid">
                        {CLASSES.map((cls) => {
                            const count = getCoursesForClass(cls).length;
                            return (
                                <div key={cls} className="class-card" onClick={() => setSelectedClass(cls)}>
                                    <div className="class-icon">📚</div>
                                    <h3 className="class-name">{cls}</h3>
                                    <span className="class-stats">{count} Courses</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Step 2: Course Selection View
    if (!selectedCourse) {
        const classCourses = getCoursesForClass(selectedClass);

        return (
            <div className="admin-activities-container">
                <button className="back-nav-btn" onClick={() => setSelectedClass(null)}>
                    <ChevronLeft size={18} />
                    Back to Classes
                </button>

                <div className="activities-header-section">
                    <div className="header-icon-box">
                        <Book size={24} />
                    </div>
                    <div className="header-text">
                        <h1>{selectedClass} Courses</h1>
                        <p>Select a course to view its topics</p>
                    </div>
                </div>

                {classCourses.length === 0 ? (
                    <div className="admin-empty-state">
                        No courses found for {selectedClass}. Please create courses first.
                    </div>
                ) : (
                    <div className="course-list-grid">
                        {classCourses.map(course => (
                            <div key={course.id} className="course-item-card" onClick={() => setSelectedCourse(course)}>
                                <span className="course-code">{course.code}</span>
                                <h3 className="course-name">{course.title || course.name}</h3>
                                <div className="course-details">
                                    {course.section && (
                                        <span className="course-section-badge">Section {course.section}</span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Layers size={14} />
                                        Activity Manager
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Step 3: Activity Manager View
    return (
        <div className="admin-activities-container">
            <div className="activities-header-section">
                <button className="back-nav-btn helper-back-btn" onClick={() => setSelectedCourse(null)}>
                    <ChevronLeft size={18} />
                    Back to {selectedClass} Courses
                </button>
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-800">{selectedCourse.title || selectedCourse.name}</h1>
                    <p className="text-gray-500">Managing Activities for {selectedClass} {selectedCourse.section ? `- Section ${selectedCourse.section}` : ''}</p>
                </div>
            </div>

            <ActivityTopicManager courseId={selectedCourse.id} />
        </div>
    );
};

export default AdminActivities;
