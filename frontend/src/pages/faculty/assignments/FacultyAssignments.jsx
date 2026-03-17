import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../../../api/axiosConfig';
import ActivityTopicManager from '../../../components/activities/ActivityTopicManager';
import AssignmentManager from '../../../components/activities/AssignmentManager';
import { BookOpen, FileText, ChevronDown, GraduationCap, Info } from 'lucide-react';
import './FacultyAssignments.css';

const FacultyAssignments = () => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedCourseName, setSelectedCourseName] = useState('');
    const [viewMode, setViewMode] = useState('ASSIGNMENTS'); // ASSIGNMENTS or ACTIVITIES

    const { data: courses = [] } = useQuery({
        queryKey: ['faculty-courses'],
        queryFn: async () => {
            const { data } = await axios.get('/faculty/courses');
            return data;
        }
    });

    const handleCourseChange = (e) => {
        const id = e.target.value;
        setSelectedCourse(id);
        const found = courses.find(c => String(c.id) === String(id));
        setSelectedCourseName(found ? `${found.name} (${found.program} - ${found.year})` : '');
    };

    return (
        <div className="fa-page">
            {/* Page Header - Teal Theme */}
            <div className="fa-header-premium">
                <div className="fa-header-left">
                    <div className="fa-header-icon-box">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        {/* Title removed per user request */}
                    </div>
                </div>
                
                <div className="fa-header-meta">
                    <div className="fa-meta-item">
                        <div className="fa-meta-icon"><GraduationCap size={16} /></div>
                        <span>{courses.length} Active Courses</span>
                    </div>
                </div>
            </div>

            {/* Toolbar: Tabs + Selector */}
            <div className="fa-toolbar">
                <div className="fa-tabs-container">
                    <button 
                        className={`fa-tab-btn ${viewMode === 'ASSIGNMENTS' ? 'active' : ''}`}
                        onClick={() => setViewMode('ASSIGNMENTS')}
                    >
                        <FileText size={16} />
                        Assignments
                        <span className="fa-tab-hint">Global</span>
                    </button>
                    <button 
                        className={`fa-tab-btn ${viewMode === 'ACTIVITIES' ? 'active' : ''}`}
                        onClick={() => setViewMode('ACTIVITIES')}
                    >
                        <BookOpen size={16} />
                        Classroom Activities
                        <span className="fa-tab-hint">Topic-based</span>
                    </button>
                </div>

                <div className="fa-selector-container">
                    <div className="fa-selector-icon"><GraduationCap size={16} /></div>
                    <div className="fa-select-wrapper">
                        <select
                            value={selectedCourse}
                            onChange={handleCourseChange}
                            className="fa-course-select"
                        >
                            <option value="">— Select Course —</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name} ({course.program} - {course.year})
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="fa-select-arrow" />
                    </div>
                    {selectedCourseName && (
                        <div className="fa-selected-badge" title={selectedCourseName}>
                            {selectedCourseName.length > 25 ? selectedCourseName.substring(0, 22) + '...' : selectedCourseName}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {selectedCourse ? (
                <div className="fa-content-wrapper fade-in">
                    {viewMode === 'ASSIGNMENTS' ? (
                        <AssignmentManager courseId={selectedCourse} />
                    ) : (
                        <ActivityTopicManager courseId={selectedCourse} />
                    )}
                </div>
            ) : (
                <div className="fa-empty-state">
                    <div className="fa-empty-card">
                        <div className="fa-empty-icon-wrap">
                            <Info size={40} />
                        </div>
                        <h3>No Course Selected</h3>
                        <p>To manage {viewMode === 'ASSIGNMENTS' ? 'global assignments' : 'classroom activities'}, please select a course from the dropdown above.</p>
                        <div className="fa-empty-hint">
                            Your courses are automatically loaded from your enrollment.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyAssignments;
