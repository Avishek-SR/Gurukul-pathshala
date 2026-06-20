import React, { useState, useEffect } from 'react';

import './StudentManagement.css';

// Components
import StudentStats from './components/StudentStats';
import StudentFilterPanel from './components/StudentFilterPanel';
import StudentSearchBar from './components/StudentSearchBar';
import StudentList from './components/StudentList';
import AddStudentForm from './components/AddStudentForm';
import EditStudentForm from './components/EditStudentForm';
import StudentProfile from './components/StudentProfile';
import FaceRegistrationModal from './components/FaceRegistrationModal';
import BulkUploadModal from '../../../../../components/BulkUploadModal';
import api from '../../../../../services/api';

const StudentManagement = ({ currentUser }) => {
  // Data State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ program: '', year: '', status: '' });

  // Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showFaceReg, setShowFaceReg] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Permissions
  const canManage = currentUser?.superAdmin || currentUser?.permissions?.includes('MANAGE_STUDENTS');
  const canBulkUpload = currentUser?.superAdmin || currentUser?.permissions?.includes('BULK_UPLOAD');
  const canDelete = currentUser?.superAdmin || currentUser?.permissions?.includes('DELETE_USERS');


  // Fetch Students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/users/role/STUDENT').then(r => r.data);
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchStudents();
  }, []);

  // Helper Functions
  const openEditModal = (student) => {
    setSelectedStudent(student);
    setShowEditForm(true);
  };

  const openProfile = (student) => {
    setSelectedStudent(student);
    setShowProfile(true);
  };

  const openFaceRegModal = (student) => {
    setSelectedStudent(student);
    setShowFaceReg(true);
  };

  // Filter & Pagination Logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.userId?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesProgram = filters.program ? student.program === filters.program : true;
    // Handle potential mismatch between year/section in state vs usage
    const sectionFilter = filters.section || filters.year;
    const matchesSection = sectionFilter ? student.section === sectionFilter : true;

    const matchesStatus = filters.status ? (filters.status === 'Active' ? student.active : !student.active) : true;

    return matchesSearch && matchesProgram && matchesSection && matchesStatus;
  });

  // Handlers
  const handleAddStudent = async (studentData) => {
    try {
      await api.post('/admin/users', { ...studentData, role: 'STUDENT' });
      fetchStudents();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleUpdateStudent = async (updatedStudent) => {
    try {
      const payload = {
        name: updatedStudent.name,
        dob: updatedStudent.dob,
        gender: updatedStudent.gender,
        program: updatedStudent.program,
        section: updatedStudent.section,
        parentEmail: updatedStudent.parentEmail,
        parentPhoneNumber: updatedStudent.parentPhoneNumber
      };

      const token = sessionStorage.getItem('token');
      await api.put(`/admin/users/${updatedStudent.id}`, payload);
      setShowEditForm(false);
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      alert(`Error updating student: ${error.message}`);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const token = sessionStorage.getItem('token');
        await api.delete(`/admin/users/${studentId}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleStatusChange = async (studentId, currentStatus) => {
    try {
      const token = sessionStorage.getItem('token');
      await api.put(`/admin/users/${studentId}/status?active=${!currentStatus}`);
      fetchStudents();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleResetPassword = async (studentId) => {
    if (window.confirm('Are you sure you want to reset the password to default (FirstName@ddMM)?')) {
      try {
        await api.put(`/admin/users/${studentId}/reset-password`);
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
    formData.append('role', 'STUDENT');

    await api.post('/admin/users/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    fetchStudents();
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export/users?role=STUDENT', { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed');
    }
  };

  return (
    <div className="student-management-container">
      {/* Header */}
      <div className="student-mgmt-header">
        <h2><i className="fas fa-graduation-cap"></i> Student Management</h2>
        <div className="student-actions">
          {/* Search Bar */}
          <StudentSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          {canManage && (
            <button
              className="add-student-btn"
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus"></i> Add Student
            </button>
          )}

          {canBulkUpload && (
            <button
              className="add-student-btn"
              onClick={() => setShowBulkUpload(true)}
              style={{ background: '#27ae60' }}
            >
              <i className="fas fa-file-upload"></i> Bulk Upload
            </button>
          )}

          <button
            className="add-student-btn"
            onClick={handleExport}
            style={{ background: '#e67e22' }}
            title="Download Excel Report"
          >
            <i className="fas fa-file-excel"></i> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <StudentStats students={students} />

      <hr style={{ margin: '25px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />

      {/* Filters */}
      <StudentFilterPanel filters={filters} setFilters={setFilters} />

      {/* Filtered Count */}
      {(searchTerm || filters.program || filters.section || filters.status) && (
        <div style={{ margin: '15px 0 10px', color: '#555', fontSize: '0.95rem', fontWeight: '500' }}>
          Found <span style={{ color: '#2c3e50', fontWeight: '700' }}>{filteredStudents.length}</span> matches from <span style={{ color: '#7f8c8d' }}>{students.length}</span> total students
        </div>
      )}

      {/* Table */}
      <StudentList
        students={filteredStudents}
        loading={loading}
        onStatusChange={handleStatusChange}
        onEdit={openEditModal}
        onDelete={handleDeleteStudent}
        onView={openProfile}
        onResetPassword={handleResetPassword}
        onFaceReg={openFaceRegModal}
        canEdit={canManage}
        canDelete={canDelete}
      />

      {/* Modals */}
      <AddStudentForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSave={handleAddStudent}
      />

      <EditStudentForm
        student={selectedStudent}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleUpdateStudent}
      />

      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onUpload={handleBulkUpload}
        role="Student"
      />
      <StudentProfile
        student={selectedStudent}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {showFaceReg && (
        <FaceRegistrationModal
          student={selectedStudent}
          onClose={() => setShowFaceReg(false)}
          onComplete={fetchStudents}
        />
      )}
    </div>
  );
};

export default StudentManagement;