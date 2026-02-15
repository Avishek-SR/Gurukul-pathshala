import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig';
import { Scanner } from '@yudiel/react-qr-scanner';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle, TrendingUp, PieChart, ChevronRight, Activity, Camera, X } from 'lucide-react';
import './StudentAttendance.css';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchAttendance = async () => {
        try {
            const res = await axios.get('/student/attendance');
            setAttendance(res.data);
        } catch (error) {
            console.error("Error fetching attendance", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleScan = async (result) => {
        if (result && result[0] && !processing) {
            setProcessing(true);
            const token = result[0].rawValue;

            try {
                toast.loading('Verifying QR Code...', { id: 'scan-toast' });
                await axios.post('/attendance/qr/scan', { token });
                toast.success('Attendance Marked Successfully!', { id: 'scan-toast' });
                setShowScanner(false);
                fetchAttendance(); // Refresh list
            } catch (error) {
                toast.error(error.response?.data || 'Invalid or Expired QR Code', { id: 'scan-toast' });
            } finally {
                setProcessing(false);
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-teal-500 rounded-full animate-spin mb-6"></div>
            <p className="font-black text-xs uppercase tracking-widest animate-pulse">Syncing Records...</p>
        </div>
    );

    // Filtered attendance for table
    const filteredAttendance = filterDate
        ? attendance.filter(r => {
            const recordDate = new Date(r.date);
            const filter = new Date(filterDate);
            return recordDate.toDateString() === filter.toDateString();
        })
        : attendance;

    // Calculate Summary
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.present).length;
    const absentDays = totalDays - presentDays;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // Subject-wise Calculation
    const subjectStats = attendance.reduce((acc, curr) => {
        const subject = curr.courseName || 'General';
        if (!acc[subject]) acc[subject] = { total: 0, present: 0 };
        acc[subject].total += 1;
        if (curr.present) acc[subject].present += 1;
        return acc;
    }, {});

    return (
        <div className="student-attendance-container">
            {/* Header Section */}
            <div className="student-attendance-header-section">
                <div>
                    <nav className="breadcrumb-nav">
                        <span>Portal</span>
                        <ChevronRight size={14} />
                        <span className="text-teal-600">My Attendance</span>
                    </nav>
                    <h1 className="page-title">Performance <span className="text-teal-600 underline decoration-teal-500/30 decoration-8 underline-offset-4">Tracker</span></h1>
                    <p className="page-subtitle">Detailed overview of your academic presence and compliance records.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Subject Wise Button */}
                    <button
                        onClick={() => document.getElementById('subject-analysis')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 rounded-xl font-bold shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 hover:text-indigo-600 transition-all"
                    >
                        <PieChart size={18} />
                        <span>Subject Wise</span>
                    </button>

                    {/* Date Wise Picker */}
                    <div className="relative">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 rounded-xl font-bold shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        />
                        {!filterDate && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white rounded-xl border border-gray-200">
                                <span className="flex items-center gap-2 text-gray-700 font-bold">
                                    <Calendar size={18} />
                                    <span>Date Wise</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {filterDate && (
                        <button
                            onClick={() => setFilterDate('')}
                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                            title="Clear Date Filter"
                        >
                            <X size={18} />
                        </button>
                    )}

                    {/* Scan Button */}
                    <button
                        onClick={() => setShowScanner(true)}
                        className="scan-attendance-btn !py-3 !px-6 !rounded-xl !text-sm"
                    >
                        <Camera size={18} />
                        <span>Scan QR</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards - Modern Gradient Style */}
            <div className="attendance-stats-grid">
                <div className="stats-card total">
                    <div className="stats-card-content">
                        <div>
                            <span className="stats-label">Total Classes</span>
                            <h3 className="stats-value">{totalDays}</h3>
                        </div>
                        <div className="stats-icon-box">
                            <PieChart size={30} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="stats-card present">
                    <div className="stats-card-content">
                        <div>
                            <span className="stats-label">Days Present</span>
                            <h3 className="stats-value">{presentDays}</h3>
                        </div>
                        <div className="stats-icon-box">
                            <TrendingUp size={30} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className={`stats-card ${percentage >= 75 ? 'rate-high' : 'rate-low'} relative !p-6 !flex !flex-col !justify-center !items-center min-h-[220px]`}>
                    <div className="absolute top-6 left-6">
                        <span className="stats-label text-white/90">Overall Attendance</span>
                    </div>

                    <div className="relative w-32 h-32 flex items-center justify-center mt-4">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                            {/* Background Circle - Red for Absent */}
                            <circle cx="64" cy="64" r="56" stroke="#ef4444" strokeWidth="10" fill="transparent" strokeOpacity="0.6" />
                            {/* Progress Circle - White for Present */}
                            <circle
                                cx="64" cy="64" r="56"
                                stroke="#ffffff"
                                strokeWidth="10"
                                fill="transparent"
                                strokeDasharray={351.86}
                                strokeDashoffset={351.86 - (351.86 * Number(percentage)) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-black text-white tracking-tighter drop-shadow-md">{percentage}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject-wise Breakdown */}
            {Object.keys(subjectStats).length > 0 && (
                <div id="subject-analysis" className="mb-10">
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight mb-6 flex items-center gap-3">
                        <Calendar className="text-indigo-500" size={24} />
                        Subject Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(subjectStats).map(([subject, stats]) => {
                            const subPercentage = ((stats.present / stats.total) * 100).toFixed(1);
                            return (
                                <div key={subject} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-800 text-lg">{subject}</h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${subPercentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {subPercentage}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                        <div className="flex items-center gap-1">
                                            <CheckCircle size={14} className="text-emerald-500" />
                                            <span className="font-semibold text-gray-700">{stats.present}</span> Present
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <XCircle size={14} className="text-rose-500" />
                                            <span className="font-semibold text-gray-700">{stats.total - stats.present}</span> Absent
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${subPercentage >= 75 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                            style={{ width: `${subPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Attendance History List */}
            <div id="attendance-history" className="history-container">
                <div className="history-header">
                    <h3 className="history-title">
                        <Activity className="text-teal-500" size={24} />
                        Presence Logbook
                        {filterDate && <span className="text-sm font-medium text-gray-400 ml-2">(Filtered: {new Date(filterDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })})</span>}
                    </h3>
                    <div className="absent-badge">
                        <XCircle size={14} />
                        <span>{absentDays} Absences</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="attendance-history-table">
                        <thead>
                            <tr>
                                <th>Date Record</th>
                                <th>Subject</th>
                                <th>Weekday</th>
                                <th className="text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAttendance.length > 0 ? (
                                filteredAttendance.map((record, index) => {
                                    const dateObj = new Date(record.date);
                                    return (
                                        <tr key={index}>
                                            <td className="table-date">
                                                {dateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="font-semibold text-gray-600">
                                                {record.courseName || 'General'}
                                            </td>
                                            <td className="table-weekday">
                                                {dateObj.toLocaleDateString("en-US", { weekday: 'long' })}
                                            </td>
                                            <td className="text-right">
                                                <span className={`status-badge ${record.present ? 'present' : 'absent'}`}>
                                                    {record.present ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                    {record.present ? 'Present' : 'Absent'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-400">
                                        No attendance records found for this date.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {attendance.length === 0 && (
                    <div className="p-24 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
                            <Calendar size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-300 uppercase tracking-widest">No Logs Yet</h3>
                        <p className="text-gray-400 mt-2 font-medium">Your attendance records will appear here once faculty starts marking.</p>
                    </div>
                )}
            </div>

            {/* SCANNER MODAL */}
            {showScanner && (
                <div
                    className="scanner-modal-overlay"
                    onClick={() => setShowScanner(false)}
                >
                    <div
                        className="scanner-modal-card"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-md"
                            onClick={() => setShowScanner(false)}
                        >
                            <X size={20} />
                        </button>

                        <div className="scanner-header">
                            <h3 className="text-white text-xl font-bold mb-2">Scan QR Code</h3>
                            <p className="text-gray-400 text-sm">Align the classroom QR code within the frame to mark your attendance.</p>
                        </div>

                        <div className="scanner-viewport">
                            <Scanner
                                onScan={handleScan}
                                styles={{ container: { width: '100%', height: '100%' } }}
                                components={{ audio: false }}
                            />

                            {/* Scanning Overlay UI */}
                            <div className="scanner-overlay-frame animate-pulse">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-teal-500 -mt-0.5 -ml-0.5"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-teal-500 -mt-0.5 -mr-0.5"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-teal-500 -mb-0.5 -ml-0.5"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-teal-500 -mb-0.5 -mr-0.5"></div>
                            </div>
                        </div>

                        <div className="scanner-footer">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                                {processing ? 'Verifying...' : 'Ready to Scan'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAttendance;
