import React, { useState, useEffect } from 'react'; // Configured axios instance
import './FacultyManagement.css';
import EditFacultyForm from './components/EditFacultyForm';
import FacultyProfile from './components/FacultyProfile';
import FacultyStats from './components/FacultyStats';
import BulkUploadModal from '../../../../../components/BulkUploadModal';

const FacultyManagement = ({ currentUser }) => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Edit & Profile State
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Permissions
  const canManage = currentUser?.superAdmin || currentUser?.permissions?.includes('MANAGE_FACULTY');
  const canBulkUpload = currentUser?.superAdmin || currentUser?.permissions?.includes('BULK_UPLOAD');
  const canDelete = currentUser?.superAdmin || currentUser?.permissions?.includes('DELETE_USERS');

  const [newFaculty, setNewFaculty] = useState({
    name: '',
    dob: '',
    department: '',
    designation: 'Assistant Professor',
    mobileNumber: '',
    citizenship: '',
    gender: '',
    personalEmail: ''
  });

  // Fetch faculty from backend
  const fetchFaculty = async () => {
    try {
      const token = sessionStorage.getItem('token');
      // FIXED: Endpoint changed to /api/admin/users/role/FACULTY
      const response = await fetch('/api/admin/users/role/FACULTY', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFaculty(data);
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
    // Basic validation
    if (!newFaculty.name || !newFaculty.dob || !newFaculty.gender) {
      alert('Please fill in all required fields (Name, DOB, Gender).');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      // FIXED: Endpoint changed from /api/admin/faculty to /api/admin/users
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFaculty.name,
          dob: newFaculty.dob,
          department: newFaculty.department,
          designation: newFaculty.designation,
          mobileNumber: newFaculty.mobileNumber,
          citizenship: newFaculty.citizenship,
          gender: newFaculty.gender,
          personalEmail: newFaculty.personalEmail,
          role: 'FACULTY'
        })
      });

      fetchFaculty();
      setShowAddForm(false);
      setNewFaculty({
        name: '',
        dob: '',
        department: '',
        designation: 'Assistant Professor',
        mobileNumber: '',
        citizenship: '',
        gender: '',
        personalEmail: ''
      });
      alert('Faculty member added successfully!');
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert(`Failed to add faculty: ${error.message}`);
    }
  };

  // Update faculty status
  const toggleFacultyStatus = async (facultyId, currentStatus) => {
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`/api/admin/users/${facultyId}/status?active=${!currentStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFaculty();
    } catch (error) {
      console.error('Error updating faculty:', error);
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        const token = sessionStorage.getItem('token');
        await fetch(`/api/admin/users/${facultyId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchFaculty();
      } catch (error) {
        console.error('Error deleting faculty:', error);
        alert("Failed to delete faculty member");
      }
    }
  };

  const handleResetPassword = async (facultyId) => {
    if (window.confirm('Are you sure you want to reset the password to default (FirstName@ddMM)?')) {
      try {
        const token = sessionStorage.getItem('token');
        await fetch(`/api/admin/users/${facultyId}/reset-password`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Password reset successfully');
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Failed to reset password');
      }
    }
  };

  const handleBulkUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', 'FACULTY');

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/admin/users/bulk-upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchFaculty();
      } else {
        throw new Error('Upload failed');
      }
    } catch (e) {
      console.error("Upload failed", e);
      throw new Error('Upload failed');
    }
  };

  const openEditModal = (faculty) => {
    setSelectedFaculty(faculty);
    setShowEditForm(true);
  };

  const openProfileWrapper = (faculty) => {
    setSelectedFaculty(faculty);
    setShowProfile(true);
  }

  const handleUpdateFaculty = async (updatedFaculty) => {
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`/api/admin/users/${updatedFaculty.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFaculty)
      });
      fetchFaculty();
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating faculty:", error);
      alert("Failed to update faculty");
    }
  };

  // Filter faculty
  const filteredFaculty = faculty.filter(faculty =>
    faculty.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/admin/export/users?role=FACULTY', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'faculty_users.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed');
    }
  };

  return (
    <div className="faculty-management-container">
      {/* Header */}
      <div className="faculty-mgmt-header">
        <h2><i className="fas fa-chalkboard-teacher"></i> Faculty Management</h2>
        <div className="faculty-actions">
          {/* Search Box */}
          <div className="faculty-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {canManage && (
            <button
              className="add-faculty-btn"
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus"></i> Add Faculty
            </button>
          )}

          {canBulkUpload && (
            <button
              className="add-faculty-btn"
              onClick={() => setShowBulkUpload(true)}
              style={{ background: '#27ae60' }}
            >
              <i className="fas fa-file-upload"></i> Bulk Upload
            </button>
          )}

          <button
            className="add-faculty-btn"
            onClick={handleExport}
            style={{ background: '#e67e22' }}
            title="Download Excel Report"
          >
            <i className="fas fa-file-excel"></i> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <FacultyStats faculty={faculty} />

      <hr style={{ margin: '25px 0', border: 'none', borderTop: '1px solid #f0f0f0' }} />

      {/* Filtered Count */}
      {searchTerm && (
        <div style={{ margin: '15px 0 10px', color: '#555', fontSize: '0.95rem', fontWeight: '500' }}>
          Found <span style={{ color: '#673ab7', fontWeight: '700' }}>{filteredFaculty.length}</span> matches from <span style={{ color: '#9e9e9e' }}>{faculty.length}</span> total faculty
        </div>
      )}

      {/* Faculty Table */}
      <div className="faculty-table-container">
        {loading ? (
          <div className="faculty-loading">
            <i className="fas fa-spinner fa-spin"></i> Loading faculty...
          </div>
        ) : (
          <table className="faculty-table">
            <thead>
              <tr>
                <th>Faculty ID</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Work Email</th>
                <th>Personal Email</th>
                <th>Mobile</th>
                <th>Citizenship</th>
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
                    <div className="faculty-id-cell">
                      <i className="fas fa-chalkboard-teacher"></i>
                      <span>{faculty.userId}</span>
                    </div>
                  </td>
                  <td>{faculty.name}</td>
                  <td>{faculty.dob || 'N/A'}</td>
                  <td>{faculty.gender || 'N/A'}</td>
                  <td>{faculty.email}</td>
                  <td>{faculty.personalEmail || 'N/A'}</td>
                  <td>{faculty.mobileNumber || 'N/A'}</td>
                  <td>{faculty.citizenship || 'N/A'}</td>
                  <td>
                    <span className="faculty-department-badge">
                      {faculty.department || 'Not assigned'}
                    </span>
                  </td>
                  <td>
                    <span className="faculty-designation-badge">
                      {faculty.designation || 'Faculty'}
                    </span>
                  </td>
                  <td>
                    <div className="faculty-status-cell">
                      <span className={`faculty-status-dot ${faculty.active ? 'active' : 'inactive'}`}></span>
                      <span>{faculty.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="faculty-actions-cell">
                      {canManage && (
                        <button
                          className={`faculty-activate-btn ${!faculty.active ? 'faculty-deactivate-btn' : ''}`}
                          onClick={() => toggleFacultyStatus(faculty.id, faculty.active)}
                          title={faculty.active ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`fas fa-${faculty.active ? 'user-slash' : 'user-check'}`}></i>
                        </button>
                      )}
                      <button className="faculty-edit-btn" onClick={() => openProfileWrapper(faculty)} title="View Profile">
                        <i className="fas fa-eye"></i>
                      </button>
                      {canManage && (
                        <button className="faculty-edit-btn" onClick={() => openEditModal(faculty)} title="Edit">
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      {canManage && (
                        <button
                          className="faculty-edit-btn"
                          onClick={() => handleResetPassword(faculty.id)}
                          title="Reset Password"
                          style={{
                            background: '#ff9800',
                            color: 'white'
                          }}
                        >
                          <i className="fas fa-key"></i>
                        </button>
                      )}
                      {canDelete && (
                        <button className="faculty-delete-btn" onClick={() => handleDeleteFaculty(faculty.id)} title="Delete">
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredFaculty.length === 0 && (
          <div className="faculty-empty-state">
            <i className="fas fa-chalkboard-teacher"></i>
            <p>No faculty members found</p>
          </div>
        )}
      </div>

      {/* Add Faculty Form Modal */}
      {showAddForm && (
        <div className="faculty-modal-overlay">
          <div className="faculty-modal">
            <div className="faculty-modal-header">
              <h3>Add New Faculty</h3>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <div className="faculty-modal-body">
              <div className="faculty-form-grid">
                <div className="faculty-form-group">
                  <label><i className="fas fa-user"></i> Full Name *</label>
                  <input
                    type="text"
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="faculty-form-group">
                  <label><i className="fas fa-calendar"></i> Date of Birth *</label>
                  <input
                    type="date"
                    value={newFaculty.dob}
                    onChange={(e) => setNewFaculty({ ...newFaculty, dob: e.target.value })}
                  />
                </div>
                <div className="faculty-form-group faculty-grid-2">
                  <div>
                    <label>Gender *</label>
                    <select
                      value={newFaculty.gender}
                      onChange={(e) => setNewFaculty({ ...newFaculty, gender: e.target.value })}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label>Citizenship</label>
                    <input
                      type="text"
                      value={newFaculty.citizenship}
                      onChange={(e) => setNewFaculty({ ...newFaculty, citizenship: e.target.value })}
                      placeholder="Nationality"
                    />
                  </div>
                </div>

                <div className="faculty-form-group faculty-grid-2">
                  <div>
                    <label>Work Email (Auto)</label>
                    <input type="text" disabled placeholder="e.g. userId@school.com" />
                  </div>
                  <div>
                    <label>Personal Email</label>
                    <input
                      type="email"
                      value={newFaculty.personalEmail}
                      onChange={(e) => setNewFaculty({ ...newFaculty, personalEmail: e.target.value })}
                      placeholder="faculty@example.com"
                    />
                  </div>
                </div>
                <div className="faculty-form-group">
                  <label><i className="fas fa-phone"></i> Mobile Number</label>
                  <input
                    type="tel"
                    value={newFaculty.mobileNumber}
                    onChange={(e) => setNewFaculty({ ...newFaculty, mobileNumber: e.target.value })}
                    placeholder="+91..."
                  />
                </div>
                <div className="faculty-form-group">
                  <label><i className="fas fa-building"></i> Department</label>
                  <select
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div className="faculty-form-group">
                  <label><i className="fas fa-id-badge"></i> Designation</label>
                  <select
                    value={newFaculty.designation}
                    onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="faculty-modal-footer">
              <button className="cancel-faculty-btn" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button className="save-faculty-btn" onClick={handleAddFaculty}>
                Save Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <EditFacultyForm
        faculty={selectedFaculty}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleUpdateFaculty}
      />

      {/* Profile View */}
      <FacultyProfile
        faculty={selectedFaculty}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onUpload={handleBulkUpload}
        role="Faculty"
      />
    </div>
  );
};

export default FacultyManagement;