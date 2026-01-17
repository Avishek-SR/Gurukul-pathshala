

import React, { useEffect, useState } from 'react';
import { apiGet } from '../../../services/api';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch attendance records from backend
        const data = await apiGet('/admin/attendance');
        if (Array.isArray(data)) {
          setRecords(data);
        } else {
          setRecords([]);
        }
      } catch (e) {
        setError('Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, []);

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <h1>Attendance</h1>
        <p>View and manage daily attendance records</p>
      </div>

      <div className="attendance-card">
        {loading && <p className="muted">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && records.length === 0 && (
          <p className="muted">No attendance data available.</p>
        )}

        {!loading && !error && records.length > 0 && (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.userId}</td>
                  <td>{r.name}</td>
                  <td>{r.role}</td>
                  <td>
                    <span className={r.present ? 'badge-present' : 'badge-absent'}>
                      {r.present ? 'Present' : 'Absent'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;