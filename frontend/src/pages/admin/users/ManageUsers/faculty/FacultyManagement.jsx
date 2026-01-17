import React, { useState, useEffect } from 'react';
import './FacultyManagement.css';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    dob: '',
    department: '',
    designation: 'Assistant Professor'
  });

  // Fetch faculty from backend - FIXED URL
  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/admin/users/role/FACULTY', { // FIXED: Changed from /admin/FACULTY to /admin/users/role/FACULTY
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' // Added content type
        }
      });
      
      console.log('Fetch faculty response:', response.status); // Debug log
      
      if (response.ok) {
        const data = await response.json();
        setFaculty(data);
      } else {
        console.error('Failed to fetch faculty:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Add new faculty
  const handleAddFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/faculty', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFaculty.name,
          dob: newFaculty.dob,
          department: newFaculty.department,
          designation: newFaculty.designation
        })
      });

      if (response.ok) {
        fetchFaculty();
        setShowAddForm(false);
        setNewFaculty({
          name: '',
          dob: '',
          department: '',
          designation: 'Assistant Professor'
        });
      }
    } catch (error) {
      console.error('Error adding faculty:', error);
    }
  };

  // Update faculty status
  const toggleFacultyStatus = async (facultyId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8080/api/admin/faculty/${facultyId}/status?active=${!currentStatus}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        fetchFaculty();
      }
    } catch (error) {
      console.error('Error updating faculty:', error);
    }
  };

  // Filter faculty
  const filteredFaculty = faculty.filter(faculty => 
    faculty.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="management-container">
      {/* Header */}
      <div className="management-header">
        <h2><i className="fas fa-chalkboard-teacher"></i> Faculty Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="add-btn"
            onClick={() => setShowAddForm(true)}
          >
            <i className="fas fa-plus"></i> Add Faculty
          </button>
        </div>
      </div>

      {/* Add Faculty Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-modal">
            <div className="modal-header">
              <h3>Add New Faculty</h3>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={newFaculty.dob}
                    onChange={(e) => setNewFaculty({ ...newFaculty, dob: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({...newFaculty, department: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <select
                    value={newFaculty.designation}
                    onChange={(e) => setNewFaculty({...newFaculty, designation: e.target.value})}
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleAddFaculty}>
                Save Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i> Loading faculty...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((faculty) => (
                <tr key={faculty.id}>
                  <td>
                    <div className="user-id-cell">
                      <i className="fas fa-chalkboard-teacher"></i>
                      <span>{faculty.userId}</span>
                    </div>
                  </td>
                  <td>{faculty.name}</td>
                  <td>{faculty.email}</td>
                  <td>{faculty.department || 'Not assigned'}</td>
                  <td>
                    <span className="designation-badge">{faculty.designation || 'Faculty'}</span>
                  </td>
                  <td>
                    <div className="status-cell">
                      <span className={`status-dot ${faculty.active ? 'active' : 'inactive'}`}></span>
                      <span>{faculty.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className={`status-toggle-btn ${faculty.active ? 'deactivate' : 'activate'}`}
                        onClick={() => toggleFacultyStatus(faculty.id, faculty.active)}
                        title={faculty.active ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`fas fa-${faculty.active ? 'user-slash' : 'user-check'}`}></i>
                      </button>
                      <button className="edit-btn" title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="delete-btn" title="Delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && filteredFaculty.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-chalkboard-teacher"></i>
            <p>No faculty members found</p>
          </div>
        )}
      </div>

      {/* Faculty Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{faculty.length}</h3>
            <p>Total Faculty</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{faculty.filter(f => f.active).length}</h3>
            <p>Active Faculty</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon department">
            <i className="fas fa-building"></i>
          </div>
          <div className="stat-content">
            <h3>{new Set(faculty.map(f => f.department)).size}</h3>
            <p>Departments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyManagement;