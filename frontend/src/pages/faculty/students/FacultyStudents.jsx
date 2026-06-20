import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../api/axiosConfig';
import toast from 'react-hot-toast';
import {
    Users, GraduationCap, ChevronDown, ArrowLeft,
    Briefcase, CheckCircle, XCircle, Clock,
    ExternalLink, BookOpen, Award, Layers, ChevronRight
} from 'lucide-react';
import './FacultyStudents.css';
import { getImageUrl } from '../../../services/api';

/* ─── Status helpers ─── */
const STATUS_META = {
    APPROVED: { label: 'Approved',  cls: 'fss-badge approved'  },
    REJECTED: { label: 'Rejected',  cls: 'fss-badge rejected'  },
    SUBMITTED:{ label: 'Submitted', cls: 'fss-badge submitted' },
    PENDING:  { label: 'Not Submitted', cls: 'fss-badge pending'},
};
const getStatus = (s) => STATUS_META[s] || STATUS_META.PENDING;

/* ─── Main Component ─── */
const FacultyStudents = () => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedCourseName, setSelectedCourseName] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null); // drill into a student
    const [verifyState, setVerifyState] = useState(null);

    const queryClient = useQueryClient();

    /* Courses */
    const { data: courses = [] } = useQuery({
        queryKey: ['faculty-courses'],
        queryFn: async () => (await axios.get('/faculty/courses')).data,
    });

    /* Enrolled students */
    const { data: students = [], isLoading: loadingStudents } = useQuery({
        queryKey: ['faculty-students', selectedCourse],
        queryFn: async () => (await axios.get(`/faculty/courses/${selectedCourse}/students`)).data,
        enabled: !!selectedCourse,
    });

    /* All activities for this course (needed for student-detail view) */
    const { data: activities = [], isLoading: loadingActivities } = useQuery({
        queryKey: ['activities', selectedCourse],
        queryFn: async () => (await axios.get(`/activities/course/${selectedCourse}`)).data,
        enabled: !!selectedCourse && !!selectedStudent,
    });

    /* All topics per activity — fetch only when viewing a student detail */
    const topicQueries = useQuery({
        queryKey: ['all-topics-for-course', selectedCourse, selectedStudent?.id],
        queryFn: async () => {
            // fetch topics for all activities in parallel
            const results = await Promise.all(
                activities.map(a =>
                    axios.get(`/activities/${a.id}/topics`).then(r => ({
                        activity: a,
                        topics: r.data,
                    }))
                )
            );
            return results;
        },
        enabled: !!selectedStudent && activities.length > 0,
    });

    /* Filter to this student's topics only */
    const studentWork = useMemo(() => {
        if (!selectedStudent || !topicQueries.data) return [];
        return topicQueries.data
            .map(({ activity, topics }) => {
                const myTopic = topics.find(t => t.assignedStudentId === selectedStudent.id);
                return myTopic ? { activity, topic: myTopic } : null;
            })
            .filter(Boolean);
    }, [topicQueries.data, selectedStudent]);

    /* Verify mutation */
    const verifyMutation = useMutation({
        mutationFn: ({ topicId, status, grade, feedback }) =>
            axios.post(`/activities/topic/${topicId}/verify`, { status, grade, feedback }),
        onSuccess: () => {
            toast.success('Evaluation saved!');
            queryClient.invalidateQueries(['all-topics-for-course', selectedCourse, selectedStudent?.id]);
            setVerifyState(null);
        },
        onError: () => toast.error('Failed to save evaluation'),
    });

    const handleCourseChange = (e) => {
        const id = e.target.value;
        setSelectedCourse(id);
        setSelectedStudent(null);
        setVerifyState(null);
        const c = courses.find(c => String(c.id) === String(id));
        setSelectedCourseName(c ? `${c.name} (${c.program} - ${c.year})` : '');
    };

    /* counts for student list badges */
    const getStudentCounts = (studentId) => {
        if (!topicQueries.data) return null;
        const all = topicQueries.data.flatMap(({ topics }) =>
            topics.filter(t => t.assignedStudentId === studentId)
        );
        return {
            total: all.length,
            submitted: all.filter(t => t.submissionStatus === 'SUBMITTED').length,
            approved: all.filter(t => t.submissionStatus === 'APPROVED').length,
        };
    };

    /* ─── RENDER ─── */
    return (
        <div className="fss-page">

            {/* ── Header ── */}
            <div className="fss-header">
                <div className="fss-header-left">
                    <div className="fss-header-icon"><Users size={22} /></div>
                    <div>
                        <h1 className="fss-title">My Students</h1>
                        <p className="fss-subtitle">View enrolled students and evaluate their submitted assignments</p>
                    </div>
                </div>
                {students.length > 0 && (
                    <div className="fss-header-badge">
                        <Users size={13} /> {students.length} Enrolled
                    </div>
                )}
            </div>

            {/* ── Course Selector ── */}
            <div className="fss-selector-bar">
                <GraduationCap size={15} className="fss-sel-icon" />
                <span className="fss-sel-label">Subject</span>
                <div className="fss-sel-wrap">
                    <select className="fss-select" value={selectedCourse} onChange={handleCourseChange}>
                        <option value="">— Select a Subject —</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.program} - {c.year})
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={13} className="fss-sel-arrow" />
                </div>
                {selectedCourseName && <span className="fss-sel-badge">{selectedCourseName}</span>}
            </div>

            {/* ── Empty — no course ── */}
            {!selectedCourse && (
                <div className="fss-empty">
                    <div className="fss-empty-icon"><GraduationCap size={36} /></div>
                    <h3>Select a Subject</h3>
                    <p>Choose a subject above to see the enrolled students and their assignment submissions.</p>
                </div>
            )}

            {/* ══════════════ STUDENT LIST VIEW ══════════════ */}
            {selectedCourse && !selectedStudent && (
                <div className="fss-list-section">
                    <div className="fss-list-header">
                        <div className="fss-list-header-left">
                            <div className="fss-list-icon"><GraduationCap size={16} /></div>
                            <div>
                                <h3 className="fss-list-title">Enrolled Students</h3>
                                <p className="fss-list-sub">Click on a student to view their assignment submissions</p>
                            </div>
                        </div>
                        <span className="fss-list-count">{students.length} students</span>
                    </div>

                    {loadingStudents ? (
                        <div className="fss-loading"><div className="fss-spinner" /></div>
                    ) : students.length === 0 ? (
                        <div className="fss-empty">
                            <Users size={34} />
                            <h3>No Students Found</h3>
                            <p>No students are enrolled in this subject yet.</p>
                        </div>
                    ) : (
                        <div className="fss-student-list">
                            {/* Table header */}
                            <div className="fss-list-row fss-list-head">
                                <div className="fss-col-num">#</div>
                                <div className="fss-col-name">Student</div>
                                <div className="fss-col-id">Roll / ID</div>
                                <div className="fss-col-prog">Program</div>
                                <div className="fss-col-action"></div>
                            </div>

                            {/* Rows */}
                            {students.map((student, idx) => (
                                <div
                                    key={student.id || idx}
                                    className="fss-list-row fss-list-item"
                                    onClick={() => setSelectedStudent(student)}
                                >
                                    <div className="fss-col-num">{idx + 1}</div>
                                    <div className="fss-col-name">
                                        <div className="fss-avatar">
                                        {student.profilePictureUrl ? (
                                            <img
                                                src={getImageUrl(student.profilePictureUrl)}
                                                alt={student.name}
                                                className="fss-avatar-img"
                                            />
                                        ) : (
                                            student.name?.charAt(0)?.toUpperCase() || 'S'
                                        )}
                                    </div>
                                        <div>
                                            <span className="fss-sname">{student.name}</span>
                                            {student.email && (
                                                <span className="fss-semail">{student.email}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="fss-col-id">
                                        <span className="fss-sid">
                                            {student.userId || `—`}
                                        </span>
                                    </div>
                                    <div className="fss-col-prog">
                                        {student.program ? (
                                            <span className="fss-sprog">{student.program} · Yr {student.year}</span>
                                        ) : '—'}
                                    </div>
                                    <div className="fss-col-action">
                                        <span className="fss-view-link">
                                            View Submissions <ChevronRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════ STUDENT DETAIL VIEW ══════════════ */}
            {selectedCourse && selectedStudent && (
                <div className="fss-detail-section">

                    {/* Detail header */}
                    <div className="fss-detail-header">
                        <button className="fss-back-btn"
                            onClick={() => { setSelectedStudent(null); setVerifyState(null); }}>
                            <ArrowLeft size={15} /> Back to Students
                        </button>
                        <div className="fss-detail-student">
                            <div className="fss-detail-avatar">
                                {selectedStudent.profilePictureUrl ? (
                                    <img
                                        src={getImageUrl(selectedStudent.profilePictureUrl)}
                                        alt={selectedStudent.name}
                                        className="fss-detail-avatar-img"
                                    />
                                ) : (
                                    selectedStudent.name?.charAt(0)?.toUpperCase() || 'S'
                                )}
                            </div>
                            <div>
                                <h3 className="fss-detail-name">{selectedStudent.name}</h3>
                                <p className="fss-detail-sub">
                                    {selectedStudent.userId || ''}
                                    {selectedStudent.program && ` · ${selectedStudent.program} · Year ${selectedStudent.year}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Summary stats */}
                    {!topicQueries.isLoading && studentWork.length > 0 && (
                        <div className="fss-detail-stats">
                            <div className="fss-dstat">
                                <Briefcase size={14} /> <span>{activities.length} Activities</span>
                            </div>
                            <div className="fss-dstat participating">
                                <Layers size={14} /> <span>{studentWork.length} Topics Selected</span>
                            </div>
                            <div className="fss-dstat submitted">
                                <Clock size={14} />
                                <span>{studentWork.filter(w => w.topic.submissionStatus === 'SUBMITTED').length} Pending Review</span>
                            </div>
                            <div className="fss-dstat approved">
                                <CheckCircle size={14} />
                                <span>{studentWork.filter(w => w.topic.submissionStatus === 'APPROVED').length} Approved</span>
                            </div>
                        </div>
                    )}

                    {/* Work list */}
                    {loadingActivities || topicQueries.isLoading ? (
                        <div className="fss-loading"><div className="fss-spinner" /></div>
                    ) : studentWork.length === 0 ? (
                        <div className="fss-empty">
                            <Briefcase size={34} />
                            <h3>No Submissions Yet</h3>
                            <p>This student hasn't selected or submitted any topics for this subject.</p>
                        </div>
                    ) : (
                        <div className="fss-work-list">
                            {studentWork.map(({ activity, topic }) => {
                                const sm = getStatus(topic.submissionStatus);
                                const isGrading = verifyState?.topicId === topic.id;

                                return (
                                    <div key={topic.id} className={`fss-work-card wc-${(topic.submissionStatus || 'PENDING').toLowerCase()}`}>
                                        {/* Card header */}
                                        <div className="fss-wc-header">
                                            <div className="fss-wc-activity">
                                                <Briefcase size={14} />
                                                <span>{activity.title}</span>
                                            </div>
                                            <span className={sm.cls}>{sm.label}</span>
                                        </div>

                                        {/* Topic info */}
                                        <div className="fss-wc-body">
                                            <div className="fss-wc-topic-info">
                                                <h4 className="fss-wc-topic-title">{topic.title}</h4>
                                                {topic.description && (
                                                    <p className="fss-wc-topic-desc">{topic.description}</p>
                                                )}
                                            </div>

                                            <div className="fss-wc-actions">
                                                {topic.studyMaterialUrl && (
                                                    <a href={topic.studyMaterialUrl} target="_blank"
                                                        rel="noopener noreferrer" className="fss-mat-btn">
                                                        <BookOpen size={13} /> Material
                                                    </a>
                                                )}
                                                {topic.submissionUrl && (
                                                    <a href={topic.submissionUrl} target="_blank"
                                                        rel="noopener noreferrer" className="fss-work-btn">
                                                        <ExternalLink size={13} /> View Submission
                                                    </a>
                                                )}
                                                {topic.submissionStatus === 'SUBMITTED' && !isGrading && (
                                                    <button className="fss-eval-btn"
                                                        onClick={() => setVerifyState({ topicId: topic.id, grade: '', feedback: '' })}>
                                                        Evaluate
                                                    </button>
                                                )}
                                                {topic.grade !== null && topic.grade !== undefined && (
                                                    <div className="fss-grade-pill">
                                                        <Award size={13} /> {topic.grade}/100
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {topic.feedback && (
                                            <div className="fss-wc-feedback">
                                                <span>Feedback:</span> {topic.feedback}
                                            </div>
                                        )}

                                        {/* Evaluation panel */}
                                        {isGrading && (
                                            <div className="fss-eval-panel">
                                                <h5 className="fss-ep-title">Evaluate Submission</h5>
                                                <div className="fss-ep-fields">
                                                    <div className="fss-ep-group">
                                                        <label>Grade (0–100)</label>
                                                        <input
                                                            type="number" min="0" max="100"
                                                            className="fss-ep-input"
                                                            placeholder="e.g. 85"
                                                            value={verifyState.grade}
                                                            onChange={e => setVerifyState({ ...verifyState, grade: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="fss-ep-group">
                                                        <label>Feedback</label>
                                                        <textarea
                                                            className="fss-ep-textarea"
                                                            rows="2"
                                                            placeholder="Write feedback for the student..."
                                                            value={verifyState.feedback}
                                                            onChange={e => setVerifyState({ ...verifyState, feedback: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="fss-ep-actions">
                                                    <button className="fss-ep-cancel"
                                                        onClick={() => setVerifyState(null)}>Cancel</button>
                                                    <button className="fss-ep-reject"
                                                        disabled={verifyMutation.isLoading}
                                                        onClick={() => verifyMutation.mutate({
                                                            topicId: topic.id, status: 'REJECTED',
                                                            grade: null, feedback: verifyState.feedback || 'Please resubmit.'
                                                        })}>
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                    <button className="fss-ep-approve"
                                                        disabled={verifyMutation.isLoading}
                                                        onClick={() => verifyMutation.mutate({
                                                            topicId: topic.id, status: 'APPROVED',
                                                            grade: verifyState.grade ? parseInt(verifyState.grade) : null,
                                                            feedback: verifyState.feedback
                                                        })}>
                                                        <CheckCircle size={14} /> Approve & Grade
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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

export default FacultyStudents;
