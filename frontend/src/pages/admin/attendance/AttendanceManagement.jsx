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
  const [dateFilter, setDateFilter] = useState('');

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

  // 2. Fetch Attendance when Class is selected (or filters change)
  useEffect(() => {
    if (selectedClass) {
      fetchClassAttendance();
    } else {
      setAttendanceRecords([]); // clear when back to grid
    }
  }, [selectedClass, sectionFilter, courseFilter, dateFilter]);

  const fetchClassAttendance = async () => {
    setLoading(true);
    try {
      const params = {
        program: `Class ${selectedClass}`,
      };

      if (sectionFilter) params.section = sectionFilter;
      if (courseFilter) params.courseId = courseFilter;
      if (dateFilter) params.date = dateFilter; // format: YYYY-MM-DD

      const res = await axios.get('/admin/attendance', { params });
      setAttendanceRecords(res.data);
    } catch (error) {
      console.error("Error fetching attendance", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSectionFilter('');
    setCourseFilter('');
    setDateFilter('');
  };

  // --- Derived Stats (for the selected class view) ---
  const totalPresent = attendanceRecords.filter(r => r.present).length;
  const totalAbsent = attendanceRecords.length - totalPresent;
  const percentage = attendanceRecords.length > 0 ? ((totalPresent / attendanceRecords.length) * 100).toFixed(1) : 0;

  const isFiltered = sectionFilter || courseFilter || dateFilter;

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
          handleClearFilters();
        }}>
          ← Back to Classes
        </button>
        <h1>Attendance: Class {selectedClass}</h1>
        <p>
          Monitoring stats for Class {selectedClass}
          {dateFilter && <span className="date-badge"> — {new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
        </p>
      </div>

      <div className="attendance-card">

        {/* Filters Bar */}
        <div className="filters-bar">

          {/* Section Filter */}
          <div className="filter-group">
            <label className="filter-label">Section</label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
            >
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="filter-group">
            <label className="filter-label">Subject</label>
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

          {/* Date Filter */}
          <div className="filter-group">
            <label className="filter-label">Date</label>
            <input
              type="date"
              className="date-input"
              value={dateFilter}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {/* Clear Button — shown only when any filter is active */}
          {isFiltered && (
            <button className="clear-filter-btn" onClick={handleClearFilters}>
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Active filter tags */}
        {isFiltered && (
          <div className="active-filters">
            {sectionFilter && <span className="filter-tag">Section: {sectionFilter}</span>}
            {courseFilter && <span className="filter-tag">Subject: {courses.find(c => c.id == courseFilter)?.name || courseFilter}</span>}
            {dateFilter && <span className="filter-tag">Date: {new Date(dateFilter + 'T00:00:00').toLocaleDateString()}</span>}
          </div>
        )}

        {/* Quick Stats for this view */}
        <div className="attendance-stats">
          <div className="stat-box">
            <h4>Total Records</h4>
            <strong style={{ color: '#03045e' }}>{attendanceRecords.length}</strong>
          </div>
          <div className="stat-box">
            <h4>Presence Rate</h4>
            <strong style={{ color: '#0d9488' }}>{percentage}%</strong>
          </div>
          <div className="stat-box">
            <h4>Present</h4>
            <strong style={{ color: '#16a34a' }}>{totalPresent}</strong>
          </div>
          <div className="stat-box">
            <h4>Absent</h4>
            <strong style={{ color: '#dc2626' }}>{totalAbsent}</strong>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading records...</p>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No attendance records found for this selection.</p>
            {isFiltered && (
              <button className="clear-filter-btn" onClick={handleClearFilters}>Clear Filters</button>
            )}
          </div>
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
                    <td className="date-cell">{new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>

                    <td className="font-mono font-bold text-gray-600">
                      {record.studentUserId || record.studentId}
                    </td>

                    <td>
                      {courses.find(c => c.id === record.courseId)?.name || record.courseId}
                    </td>

                    <td>{record.section || `Class ${selectedClass}`}</td>

                    <td>
                      {record.facultyUserId ? (
                        <span className="faculty-badge">
                          {record.facultyUserId}
                        </span>
                      ) : (
                        <span className="system-badge">System</span>
                      )}
                    </td>

                    <td>
                      {record.present ? (
                        <span className="status-badge present">✓ Present</span>
                      ) : (
                        <span className="status-badge absent">✗ Absent</span>
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