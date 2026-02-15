import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { BookOpen, Layers, Briefcase, CheckCircle, Lock } from 'lucide-react';

import './StudentActivitySelection.css';

const StudentActivitySelection = ({ courseId }) => {
    const [view, setView] = useState('ACTIVITY_LIST');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const queryClient = useQueryClient();

    const userString = sessionStorage.getItem('user'); // Changed to sessionStorage to match likely auth storage
    const currentUser = userString ? JSON.parse(userString) : null;

    // --- ACTIVITIES QUERY ---
    const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
        queryKey: ['activities', courseId],
        queryFn: async () => {
            const { data } = await axios.get(`/activities/course/${courseId}`);
            return data;
        },
        enabled: !!courseId && view === 'ACTIVITY_LIST'
    });

    // --- TOPICS QUERY ---
    const { data: topics = [], isLoading: isLoadingTopics } = useQuery({
        queryKey: ['topics', selectedActivity?.id],
        queryFn: async () => {
            const { data } = await axios.get(`/activities/${selectedActivity.id}/topics`);
            return data;
        },
        enabled: !!selectedActivity && view === 'TOPIC_LIST'
    });

    const mySelection = topics.find(t => t.assignedStudentId === currentUser?.id);

    const selectMutation = useMutation({
        mutationFn: async (topicId) => {
            return await axios.post(`/activities/topic/${topicId}/select`);
        },
        onSuccess: () => {
            toast.success('Topic selected successfully!');
            queryClient.invalidateQueries(['topics', selectedActivity?.id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to select topic');
        }
    });

    const [submissionUrl, setSubmissionUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

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
            setSubmissionUrl(data.fileUrl);
            toast.success('File uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload file');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const submitWorkMutation = useMutation({
        mutationFn: async ({ topicId, fileUrl }) => {
            return await axios.post(`/activities/topic/${topicId}/submit`, { fileUrl });
        },
        onSuccess: () => {
            toast.success('Work submitted successfully!');
            queryClient.invalidateQueries(['topics', selectedActivity?.id]);
            setSubmissionUrl('');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to submit work');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!submissionUrl) {
            toast.error('Please upload a file first');
            return;
        }
        if (!mySelection) return;

        submitWorkMutation.mutate({
            topicId: mySelection.id,
            fileUrl: submissionUrl
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
            case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
            case 'SUBMITTED': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // --- HANDLERS ---

    const openTopicSelection = (activity) => {
        setSelectedActivity(activity);
        setView('TOPIC_LIST');
    };

    const backToActivities = () => {
        setSelectedActivity(null);
        setView('ACTIVITY_LIST');
    };

    return (
        <div className="student-selection-container">
            {view === 'ACTIVITY_LIST' ? (
                <div className="manager-header">
                    <div>
                        <h3 className="manager-title">Classroom Activities</h3>
                        <p className="manager-subtitle">Select an activity to view topics</p>
                    </div>
                </div>
            ) : (
                <div className="manager-header">
                    <div className="flex items-center gap-3">
                        <button onClick={backToActivities} className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </button>
                        <div>
                            <h3 className="manager-title">{selectedActivity?.title}</h3>
                            <p className="manager-subtitle">Choose your topic</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="content-area mt-4">

                {/* --- ACTIVITY LIST --- */}
                {view === 'ACTIVITY_LIST' && (
                    <>
                        {isLoadingActivities ? (
                            <div className="loading-state"><div className="spinner"></div></div>
                        ) : activities.length === 0 ? (
                            <div className="empty-state">
                                <Layers size={32} />
                                <p className="empty-title">No activities available yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activities.map(activity => (
                                    <div
                                        key={activity.id}
                                        className="topic-card cursor-pointer hover:shadow-md transition-all border border-gray-100"
                                        onClick={() => openTopicSelection(activity)}
                                    >
                                        <div className="card-header pb-2 mb-2 border-b border-gray-50">
                                            <div className="flex items-center gap-2 text-indigo-600 font-medium">
                                                <Layers size={18} />
                                                <span>Activity</span>
                                            </div>
                                        </div>
                                        <h4 className="topic-title text-lg">{activity.title}</h4>
                                        <p className="topic-desc text-sm text-gray-500 line-clamp-2">{activity.description}</p>
                                        <div className="mt-4 pt-2 flex justify-between items-center">
                                            <span className="text-xs text-gray-400">
                                                Created by {activity.createdByName}
                                            </span>
                                            <span className="text-xs text-indigo-500 font-medium hover:underline">
                                                View Topics →
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* --- TOPIC LIST --- */}
                {view === 'TOPIC_LIST' && (
                    <>
                        {mySelection && (
                            <div className="locked-banner mb-6">
                                <div className="banner-icon">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="banner-title">Topic Locked: {mySelection.title}</h4>

                                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <h5 className="text-sm font-semibold text-gray-700">Project Submission</h5>
                                            {mySelection.studyMaterialUrl && (
                                                <a
                                                    href={mySelection.studyMaterialUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-full"
                                                >
                                                    <BookOpen size={12} /> Study Material
                                                </a>
                                            )}
                                        </div>

                                        {mySelection.submissionStatus !== 'APPROVED' ? (
                                            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                                                <div className="flex-1">
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
                                                    {isUploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                                                    {submissionUrl && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={10} /> Ready to submit</p>}
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                                    disabled={submitWorkMutation.isLoading || isUploading || !submissionUrl}
                                                >
                                                    {submitWorkMutation.isLoading ? 'Submitting...' : mySelection.submissionStatus === 'PENDING' ? 'Submit' : 'Update Submission'}
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <a href={mySelection.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm font-medium">
                                                            View Submitted Work
                                                        </a>
                                                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(mySelection.submissionStatus)}`}>
                                                            {mySelection.submissionStatus}
                                                        </span>
                                                    </div>
                                                    {mySelection.submissionStatus === 'APPROVED' && (
                                                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                            <CheckCircle size={12} /> Verified
                                                        </span>
                                                    )}
                                                </div>

                                                {(mySelection.grade !== null || mySelection.feedback) && (
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-100">
                                                        {mySelection.grade !== null && (
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs font-semibold text-gray-700">Grade:</span>
                                                                <span className="text-sm font-bold text-indigo-600">{mySelection.grade}/100</span>
                                                            </div>
                                                        )}
                                                        {mySelection.feedback && (
                                                            <div>
                                                                <span className="text-xs font-semibold text-gray-700 block mb-1">Feedback:</span>
                                                                <p className="text-xs text-gray-600 italic">{mySelection.feedback}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {mySelection.submissionStatus === 'REJECTED' && (
                                            <p className="mt-2 text-xs text-red-500">Your submission was rejected. Please review and resubmit.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isLoadingTopics ? (
                            <div className="loading-state"><div className="spinner"></div></div>
                        ) : topics.length === 0 ? (
                            <div className="empty-state">
                                <Layers size={32} />
                                <p className="empty-title">No topics available yet.</p>
                                <p className="empty-subtitle">Please check back later.</p>
                            </div>
                        ) : (
                            <div className="topics-grid">
                                {topics.map(topic => {
                                    const isAssigned = !!topic.assignedStudentId;
                                    const isMine = topic.assignedStudentId === currentUser?.id;
                                    const isDisabled = isAssigned || (!!mySelection && !isMine);

                                    return (
                                        <div key={topic.id} className={`selection-card ${isMine ? 'mine' : isDisabled ? 'disabled' : 'available'} group`}>
                                            <div className="card-top">
                                                <h4 className={`topic-title ${isMine ? 'mine' : 'other'}`}>
                                                    {topic.title}
                                                </h4>
                                                {isMine && (
                                                    <span className="mine-badge">
                                                        <CheckCircle size={18} />
                                                    </span>
                                                )}
                                            </div>

                                            {topic.description && (
                                                <p className="topic-desc">{topic.description}</p>
                                            )}

                                            <div className="card-bottom">
                                                {isAssigned && !isMine ? (
                                                    <div className="status-badge reserved">
                                                        <Lock size={12} />
                                                        Reserved by {topic.assignedStudentName}
                                                    </div>
                                                ) : isMine ? (
                                                    <span className="status-label mine">
                                                        Your Selection
                                                    </span>
                                                ) : (
                                                    <div className="status-badge">
                                                        <div className="dot-green" />
                                                        <span className="status-label available">
                                                            Available
                                                        </span>
                                                    </div>
                                                )}

                                                {!isMine && !isDisabled && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Confirm selection: ${topic.title}? You cannot change this later.`)) {
                                                                selectMutation.mutate(topic.id);
                                                            }
                                                        }}
                                                        className="select-btn"
                                                    >
                                                        Select Topic
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentActivitySelection;
