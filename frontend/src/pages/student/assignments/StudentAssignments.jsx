import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import axios from '../../../api/axiosConfig';
import toast from 'react-hot-toast';
import StudentActivitySelection from '../../../components/activities/StudentActivitySelection';
import { BookOpen, FileText, ChevronDown, GraduationCap, Upload, Clock, CheckCircle, Info, AlertCircle } from 'lucide-react';
import './StudentAssignments.css';

const StudentAssignments = () => {
    const [searchParams] = useSearchParams();
    const initialCourseId = searchParams.get('courseId');
    
    const [selectedCourse, setSelectedCourse] = useState(initialCourseId || '');
    const [selectedCourseName, setSelectedCourseName] = useState('');
    const [viewMode, setViewMode] = useState('ASSIGNMENTS');
    const [uploadingId, setUploadingId] = useState(null);

    const queryClient = useQueryClient();

    const { data: courses = [] } = useQuery({
        queryKey: ['student-courses'],
        queryFn: async () => {
            const { data } = await axios.get('/student/courses');
            return data;
        }
    });

    // Fetch Assignments for the selected course
    const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
        queryKey: ['assignments', selectedCourse],
        queryFn: async () => {
            const { data } = await axios.get(`/faculty/assignments/course/${selectedCourse}`);
            // For each assignment, also get student's submission status
            const enriched = await Promise.all(data.map(async (assignment) => {
                try {
                    const subRes = await axios.get(`/faculty/assignments/${assignment.id}/my-submission`);
                    return { ...assignment, submission: subRes.data };
                } catch (e) {
                    return assignment;
                }
            }));
            return enriched;
        },
        enabled: !!selectedCourse && viewMode === 'ASSIGNMENTS'
    });

    // Submission Mutation
    const submitMutation = useMutation({
        mutationFn: async ({ assignmentId, url }) => {
            return await axios.post(`/faculty/assignments/${assignmentId}/submit`, { submissionUrl: url });
        },
        onSuccess: () => {
            toast.success('Work submitted successfully!');
            queryClient.invalidateQueries(['assignments', selectedCourse]);
            setUploadingId(null);
        },
        onError: () => toast.error('Failed to submit work')
    });

    const handleFileUpload = async (e, assignmentId) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploadingId(assignmentId);
        try {
            const { data } = await axios.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            submitMutation.mutate({ assignmentId, url: data.fileUrl });
        } catch (error) {
            toast.error('File upload failed');
            setUploadingId(null);
        }
    };

    // Auto-select course name when courses are loaded or selectedCourse changes
    useEffect(() => {
        if (courses.length > 0 && selectedCourse) {
            const found = courses.find(c => String(c.id) === String(selectedCourse));
            if (found) {
                setSelectedCourseName(found.name);
            }
        }
    }, [courses, selectedCourse]);

    const handleCourseChange = (e) => {
        const id = e.target.value;
        setSelectedCourse(id);
        const found = courses.find(c => String(c.id) === String(id));
        setSelectedCourseName(found ? found.name : '');
    };

    return (
        <div className="sa-page">
            {/* Header */}
            <div className="sa-header">
                <div className="sa-header-left">
                    <div className="sa-header-icon"><BookOpen size={22} /></div>
                    <div>
                        <h1 className="sa-title">My Work</h1>
                        <p className="sa-subtitle">Manage your assignments and classroom activities</p>
                    </div>
                </div>
            </div>

            {/* Tabs + Course selector row */}
            <div className="sa-toolbar">
                {/* View Tabs */}
                <div className="sa-tabs">
                    <button
                        className={`sa-tab ${viewMode === 'ASSIGNMENTS' ? 'active' : ''}`}
                        onClick={() => setViewMode('ASSIGNMENTS')}
                    >
                        <FileText size={16} /> Assignments
                    </button>
                    <button
                        className={`sa-tab ${viewMode === 'ACTIVITIES' ? 'active' : ''}`}
                        onClick={() => setViewMode('ACTIVITIES')}
                    >
                        <BookOpen size={16} /> Classroom Activities
                    </button>
                </div>

                {/* Course Selector */}
                <div className="sa-course-selector">
                    <GraduationCap size={15} className="sa-cs-icon" />
                    <div className="sa-cs-wrap">
                        <select
                            value={selectedCourse}
                            onChange={handleCourseChange}
                            className="sa-cs-select"
                        >
                            <option value="">— Select Subject —</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="sa-cs-arrow" />
                    </div>
                    {selectedCourseName && (
                        <span className="sa-cs-badge">{selectedCourseName}</span>
                    )}
                </div>
            </div>

            {/* Content */}
            {selectedCourse ? (
                <>
                    {viewMode === 'ASSIGNMENTS' && (
                        <div className="sa-assignments-content">
                            {isLoadingAssignments ? (
                                <div className="sa-loading">
                                    <div className="sa-spinner"></div>
                                    <p>Loading your assignments...</p>
                                </div>
                            ) : assignments.length === 0 ? (
                                <div className="sa-empty">
                                    <div className="sa-empty-icon"><FileText size={48} /></div>
                                    <h3>No Assignments Yet</h3>
                                    <p>Great! You have no assignments for this subject at the moment.</p>
                                </div>
                            ) : (
                                <div className="sa-assignment-grid">
                                    {assignments.filter(a => a.active).map(assignment => (
                                        <div key={assignment.id} className="sa-assignment-card">
                                            <div className="sa-card-header">
                                                <div className="sa-card-icon"><FileText size={20} /></div>
                                                <div className="sa-card-title-wrap">
                                                    <h4>{assignment.title}</h4>
                                                    <span className="sa-due-date">
                                                        {assignment.dueAt ? `Due: ${new Date(assignment.dueAt).toLocaleDateString()}` : 'No deadline'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <p className="sa-card-desc">{assignment.description}</p>
                                            
                                            <div className="sa-card-footer">
                                                {assignment.submission?.submissionStatus === 'APPROVED' ? (
                                                    <div className="sa-status-box approved">
                                                        <div className="sa-status-header">
                                                            <CheckCircle size={16} />
                                                            <span>Graded</span>
                                                        </div>
                                                        <div className="sa-score-display">
                                                            <span className="sa-score">{assignment.submission.grade}</span>
                                                            <span className="sa-total">/100</span>
                                                        </div>
                                                    </div>
                                                ) : assignment.submission?.submissionStatus === 'SUBMITTED' ? (
                                                    <div className="sa-status-box submitted">
                                                        <div className="sa-status-header">
                                                            <Clock size={16} />
                                                            <span>Submitted</span>
                                                        </div>
                                                        <p className="sa-status-hint">Waiting for faculty review</p>
                                                    </div>
                                                ) : (
                                                    <div className="sa-submit-container">
                                                        <label className="sa-submit-btn">
                                                            <Upload size={16} />
                                                            {uploadingId === assignment.id ? 'Uploading...' : 'Upload Work'}
                                                            <input 
                                                                type="file" 
                                                                hidden 
                                                                disabled={uploadingId === assignment.id}
                                                                onChange={(e) => handleFileUpload(e, assignment.id)}
                                                            />
                                                        </label>
                                                    </div>
                                                )}

                                                {assignment.submission?.feedback && (
                                                    <div className="sa-feedback-box">
                                                        <Info size={14} className="sa-info-icon" />
                                                        <div className="sa-feedback-content">
                                                            <span className="sa-feedback-label">Faculty Feedback:</span>
                                                            <p>"{assignment.submission.feedback}"</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {viewMode === 'ACTIVITIES' && (
                        <StudentActivitySelection courseId={selectedCourse} />
                    )}
                </>
            ) : (
                <div className="sa-empty">
                    <div className="sa-empty-icon"><BookOpen size={48} /></div>
                    <h3>No Subject Selected</h3>
                    <p>Choose a subject from the menu above (or from **My Subjects**) to view your work and submit responses.</p>
                </div>
            )}
        </div>
    );
};

export default StudentAssignments;
