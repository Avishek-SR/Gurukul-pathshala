import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { Plus, Trash2, UserX, User, Layers, Briefcase, ExternalLink, CheckCircle, XCircle, Edit } from 'lucide-react';

import './ActivityTopicManager.css';

const ActivityTopicManager = ({ courseId }) => {
    const [view, setView] = useState('ACTIVITY_LIST'); // ACTIVITY_LIST, TOPIC_LIST
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Activity Form State
    const [newActivityTitle, setNewActivityTitle] = useState('');
    const [newActivityDesc, setNewActivityDesc] = useState('');

    // Topic Form State
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicDesc, setNewTopicDesc] = useState('');
    const [studyMaterialUrl, setStudyMaterialUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Editing State
    const [editingTopicId, setEditingTopicId] = useState(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const { data } = await axios.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStudyMaterialUrl(data.fileUrl);
            toast.success('File uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload file');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const queryClient = useQueryClient();

    // --- ACTIVITIES QUERIES ---
    const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
        queryKey: ['activities', courseId],
        queryFn: async () => {
            const { data } = await axios.get(`/activities/course/${courseId}`);
            return data;
        },
        enabled: !!courseId && view === 'ACTIVITY_LIST'
    });

    const createActivityMutation = useMutation({
        mutationFn: async (newActivity) => {
            return await axios.post('/activities/create', { ...newActivity, courseId });
        },
        onSuccess: () => {
            toast.success('Activity created successfully');
            queryClient.invalidateQueries(['activities', courseId]);
            setIsCreating(false);
            setNewActivityTitle('');
            setNewActivityDesc('');
        },
        onError: () => toast.error('Failed to create activity')
    });

    const deleteActivityMutation = useMutation({
        mutationFn: async (id) => {
            return await axios.delete(`/activities/${id}`);
        },
        onSuccess: () => {
            toast.success('Activity deleted');
            queryClient.invalidateQueries(['activities', courseId]);
        }
    });

    // --- TOPICS QUERIES ---
    const { data: topics = [], isLoading: isLoadingTopics } = useQuery({
        queryKey: ['topics', selectedActivity?.id],
        queryFn: async () => {
            const { data } = await axios.get(`/activities/${selectedActivity.id}/topics`);
            return data;
        },
        enabled: !!selectedActivity && view === 'TOPIC_LIST'
    });

    const createTopicMutation = useMutation({
        mutationFn: async (newTopic) => {
            return await axios.post(`/activities/${selectedActivity.id}/topic/create`, newTopic);
        },
        onSuccess: () => {
            toast.success('Topic created successfully');
            queryClient.invalidateQueries(['topics', selectedActivity?.id]);
            setIsCreating(false);
            setNewTopicTitle('');
            setNewTopicDesc('');
            setStudyMaterialUrl('');
        },
        onError: () => toast.error('Failed to create topic')
    });

    const updateTopicMutation = useMutation({
        mutationFn: async ({ id, studyMaterialUrl }) => {
            return await axios.put(`/activities/topic/${id}`, { studyMaterialUrl });
        },
        onSuccess: () => {
            toast.success('Topic updated');
            queryClient.invalidateQueries(['topics', selectedActivity?.id]);
            setEditingTopicId(null);
            setStudyMaterialUrl('');
        },
        onError: () => toast.error('Failed to update topic')
    });

    const deleteTopicMutation = useMutation({
        mutationFn: async (id) => {
            return await axios.delete(`/activities/topic/${id}`);
        },
        onSuccess: () => {
            toast.success('Topic deleted');
            queryClient.invalidateQueries(['topics', selectedActivity?.id]);
        }
    });

    const unassignTopicMutation = useMutation({
        mutationFn: async (id) => {
            return await axios.post(`/activities/topic/${id}/unassign`);
        },
        onSuccess: () => {
            toast.success('Student unassigned');
            queryClient.invalidateQueries(['topics', selectedActivity?.id]);
        }
    });

    const [verificationState, setVerificationState] = useState({
        topicId: null,
        status: null,
        grade: '',
        feedback: ''
    });

    const verifyTopicMutation = useMutation({
        mutationFn: async ({ topicId, status, grade, feedback }) => {
            return await axios.post(`/activities/topic/${topicId}/verify`, { status, grade, feedback });
        },
        onSuccess: () => {
            toast.success('Topic status updated');
            queryClient.invalidateQueries(['topics', selectedActivity?.id]);
            setVerificationState({ topicId: null, status: null, grade: '', feedback: '' });
        },
        onError: () => toast.error('Failed to update status')
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return <span className="status-badge approved"><CheckCircle size={12} /> Approved</span>;
            case 'REJECTED': return <span className="status-badge rejected"><XCircle size={12} /> Rejected</span>;
            case 'SUBMITTED': return <span className="status-badge submitted">Submitted</span>;
            default: return <span className="status-badge pending">Pending</span>;
        }
    };

    // --- HANDLERS ---

    const handleCreateActivity = (e) => {
        e.preventDefault();
        if (!newActivityTitle.trim()) return;
        createActivityMutation.mutate({
            title: newActivityTitle,
            description: newActivityDesc
        });
    };

    const handleCreateTopic = (e) => {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;
        createTopicMutation.mutate({
            title: newTopicTitle,
            description: newTopicDesc,
            studyMaterialUrl
        });
    };

    const openTopicManager = (activity) => {
        setSelectedActivity(activity);
        setView('TOPIC_LIST');
    };

    const backToActivities = () => {
        setSelectedActivity(null);
        setView('ACTIVITY_LIST');
    };

    return (
        <div className="activity-manager-container">
            {/* Header Area */}
            {view === 'ACTIVITY_LIST' ? (
                <div className="manager-header">
                    <div>
                        <h3 className="manager-title">Classroom Activities</h3>
                        <p className="manager-subtitle">Manage assignments and projects</p>
                    </div>
                    <button onClick={() => setIsCreating(true)} className="create-topic-btn">
                        <Plus size={18} /> New Activity
                    </button>
                </div>
            ) : (
                <div className="manager-header">
                    <div className="flex items-center gap-3">
                        <button onClick={backToActivities} className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </button>
                        <div>
                            <h3 className="manager-title">{selectedActivity?.title}</h3>
                            <p className="manager-subtitle">Manage topics for this activity</p>
                        </div>
                    </div>
                    <button onClick={() => setIsCreating(true)} className="create-topic-btn">
                        <Plus size={18} /> Add Topic
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="content-area mt-4">

                {/* --- ACTIVITY LIST VIEW --- */}
                {view === 'ACTIVITY_LIST' && (
                    <>
                        {isCreating && (
                            <div className="create-form-container mb-6">
                                <h4 className="form-title">Create New Activity</h4>
                                <form onSubmit={handleCreateActivity}>
                                    <div className="form-fields-container">
                                        <div className="form-group">
                                            <label className="form-label">Activity Title</label>
                                            <input
                                                type="text"
                                                value={newActivityTitle}
                                                onChange={(e) => setNewActivityTitle(e.target.value)}
                                                className="form-input"
                                                placeholder="e.g., Semester 1 Project"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                value={newActivityDesc}
                                                onChange={(e) => setNewActivityDesc(e.target.value)}
                                                className="form-textarea"
                                                rows="2"
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" onClick={() => setIsCreating(false)} className="cancel-btn">Cancel</button>
                                            <button type="submit" className="submit-btn" disabled={createActivityMutation.isLoading}>
                                                {createActivityMutation.isLoading ? 'Creating...' : 'Create'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {isLoadingActivities ? (
                            <div className="loading-state"><div className="spinner"></div></div>
                        ) : activities.length === 0 ? (
                            <div className="empty-state">
                                <Layers size={32} />
                                <p className="empty-title">No activities created yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activities.map(activity => (
                                    <div
                                        key={activity.id}
                                        className="relative group cursor-pointer bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col items-center justify-center p-6 aspect-video overflow-hidden"
                                        onClick={() => openTopicManager(activity)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-50 group-hover:opacity-0 transition-opacity" />
                                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete activity?')) deleteActivityMutation.mutate(activity.id); }}
                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                                            title="Delete Activity"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <h3 className="relative z-10 text-xl font-bold text-gray-800 text-center group-hover:text-indigo-600 transition-colors px-2 line-clamp-2">
                                            {activity.title}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* --- TOPIC LIST VIEW --- */}
                {view === 'TOPIC_LIST' && (
                    <>
                        {isCreating && (
                            <div className="create-form-container mb-6">
                                <h4 className="form-title">Add New Topic</h4>
                                <form onSubmit={handleCreateTopic}>
                                    <div className="form-fields-container">
                                        <div className="form-group">
                                            <label className="form-label">Topic Title</label>
                                            <input
                                                type="text"
                                                value={newTopicTitle}
                                                onChange={(e) => setNewTopicTitle(e.target.value)}
                                                className="form-input"
                                                placeholder="e.g., Solar Energy Model"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                value={newTopicDesc}
                                                onChange={(e) => setNewTopicDesc(e.target.value)}
                                                className="form-textarea"
                                                rows="2"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Study Material (Optional)</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-indigo-50 file:text-indigo-700
                                                        hover:file:bg-indigo-100"
                                                />
                                                {isUploading && <span className="text-xs text-gray-500">Uploading...</span>}
                                                {studyMaterialUrl && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Uploaded</span>}
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" onClick={() => setIsCreating(false)} className="cancel-btn">Cancel</button>
                                            <button type="submit" className="submit-btn" disabled={createTopicMutation.isLoading}>
                                                {createTopicMutation.isLoading ? 'Adding...' : 'Add Topic'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {isLoadingTopics ? (
                            <div className="loading-state"><div className="spinner"></div></div>
                        ) : topics.length === 0 ? (
                            <div className="empty-state">
                                <Layers size={32} />
                                <p className="empty-title">No topics in this activity yet.</p>
                            </div>
                        ) : (
                            <div className="topics-list-container">
                                {topics.map(topic => (
                                    <div key={topic.id} className="topic-list-item">
                                        <div className="topic-item-left">
                                            <div className={`topic-icon-wrapper ${topic.assignedStudentId ? 'assigned' : 'available'}`}>
                                                {topic.assignedStudentId ? <User size={24} /> : <Layers size={24} />}
                                            </div>
                                            <div className="topic-item-content">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="topic-item-title">{topic.title}</h4>
                                                        <p className="topic-item-desc">{topic.description}</p>
                                                    </div>
                                                </div>

                                                <div className="topic-meta">
                                                    {topic.assignedStudentId ? (
                                                        <span className="meta-badge">Assigned to: {topic.assignedStudentName}</span>
                                                    ) : (
                                                        <span className="meta-badge text-indigo-600 bg-indigo-50">Available for Selection</span>
                                                    )}

                                                    {/* Study Material */}
                                                    <div className="flex items-center gap-2">
                                                        {topic.studyMaterialUrl ? (
                                                            <a href={topic.studyMaterialUrl} target="_blank" rel="noopener noreferrer" className="material-link">
                                                                <ExternalLink size={14} /> Study Material
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 italic text-xs">No material</span>
                                                        )}
                                                        <button
                                                            onClick={() => setEditingTopicId(topic.id)}
                                                            className="text-gray-400 hover:text-indigo-600 p-1"
                                                            title="Edit Material"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Editing Material Inline */}
                                                {editingTopicId === topic.id && (
                                                    <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100 flex items-center gap-2">
                                                        <input
                                                            type="file"
                                                            onChange={handleFileUpload}
                                                            className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                        />
                                                        {studyMaterialUrl && (
                                                            <button
                                                                onClick={() => updateTopicMutation.mutate({ id: topic.id, studyMaterialUrl })}
                                                                className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                                            >
                                                                Save
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setEditingTopicId(null)}
                                                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Grading / Submission Status */}
                                                {topic.assignedStudentId && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm text-gray-500 font-medium">Status:</span>
                                                            {getStatusBadge(topic.submissionStatus)}
                                                        </div>

                                                        <div className="flex items-center justify-end gap-2">
                                                            {topic.submissionStatus === 'SUBMITTED' && (
                                                                <>
                                                                    <a
                                                                        href={topic.submissionUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100 flex items-center gap-1"
                                                                    >
                                                                        <ExternalLink size={12} /> View Work
                                                                    </a>

                                                                    {verificationState.topicId === topic.id ? (
                                                                        <div className="flex items-center gap-2 absolute right-0 bottom-full mb-2 bg-white p-2 shadow-lg rounded-lg border border-gray-100 z-10 w-64">
                                                                            <input
                                                                                type="number"
                                                                                placeholder="Score"
                                                                                className="w-16 p-1 border rounded text-sm"
                                                                                value={verificationState.grade}
                                                                                onChange={(e) => setVerificationState({ ...verificationState, grade: e.target.value })}
                                                                            />
                                                                            <button
                                                                                onClick={() => verifyTopicMutation.mutate({
                                                                                    topicId: topic.id,
                                                                                    status: verificationState.status,
                                                                                    grade: verificationState.grade ? parseInt(verificationState.grade) : null,
                                                                                    feedback: 'Graded' // Simplification for inline
                                                                                })}
                                                                                className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                                            >
                                                                                <CheckCircle size={16} />
                                                                            </button>
                                                                            <button onClick={() => setVerificationState({ ...verificationState, topicId: null })} className="p-1 text-gray-400 hover:text-gray-600"><XCircle size={16} /></button>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => setVerificationState({ topicId: topic.id, status: 'APPROVED', grade: '', feedback: '' })}
                                                                                className="p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200"
                                                                                title="Approve & Grade"
                                                                            >
                                                                                <CheckCircle size={16} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => verifyTopicMutation.mutate({ topicId: topic.id, status: 'REJECTED', grade: null, feedback: 'Resubmit please' })}
                                                                                className="p-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                                                                title="Reject"
                                                                            >
                                                                                <XCircle size={16} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                            {(topic.submissionStatus === 'APPROVED' || topic.submissionStatus === 'REJECTED') && topic.submissionUrl && (
                                                                <a
                                                                    href={topic.submissionUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-indigo-600 hover:underline text-xs"
                                                                >
                                                                    View File
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="topic-item-right">
                                            <div className="topic-actions">
                                                {topic.assignedStudentId && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Unassign ${topic.assignedStudentName}?`)) {
                                                                unassignTopicMutation.mutate(topic.id);
                                                            }
                                                        }}
                                                        className="action-btn"
                                                        title="Unassign Student"
                                                    >
                                                        <UserX size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Delete topic?')) {
                                                            deleteTopicMutation.mutate(topic.id);
                                                        }
                                                    }}
                                                    className="action-btn delete"
                                                    title="Delete Topic"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default ActivityTopicManager;
