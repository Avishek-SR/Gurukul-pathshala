import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../api/axiosConfig';
import toast from 'react-hot-toast';
import { Calendar, User, ChevronRight, Save, Clock, Users, Check, X, Eye, Camera, Scan } from 'lucide-react';
import './MarkAttendance.css';
import FaceScanner from '../../../components/attendance/FaceScanner';
import { createFaceMatcher, recognizeFaces } from '../../../services/faceApi';

// Lazy load QR Generator
const QRCodeGenerator = React.lazy(() => import('./QRCodeGenerator'));

const MarkAttendance = () => {
    const queryClient = useQueryClient();
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [showQRModal, setShowQRModal] = useState(false); // Modal State
    const [showFaceScanner, setShowFaceScanner] = useState(false);
    const [studentDescriptors, setStudentDescriptors] = useState([]);
    const [faceMatcher, setFaceMatcher] = useState(null);

    // Fetch Courses
    const { data: courses = [] } = useQuery({
        queryKey: ['faculty-courses'],
        queryFn: async () => {
            const { data } = await axios.get('/faculty/courses');
            return data;
        }
    });

    // Fetch Students for selected course
    const { data: students = [], isLoading: isLoadingStudents } = useQuery({
        queryKey: ['course-students', selectedCourse],
        enabled: !!selectedCourse,
        queryFn: async () => {
            const { data } = await axios.get(`/courses/${selectedCourse}/students`);
            return data;
        }
    });

    // Fetch existing attendance
    useEffect(() => {
        if (selectedCourse && selectedDate && students.length > 0) {
            axios.get(`/attendance?courseId=${selectedCourse}&date=${selectedDate}`)
                .then(res => {
                    const map = {};
                    if (res.data.length > 0) {
                        res.data.forEach(record => {
                            map[record.studentId] = record.present;
                        });
                    } else {
                        // If no records exist yet, default everyone to ABSENT (false)
                        students.forEach(s => {
                            map[s.id] = false;
                        });
                    }
                    setAttendanceMap(map);
                })
                .catch(() => {
                    // Fallback: Default all to absent on error/404
                    const map = {};
                    students.forEach(s => {
                        map[s.id] = false;
                    });
                    setAttendanceMap(map);
                });
        }
    }, [selectedCourse, selectedDate, students]);

    // Fetch Student Descriptors for Face Recognition
    useEffect(() => {
        if (selectedCourse) {
            axios.get(`/attendance/face-recognition/course/${selectedCourse}/descriptors`)
                .then(res => {
                    setStudentDescriptors(res.data);
                    if (res.data.length > 0) {
                        const matcher = createFaceMatcher(res.data);
                        setFaceMatcher(matcher);
                    } else {
                        // Optional: toast.info("No face registrations found for this class.");
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch face descriptors:", err);
                    if (err.response && err.response.status === 403) {
                        toast.error("Permission denied: Cannot access face data.");
                    } else {
                        toast.error("Failed to load face recognition data.");
                    }
                });
        }
    }, [selectedCourse]);

    // Handle Manual Attendance Toggle
    const handleAttendanceChange = (studentId, isPresent) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: isPresent
        }));
    };

    const [scanStatus, setScanStatus] = useState("Starting...");

    useEffect(() => {
        if (!faceMatcher && showFaceScanner) {
            setScanStatus("Loading Face Data...");
        }
    }, [faceMatcher, showFaceScanner]);

    const handleFaceScan = async (videoElement) => {
        if (!faceMatcher) {
            setScanStatus("Waiting for data...");
            return;
        }

        // Optional: show processing state if it takes too long, 
        // but typically valid results overwrite this quickly.
        // setScanStatus("Processing..."); 

        try {
            const results = await recognizeFaces(videoElement, faceMatcher);

            if (!results || results.length === 0) {
                setScanStatus("Tracking...");
                return;
            }

            let newMarks = 0;
            const newMatches = { ...attendanceMap };
            let markedNames = [];
            let bestMatchLabel = "Unknown";
            let bestMatchDistance = 1.0;

            // Find best match for status display
            const bestMatch = results.reduce((prev, curr) => {
                return (prev.distance < curr.distance) ? prev : curr;
            }, { distance: 1.0, label: 'unknown' });

            bestMatchDistance = bestMatch.distance;

            results.forEach(match => {
                if (match.label !== 'unknown') {
                    const studentInfo = studentDescriptors.find(s => s.userId === match.label);
                    if (studentInfo) {
                        bestMatchLabel = studentInfo.name;

                        // Mark only if not already marked present
                        if (!newMatches[studentInfo.id]) {
                            newMatches[studentInfo.id] = true;
                            newMarks++;
                            markedNames.push(studentInfo.name);
                        } else {
                            bestMatchLabel += " (Done)";
                        }
                    }
                }
            });

            if (bestMatchLabel !== "Unknown") {
                setScanStatus(`Seen: ${bestMatchLabel}`);
            } else {
                setScanStatus(`Unknown Face (Diff: ${bestMatchDistance.toFixed(2)})`);
            }

            if (newMarks > 0) {
                setAttendanceMap(newMatches);
                toast.success(`Marked: ${markedNames.join(", ")}`, {
                    id: 'auto-attendance',
                    duration: 3000
                });
            }
        } catch (err) {
            console.error("Face recognition error:", err);
            setScanStatus("Error");
        }
    };

    // Submit Mutation (Legacy - kept for structure but mostly handled by direct calls now)
    const submitMutation = { isLoading: false };

    return (
        <div className="mark-attendance-container animate-in fade-in duration-700">
            {/* Custom Header */}
            <div className="attendance-header">
                <div className="header-title-group">
                    <h2>
                        <div className="header-icon-box">
                            <i className="fas fa-calendar-check text-xl"></i>
                        </div>
                        <span>Class Register</span>
                    </h2>
                </div>
                <div className="attendance-actions">
                    <button
                        onClick={() => setShowQRModal(true)}
                        className="tab-btn"
                        disabled={!selectedCourse}
                    >
                        <Eye size={18} />
                        Show QR Code
                    </button>
                    <button
                        onClick={() => setShowFaceScanner(true)}
                        className="tab-btn bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                        disabled={!selectedCourse || studentDescriptors.length === 0}
                        title={studentDescriptors.length === 0 ? "No local face data available" : "Scan Class"}
                    >
                        <Scan size={18} />
                        Face Recognition
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="attendance-controls-card">
                <div className="control-group">
                    <label>Subject</label>
                    <select
                        className="attendance-select"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option value="">-- Choose Course --</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.name} • {c.program || 'N/A'}</option>
                        ))}
                    </select>
                </div>
                {selectedCourse && (
                    <div className="control-group">
                        <label>Date</label>
                        <input
                            type="date"
                            className="attendance-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* MAIN CONTENT: ALWAYS VISIBLE (MANUAL LIST) */}
            {selectedCourse ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Stats Summary */}
                    {students.length > 0 && (
                        <div className="attendance-stats">
                            <div className="stat-pill present">
                                <div className="stat-dot green"></div>
                                <span>{Object.values(attendanceMap).filter(v => v).length} Present</span>
                            </div>
                            <div className="stat-pill absent">
                                <div className="stat-dot red"></div>
                                <span>{Object.values(attendanceMap).filter(v => !v).length} Absent</span>
                            </div>
                        </div>
                    )}

                    {students.length > 0 ? (
                        <div className="attendance-table-container">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th className="col-sn">S.N</th>
                                        <th className="col-id">User ID</th>
                                        <th className="col-name">Name</th>
                                        <th className="col-status">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => (
                                        <tr key={student.id}>
                                            <td className="col-sn">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            <td className="col-id">
                                                {student.userId}
                                            </td>
                                            <td className="col-name">
                                                {student.name}
                                            </td>
                                            <td className="col-status">
                                                <div className="flex items-center gap-4">
                                                    <div className="status-toggle-group">
                                                        <label className="status-btn-label">
                                                            <input
                                                                type="radio"
                                                                name={`att-${student.id}`}
                                                                checked={attendanceMap[student.id] === true}
                                                                onChange={() => handleAttendanceChange(student.id, true)}
                                                            />
                                                            <div className="status-btn-content btn-present">
                                                                <Check size={16} />
                                                                Present
                                                            </div>
                                                        </label>

                                                        <label className="status-btn-label">
                                                            <input
                                                                type="radio"
                                                                name={`att-${student.id}`}
                                                                checked={attendanceMap[student.id] === false}
                                                                onChange={() => handleAttendanceChange(student.id, false)}
                                                            />
                                                            <div className="status-btn-content btn-absent">
                                                                <X size={16} />
                                                                Absent
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="save-btn-container">
                                <button
                                    onClick={() => {
                                        const records = Object.keys(attendanceMap).map(id => ({
                                            studentId: parseInt(id),
                                            courseId: parseInt(selectedCourse),
                                            date: selectedDate,
                                            present: attendanceMap[id]
                                        }));

                                        axios.post('/attendance/bulk', records)
                                            .then(() => {
                                                toast.success('Attendance saved successfully!');
                                                queryClient.invalidateQueries(['attendance', selectedCourse, selectedDate]);
                                            })
                                            .catch(() => toast.error('Failed to save'));
                                    }}
                                    disabled={submitMutation.isLoading}
                                    className="save-attendance-btn"
                                >
                                    <i className="fas fa-save"></i>
                                    Save Class Register
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <i className="fas fa-users mb-4 text-4xl text-gray-300"></i>
                            <p>No students enrolled in this course.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 mx-auto text-gray-300">
                        <Calendar size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Awaiting Selection</h3>
                    <p className="text-gray-500">Please select a course to begin.</p>
                </div>
            )}

            {/* QR MODAL */}
            {showQRModal && selectedCourse && (
                <div className="qr-modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setShowQRModal(false)}>
                            <X size={24} />
                        </button>
                        <React.Suspense fallback={
                            <div className="p-12 text-center bg-white rounded-3xl">
                                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                            </div>
                        }>
                            <QRCodeGenerator courseId={selectedCourse} />
                        </React.Suspense>
                    </div>
                </div>
            )}

            {/* FACE SCANNER MODAL */}
            {showFaceScanner && (
                <div className="qr-modal-overlay" onClick={() => setShowFaceScanner(false)}>
                    <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
                        <FaceScanner
                            onScan={handleFaceScan}
                            onClose={() => setShowFaceScanner(false)}
                            title="Auto-Mark Attendance"
                            autoScan={true}
                            scanStatus={scanStatus}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarkAttendance;
