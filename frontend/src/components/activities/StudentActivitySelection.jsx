import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { BookOpen, Layers, CheckCircle, Lock, ExternalLink, Upload, ArrowLeft, Briefcase } from 'lucide-react';
import './StudentActivitySelection.css';

const StudentActivitySelection = ({ courseId }) => {
    const [view, setView] = useState('ACTIVITY_LIST');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const queryClient = useQueryClient();

    const userString = sessionStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;

    const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
        queryKey: ['activities', courseId],
        queryFn: async () => {
            const { data } = await axios.get(`/activities/course/${courseId}`);
            return data;
        },
        enabled: !!courseId && view === 'ACTIVITY_LIST'
    });

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
        } catch {
            toast.error('Failed to upload file');
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
        if (!submissionUrl) { toast.error('Please upload a file first'); return; }
        if (!mySelection) return;
        submitWorkMutation.mutate({ topicId: mySelection.id, fileUrl: submissionUrl });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'APPROVED': return 'approved';
            case 'REJECTED': return 'rejected';
            case 'SUBMITTED': return 'submitted';
            default: return 'pending';
        }
    };

    return (
        <div className="sas-container">

            {/* Section Header */}
            <div className="sas-section-header">
                {view === 'ACTIVITY_LIST' ? (
                    <>
                        <div className="sas-section-icon"><Briefcase size={18} /></div>
                        <div>
                            <h3 className="sas-section-title">Classroom Activities</h3>
                            <p className="sas-section-sub">Click on an activity to choose your topic</p>
                        </div>
                    </>
                ) : (
                    <>
                        <button className="sas-back-btn" onClick={() => { setSelectedActivity(null); setView('ACTIVITY_LIST'); }}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className="sas-section-icon"><Briefcase size={18} /></div>
                        <div>
                            <h3 className="sas-section-title">{selectedActivity?.title}</h3>
                            <p className="sas-section-sub">Select a topic below</p>
                        </div>
                    </>
                )}
            </div>

            {/* ACTIVITY LIST */}
            {view === 'ACTIVITY_LIST' && (
                <div className="sas-content">
                    {isLoadingActivities ? (
                        <div className="sas-loading"><div className="sas-spinner" /></div>
                    ) : activities.length === 0 ? (
                        <div className="sas-empty">
                            <Layers size={36} />
                            <h4>No Activities Yet</h4>
                            <p>Your faculty hasn't created any activities for this course yet.</p>
                        </div>
                    ) : (
                        <div className="sas-activity-grid">
                            {activities.map((activity, idx) => (
                                <div
                                    key={activity.id}
                                    className="sas-activity-card"
                                    onClick={() => { setSelectedActivity(activity); setView('TOPIC_LIST'); }}
                                >
                                    <div className="sas-ac-strip" />
                                    <div className="sas-ac-icon"><Briefcase size={24} /></div>
                                    <div className="sas-ac-body">
                                        <h4 className="sas-ac-title">{activity.title}</h4>
                                        {activity.description && (
                                            <p className="sas-ac-desc">{activity.description}</p>
                                        )}
                                        <div className="sas-ac-footer">
                                            <span className="sas-ac-by">By {activity.createdByName}</span>
                                            <span className="sas-ac-link">View Topics →</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TOPIC LIST */}
            {view === 'TOPIC_LIST' && (
                <div className="sas-content">
                    {/* My Selection / Submission Card */}
                    {mySelection && (
                        <div className="sas-my-selection-card">
                            <div className="sas-msc-header">
                                <div className="sas-msc-header-left">
                                    <div className="sas-msc-icon"><CheckCircle size={18} /></div>
                                    <div>
                                        <span className="sas-msc-label">Your Topic</span>
                                        <h4 className="sas-msc-title">{mySelection.title}</h4>
                                    </div>
                                </div>
                                <span className={`sas-status-badge ${getStatusClass(mySelection.submissionStatus)}`}>
                                    {mySelection.submissionStatus || 'PENDING'}
                                </span>
                            </div>

                            <div className="sas-msc-body">
                                {/* Study material link */}
                                {mySelection.studyMaterialUrl && (
                                    <a href={mySelection.studyMaterialUrl} target="_blank" rel="noopener noreferrer" className="sas-material-link">
                                        <BookOpen size={14} /> Study Material
                                        <ExternalLink size={12} />
                                    </a>
                                )}

                                {/* Grade + Feedback */}
                                {(mySelection.grade !== null || mySelection.feedback) && (
                                    <div className="sas-grade-box">
                                        {mySelection.grade !== null && (
                                            <div className="sas-grade-row">
                                                <span>Grade</span>
                                                <strong className="sas-grade-val">{mySelection.grade}/100</strong>
                                            </div>
                                        )}
                                        {mySelection.feedback && (
                                            <div className="sas-feedback">
                                                <span>Feedback</span>
                                                <p>{mySelection.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Submission form */}
                                {mySelection.submissionStatus !== 'APPROVED' && (
                                    <form onSubmit={handleSubmit} className="sas-submit-form">
                                        <div className="sas-upload-area">
                                            <Upload size={16} />
                                            <label className="sas-upload-label">
                                                {isUploading ? 'Uploading...' : submissionUrl ? '✓ File ready' : 'Choose file to upload'}
                                                <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                                            </label>
                                        </div>
                                        <button
                                            type="submit"
                                            className="sas-submit-btn"
                                            disabled={submitWorkMutation.isLoading || isUploading || !submissionUrl}
                                        >
                                            {submitWorkMutation.isLoading ? 'Submitting...' :
                                                mySelection.submissionStatus === 'PENDING' ? 'Submit Work' : 'Update Submission'}
                                        </button>
                                    </form>
                                )}

                                {mySelection.submissionStatus === 'APPROVED' && mySelection.submissionUrl && (
                                    <a href={mySelection.submissionUrl} target="_blank" rel="noopener noreferrer" className="sas-view-work-btn">
                                        <ExternalLink size={14} /> View Submitted Work
                                    </a>
                                )}

                                {mySelection.submissionStatus === 'REJECTED' && (
                                    <p className="sas-rejected-msg">⚠ Your submission was rejected. Please review and resubmit.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Topics Grid */}
                    {isLoadingTopics ? (
                        <div className="sas-loading"><div className="sas-spinner" /></div>
                    ) : topics.length === 0 ? (
                        <div className="sas-empty">
                            <Layers size={32} />
                            <h4>No Topics Yet</h4>
                            <p>Please check back later.</p>
                        </div>
                    ) : (
                        <div className="sas-topics-grid">
                            {topics.map(topic => {
                                const isAssigned = !!topic.assignedStudentId;
                                const isMine = topic.assignedStudentId === currentUser?.id;
                                const isDisabled = isAssigned || (!!mySelection && !isMine);

                                return (
                                    <div key={topic.id} className={`sas-topic-card ${isMine ? 'tc-mine' : isDisabled ? 'tc-taken' : 'tc-available'}`}>
                                        <div className="sas-tc-top">
                                            <h4 className="sas-tc-title">{topic.title}</h4>
                                            {isMine && <CheckCircle size={18} className="sas-tc-check" />}
                                            {isAssigned && !isMine && <Lock size={16} className="sas-tc-lock" />}
                                        </div>

                                        {topic.description && <p className="sas-tc-desc">{topic.description}</p>}

                                        <div className="sas-tc-bottom">
                                            {isAssigned && !isMine ? (
                                                <span className="sas-tc-badge taken">
                                                    <Lock size={11} /> Reserved
                                                </span>
                                            ) : isMine ? (
                                                <span className="sas-tc-badge mine">
                                                    <CheckCircle size={11} /> Your Selection
                                                </span>
                                            ) : (
                                                <span className="sas-tc-badge available">
                                                    <span className="sas-dot" /> Available
                                                </span>
                                            )}

                                            {!isMine && !isDisabled && (
                                                <button
                                                    className="sas-select-btn"
                                                    onClick={() => {
                                                        if (window.confirm(`Select "${topic.title}"? You cannot change this later.`)) {
                                                            selectMutation.mutate(topic.id);
                                                        }
                                                    }}
                                                    disabled={selectMutation.isLoading}
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
                </div>
            )}
        </div>
    );
};

export default StudentActivitySelection;
