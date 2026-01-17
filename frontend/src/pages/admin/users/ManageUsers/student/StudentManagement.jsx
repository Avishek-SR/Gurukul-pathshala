import React, { useState, useEffect } from 'react';
import './StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    dob: '',
    program: '',
    year: '1'
  });

  // Fetch students from backend
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add new student
  const handleAddStudent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newStudent.name,
          dob: newStudent.dob,
          program: newStudent.program,
          year: newStudent.year,
          role: 'STUDENT'
        })
      });

      if (response.ok) {
        fetchStudents();
        setShowAddForm(false);
        setNewStudent({
          name: '',
          dob: '',
          program: '',
          year: '1'
        });
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  // Update student status
  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8080/api/admin/students/${studentId}/status?active=${!currentStatus}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        fetchStudents();
      }
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/admin/STUDENT/${studentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchStudents();
        }
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => 
    student.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="management-container">
      {/* Header */}
      <div className="management-header">
        <h2><i className="fas fa-graduation-cap"></i> Student Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="add-btn"
            onClick={() => setShowAddForm(true)}
          >
            <i className="fas fa-plus"></i> Add Student
          </button>
        </div>
      </div>

      {/* Add Student Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-modal">
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="Rahul Kumar"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={newStudent.dob}
                    onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Program</label>
                  <select
                    value={newStudent.program}
                    onChange={(e) => setNewStudent({...newStudent, program: e.target.value})}
                  >
                    <option value="">Select Program</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <select
                    value={newStudent.year}
                    onChange={(e) => setNewStudent({...newStudent, year: e.target.value})}
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleAddStudent}>
                Save Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i> Loading students...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Program</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="user-id-cell">
                      <i className="fas fa-graduation-cap"></i>
                      <span>{student.userId}</span>
                    </div>
                  </td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.program || 'Not assigned'}</td>
                  <td>
                    <span className="year-badge">Year {student.year || '1'}</span>
                  </td>
                  <td>
                    <div className="status-cell">
                      <span className={`status-dot ${student.active ? 'active' : 'inactive'}`}></span>
                      <span>{student.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className={`status-toggle-btn ${student.active ? 'deactivate' : 'activate'}`}
                        onClick={() => toggleStudentStatus(student.id, student.active)}
                        title={student.active ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`fas fa-${student.active ? 'user-slash' : 'user-check'}`}></i>
                      </button>
                      <button className="edit-btn" title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteStudent(student.id)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && filteredStudents.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-graduation-cap"></i>
            <p>No students found</p>
          </div>
        )}
      </div>

      {/* Student Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{students.length}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{students.filter(s => s.active).length}</h3>
            <p>Active Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon program">
            <i className="fas fa-laptop-code"></i>
          </div>
          <div className="stat-content">
            <h3>{new Set(students.map(s => s.program)).size}</h3>
            <p>Programs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;