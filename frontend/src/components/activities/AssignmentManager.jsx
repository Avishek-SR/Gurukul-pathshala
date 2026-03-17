import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { Plus, Trash2, FileText, CheckCircle, XCircle, ExternalLink, Users, Calendar, AlertCircle, ArrowLeft } from 'lucide-react';
import './ActivityTopicManager.css'; // Reusing some base styles

const AssignmentManager = ({ courseId }) => {
    const [view, setView] = useState('ASSIGNMENT_LIST'); // ASSIGNMENT_LIST, SUBMISSION_LIST
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueAt, setDueAt] = useState('');

    const queryClient = useQueryClient();

    // --- Queries ---
    const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
        queryKey: ['assignments', courseId],
        queryFn: async () => {
            const { data } = await axios.get(`/faculty/assignments/course/${courseId}`);
            return data;
        },
        enabled: !!courseId && view === 'ASSIGNMENT_LIST'
    });

    const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
        queryKey: ['submissions', selectedAssignment?.id],
        queryFn: async () => {
            const { data } = await axios.get(`/faculty/assignments/${selectedAssignment.id}/submissions`);
            return data;
        },
        enabled: !!selectedAssignment && view === 'SUBMISSION_LIST'
    });

    // --- Mutations ---
    const createMutation = useMutation({
        mutationFn: async (newAssignment) => {
            return await axios.post('/faculty/assignments', { ...newAssignment, course: { id: courseId } });
        },
        onSuccess: () => {
            toast.success('Assignment created successfully');
            queryClient.invalidateQueries(['assignments', courseId]);
            setIsCreating(false);
            setTitle('');
            setDescription('');
            setDueAt('');
        },
        onError: () => toast.error('Failed to create assignment')
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await axios.delete(`/faculty/assignments/${id}`);
        },
        onSuccess: () => {
            toast.success('Assignment deactivated');
            queryClient.invalidateQueries(['assignments', courseId]);
        }
    });

    const gradeMutation = useMutation({
        mutationFn: async ({ submissionId, grade, feedback }) => {
            return await axios.post(`/faculty/assignments/submissions/${submissionId}/grade`, { grade, feedback });
        },
        onSuccess: () => {
            toast.success('Graded successfully');
            queryClient.invalidateQueries(['submissions', selectedAssignment?.id]);
        },
        onError: () => toast.error('Failed to grade submission')
    });

    // --- Handlers ---
    const handleCreate = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        createMutation.mutate({ title, description, dueAt: dueAt ? dueAt + "T23:59:59" : null });
    };

    const handleGrade = (subId, grade, feedback) => {
        if (!grade) {
            toast.error("Please enter a grade");
            return;
        }
        gradeMutation.mutate({ submissionId: subId, grade: parseInt(grade), feedback });
    };

    // --- UI Helpers ---
    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return { bg: '#dcfce7', text: '#166534', label: 'Graded' };
            case 'SUBMITTED': return { bg: '#dbeafe', text: '#1e40af', label: 'Submitted' };
            default: return { bg: '#f1f5f9', text: '#475569', label: 'Pending' };
        }
    };

    return (
        <div className="activity-manager-container">
            {/* Header Area */}
            {view === 'ASSIGNMENT_LIST' ? (
                <div className="manager-header">
                    <div>
                        <h3 className="manager-title">Assignments</h3>
                        {/* Subtitle removed per user request */}
                    </div>
                    <button onClick={() => setIsCreating(true)} className="create-topic-btn">
                        <Plus size={18} /> New Assignment
                    </button>
                </div>
            ) : (
                <div className="manager-header">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setView('ASSIGNMENT_LIST'); setSelectedAssignment(null); }} className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div>
                            <h3 className="manager-title">{selectedAssignment?.title}</h3>
                            <p className="manager-subtitle">Student Submissions & Grading</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="content-area mt-4">

                {/* --- ASSIGNMENT LIST VIEW --- */}
                {view === 'ASSIGNMENT_LIST' && (
                    <>
                        {isCreating && (
                            <div className="create-form-container mb-6">
                                <h4 className="form-title">Create New Assignment</h4>
                                <form onSubmit={handleCreate}>
                                    <div className="form-fields-container">
                                        <div className="form-group">
                                            <label className="form-label">Assignment Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="form-input"
                                                placeholder="e.g., Final Research Paper"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="form-textarea"
                                                placeholder="Instructions for the students..."
                                                rows="3"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Due Date (Optional)</label>
                                            <input
                                                type="date"
                                                value={dueAt}
                                                onChange={(e) => setDueAt(e.target.value)}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" onClick={() => setIsCreating(false)} className="cancel-btn">Cancel</button>
                                            <button type="submit" className="submit-btn" disabled={createMutation.isLoading}>
                                                {createMutation.isLoading ? 'Creating...' : 'Create Assignment'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {isLoadingAssignments ? (
                            <div className="loading-state"><div className="spinner"></div></div>
                        ) : assignments.length === 0 ? (
                            <div className="empty-state">
                                <FileText size={40} />
                                <p className="empty-title">No assignments yet.</p>
                                {/* Hint removed per user request */}
                            </div>
                        ) : (
                            <div className="activity-cards-grid">
                                {assignments.filter(a => a.active).map((assignment, idx) => (
                                    <div
                                        key={assignment.id}
                                        className="activity-card"
                                        onClick={() => { setSelectedAssignment(assignment); setView('SUBMISSION_LIST'); }}
                                    >
                                        <div className={`activity-card-strip strip-${idx % 4}`} />
                                        <button
                                            className="activity-card-delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Deactivate this assignment?')) deleteMutation.mutate(assignment.id);
                                            }}
                                            title="Delete Assignment"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        <div className={`activity-card-icon icon-${idx % 4}`}>
                                            <FileText size={26} />
                                        </div>

                                        <h3 className="activity-card-title">{assignment.title}</h3>
                                        
                                        <div className="activity-card-footer">
                                            <span className="activity-card-btn">View Submissions →</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* --- SUBMISSIONS VIEW --- */}
                {view === 'SUBMISSION_LIST' && (
                    <div className="submissions-container">
                        {isLoadingSubmissions ? (
                            <div className="loading-state"><div className="spinner"></div></div>
                        ) : submissions.length === 0 ? (
                            <div className="empty-state">
                                <Users size={40} />
                                <p className="empty-title">No submissions yet.</p>
                                {/* Hint removed per user request */}
                            </div>
                        ) : (
                            <div className="topics-list-container">
                                {submissions.map(sub => {
                                    const style = getStatusStyle(sub.submissionStatus);
                                    return (
                                        <div key={sub.id} className="topic-list-item">
                                            <div className="topic-item-left">
                                                <div className={`topic-icon-wrapper ${sub.submissionUrl ? 'assigned' : 'available'}`}>
                                                    <Users size={22} />
                                                </div>
                                                <div className="topic-item-content">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="topic-item-title">{sub.student.name}</h4>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="meta-badge" style={{ background: style.bg, color: style.text }}>
                                                                    {style.label}
                                                                </span>
                                                                {sub.submittedAt && (
                                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                        <Calendar size={10} /> {new Date(sub.submittedAt).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {sub.submissionUrl && (
                                                            <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="material-link">
                                                                <ExternalLink size={14} /> View File
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Grading Logic */}
                                                    {sub.submissionStatus === 'SUBMITTED' ? (
                                                        <div className="grading-box mt-4 p-3 bg-teal-50 rounded-lg border border-teal-100 flex gap-3 items-end">
                                                            <div className="form-group flex-1">
                                                                <label className="text-[10px] font-bold text-teal-700 uppercase">Grade (0-100)</label>
                                                                <input 
                                                                    type="number" 
                                                                    className="form-input py-1" 
                                                                    placeholder="85"
                                                                    id={`grade-${sub.id}`}
                                                                />
                                                            </div>
                                                            <div className="form-group flex-[2]">
                                                                <label className="text-[10px] font-bold text-teal-700 uppercase">Feedback</label>
                                                                <input 
                                                                    type="text" 
                                                                    className="form-input py-1" 
                                                                    placeholder="Great work!"
                                                                    id={`feedback-${sub.id}`}
                                                                />
                                                            </div>
                                                            <button 
                                                                className="submit-btn py-1 px-4"
                                                                onClick={() => handleGrade(
                                                                    sub.id, 
                                                                    document.getElementById(`grade-${sub.id}`).value,
                                                                    document.getElementById(`feedback-${sub.id}`).value
                                                                )}
                                                            >
                                                                Submit
                                                            </button>
                                                        </div>
                                                    ) : sub.submissionStatus === 'APPROVED' ? (
                                                        <div className="graded-result mt-4 p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Grade</span>
                                                                <p className="text-lg font-bold text-teal-700">{sub.grade}/100</p>
                                                            </div>
                                                            <div className="flex-1 px-4 border-l border-gray-200 ml-4">
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Feedback</span>
                                                                <p className="text-xs text-gray-600 italic">{sub.feedback || "Good job!"}</p>
                                                            </div>
                                                            <CheckCircle size={20} className="text-green-500" />
                                                        </div>
                                                    ) : (
                                                        <div className="mt-4 text-xs text-gray-400 italic">
                                                            Pending student submission...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentManager;
