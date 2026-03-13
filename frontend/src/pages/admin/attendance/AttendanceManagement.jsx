import React, { useEffect, useState } from 'react';
import axios from '../../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import './AttendanceManagement.css';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const AttendanceManagement = () => {
  // Nav state
  const [selectedClass, setSelectedClass] = useState(null);

  // Data state
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter state (within a class)
  const [sectionFilter, setSectionFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Dropdown data
  const [courses, setCourses] = useState([]);

  // --- Effects ---

  // 1. Fetch courses when component mounts (for dropdowns)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/admin/courses');
        setCourses(res.data);
      } catch (e) {
        console.error("Failed to fetch courses", e);
      }
    };
    fetchCourses();
  }, []);

  // 2. Fetch Attendance when Class is selected (or section changes)
  useEffect(() => {
    if (selectedClass) {
      fetchClassAttendance();
    } else {
      setAttendanceRecords([]); // clear when back to grid
    }
  }, [selectedClass, sectionFilter, courseFilter]);

  const fetchClassAttendance = async () => {
    setLoading(true);
    try {
      const params = {
        program: `Class ${selectedClass}`, // Filter by the exact class string format in DB
      };

      if (sectionFilter) params.section = sectionFilter;
      if (courseFilter) params.courseId = courseFilter;

      const res = await axios.get('/admin/attendance', { params });
      setAttendanceRecords(res.data);
    } catch (error) {
      console.error("Error fetching attendance", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  // --- Derived Stats (for the selected class view) ---
  const totalPresent = attendanceRecords.filter(r => r.present).length;
  const totalAbsent = attendanceRecords.length - totalPresent;
  const percentage = attendanceRecords.length > 0 ? ((totalPresent / attendanceRecords.length) * 100).toFixed(1) : 0;


  // --- Render: Class Selection Grid (Default View) ---
  if (!selectedClass) {
    return (
      <div className="attendance-page">
        <div className="attendance-header">
          <h1>Attendance Management</h1>
          <p>Select a class to view attendance records.</p>
        </div>

        <div className="class-grid-container">
          {CLASSES.map((cls) => (
            <div key={cls} className="class-card-item" onClick={() => setSelectedClass(cls)}>
              <div className="class-card-icon">📅</div>
              <h3>Class {cls}</h3>
              <p>View Logs</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Render: Class Detail View ---
  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <button className="back-btn" onClick={() => {
          setSelectedClass(null);
          setSectionFilter('');
          setCourseFilter('');
        }}>
          ← Back to Classes
        </button>
        <h1>Attendance: Class {selectedClass}</h1>
        <p>Monitoring stats for Class {selectedClass}</p>
      </div>

      <div className="attendance-card">

        {/* Filters Bar */}
        <div className="filters-bar">
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
          >
            <option value="">All Sections</option>
            {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All Subjects</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Quick Stats for this view */}
        <div className="attendance-stats">
          <div className="stat-box">
            <h4>Presence Rate</h4>
            <strong className="text-teal-600">{percentage}%</strong>
          </div>
          <div className="stat-box">
            <h4>Present</h4>
            <strong className="text-emerald-600">{totalPresent}</strong>
          </div>
          <div className="stat-box">
            <h4>Absent</h4>
            <strong className="text-rose-600">{totalAbsent}</strong>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading records...</div>
        ) : attendanceRecords.length === 0 ? (
          <div className="empty-state">No attendance records found for this selection.</div>
        ) : (
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student ID</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Marked By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>

                    <td className="font-mono font-bold text-gray-600">
                      {record.studentUserId || record.studentId}
                    </td>

                    <td>
                      {courses.find(c => c.id === record.courseId)?.name || record.courseId}
                    </td>

                    {/* Since Section isn't directly on AttendanceDTO, we might need to rely on the context or fetch it if needed. 
                                            But usually, user info has section. For now, since we filtered by class, we assume correctness.
                                            Ideally, AttendanceDTO should have section too, or we fetch it. 
                                            For now, I'll leave it blank or rely on filter context if strict.
                                            actually, let's just show 'Class X' or similar if we have the data. 
                                            Wait, the filter 'program' (selectedClass) applies to all.
                                        */}
                    <td>{record.section || selectedClass}</td>

                    <td>
                      {record.facultyUserId ? (
                        <span className="faculty-badge">
                          {record.facultyUserId}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm italic">System</span>
                      )}
                    </td>

                    <td>
                      {record.present ? (
                        <span className="status-badge present">Present</span>
                      ) : (
                        <span className="status-badge absent">Absent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;