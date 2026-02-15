import React, { useEffect, useState } from 'react';
import courseService from '../../../services/course.service';
import { apiGet } from '../../../services/api';
import './CourseManagement.css';
import { toast } from 'react-hot-toast';

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(null); // Course ID being assigned student
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  /* New State for Class Navigation */
  const [selectedClass, setSelectedClass] = useState(null);

  // Faculty Assignment Modal State
  const [courseToAssignFaculty, setCourseToAssignFaculty] = useState(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');

  const [form, setForm] = useState({
    title: '',
    code: '',
    description: '',
    program: '',
    section: '', // Changed from year to section
    facultyId: '' // For selecting faculty
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, facultyData] = await Promise.all([
        courseService.getAllCourses(),
        apiGet('/admin/users/role/FACULTY')
      ]);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setFaculties(Array.isArray(facultyData) ? facultyData : []);
    } catch (e) {
      toast.error('Failed to load data');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.title || !form.code) {
      toast.error('Title and Code are required');
      return;
    }

    // Default program to selectedClass if available
    const programToUse = selectedClass || form.program;
    if (!programToUse) {
      toast.error('Class selection is required');
      return;
    }

    const payload = {
      title: form.title,
      code: form.code,
      description: form.description,
      program: programToUse,
      section: form.section, // Changed from year to section
      faculty: form.facultyId ? { userId: form.facultyId } : null
    };

    console.log('Submitting Course Payload:', payload);

    try {
      if (isEditing) {
        await courseService.updateCourse(editId, payload);
        toast.success('Course updated successfully');
      } else {
        await courseService.createCourse(payload);
        toast.success('Course created successfully');
      }

      setForm({ title: '', code: '', description: '', program: '', section: '', facultyId: '' });
      setIsEditing(false);
      setEditId(null);
      loadData();
    } catch (e) {
      console.error('Course Save Error:', e);
      // improved error messaging
      const message = e.response?.data?.message || e.message;
      if (message && message.includes('already exists')) {
        toast.error('Course Code already exists! Please use a unique code.');
      } else {
        toast.error(isEditing ? 'Failed to update course' : 'Failed to create course');
      }
    }
  };

  const handleEdit = (course) => {
    setForm({
      title: course.title || course.name,
      code: course.code,
      description: course.description || '',
      program: course.program,
      section: course.section || '', // Changed from year to section
      facultyId: course.faculty ? course.faculty.userId : ''
    });
    setIsEditing(true);
    setEditId(course.id);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setForm({ title: '', code: '', description: '', program: '', section: '', facultyId: '' });
    setIsEditing(false);
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseService.deleteCourse(id);
      toast.success('Course deleted');
      loadData();
    } catch (e) {
      toast.error('Failed to delete course');
    }
  };

  const handleAssignInBulk = async (course) => {
    const confirmMessage = `Enroll all students of Class ${course.program} ${course.section ? 'Section ' + course.section : ''} into this course?`;
    if (!window.confirm(confirmMessage)) return;

    setAssigning(course.id);
    try {
      await courseService.assignStudents(course.id);
      toast.success('Students enrolled successfully');
    } catch (e) {
      toast.error('Failed to assign students');
    } finally {
      setAssigning(null);
    }
  };

  const openFacultyAssignModal = (course) => {
    setCourseToAssignFaculty(course);
    setSelectedFacultyId(course.faculty ? course.faculty.userId : '');
  };

  const saveFacultyAssignment = async () => {
    if (!courseToAssignFaculty) return;

    try {
      const payload = {
        ...courseToAssignFaculty,
        faculty: selectedFacultyId ? { userId: selectedFacultyId } : null
      };

      // We reuse the update endpoint
      await courseService.updateCourse(courseToAssignFaculty.id, payload);
      toast.success(`Faculty assigned to ${courseToAssignFaculty.title}`);
      setCourseToAssignFaculty(null);
      loadData();
    } catch (e) {
      toast.error('Failed to assign faculty');
      console.error(e);
    }
  };

  // Function to filter courses by selected class
  const getFilteredCourses = () => {
    if (!selectedClass) return [];
    return courses.filter(c => c.program === selectedClass);
  };

  // Render Class Selection Grid
  if (!selectedClass) {
    return (
      <div className="course-page">
        <div className="course-header">
          <h1>Course Management</h1>
          <p>Select a class to manage its courses.</p>
        </div>
        <div className="class-grid-container">
          {CLASSES.map((cls) => (
            <div key={cls} className="class-card-item" onClick={() => setSelectedClass(cls)}>
              <div className="class-card-icon">📚</div>
              <h3>{cls}</h3>
              <p>{courses.filter(c => c.program === cls).length} Courses</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render Course Manager for Selected Class
  return (
    <div className="course-page">
      <div className="course-header">
        <button className="back-btn" onClick={() => setSelectedClass(null)}>
          ← Back to Classes
        </button>
        <h1>Manage Courses: {selectedClass}</h1>
      </div>

      <div className="course-card">
        <div className="course-form-container">
          <h3>{isEditing ? 'Edit Course' : `Add New Course for ${selectedClass}`}</h3>
          <div className="course-form">
            <input
              type="text"
              placeholder="Course Title (e.g. Science)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Course Code (e.g. SCI-5)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />

            {/* hidden program input, fixed to selectedClass */}

            <select
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
            >
              <option value="">All Sections</option>
              {SECTIONS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>

            <select
              value={form.facultyId}
              onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
            >
              <option value="">Assign Faculty (Optional)</option>
              {faculties.map(fac => (
                <option key={fac.userId} value={fac.userId}>
                  {fac.name} ({fac.userId})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="full-width"
            />

            <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSubmit} className="btn-primary">
                {isEditing ? 'Update Course' : 'Add Course'}
              </button>
              {isEditing && (
                <button onClick={handleCancelEdit} className="btn-secondary" style={{ background: '#6c757d', color: 'white' }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {loading && <div className="loading-spinner">Loading...</div>}

        {!loading && getFilteredCourses().length === 0 && (
          <div className="empty-state">No courses found for {selectedClass}. Add one above!</div>
        )}

        {!loading && getFilteredCourses().length > 0 && (
          <div className="table-responsive">
            <table className="course-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Section</th>
                  <th>Faculty</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredCourses().map((c) => (
                  <tr key={c.id}>
                    <td><span className="badge-code">{c.code}</span></td>
                    <td>{c.title || c.name}</td>
                    <td>{c.section || 'All'}</td>
                    <td>
                      {c.faculty ? (
                        <span className="faculty-badge">
                          <i className="fas fa-chalkboard-teacher"></i> {c.faculty.name}
                        </span>
                      ) : <span className="text-muted">-</span>}
                    </td>
                    <td>{c.description}</td>
                    <td className="actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(c)}
                        title="Edit Course"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => openFacultyAssignModal(c)}
                        title="Assign Faculty"
                      >
                        <i className="fas fa-user-edit"></i>
                      </button>
                      <button
                        className="btn-assign"
                        onClick={() => handleAssignInBulk(c)}
                        disabled={assigning === c.id}
                        title="Enroll all students of this class"
                      >
                        {assigning === c.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-users-cog"></i>} Enroll Class
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(c.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Faculty Modal */}
      {courseToAssignFaculty && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Assign Faculty to {courseToAssignFaculty.title}</h3>
            <div className="form-group">
              <label>Select Faculty:</label>
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="form-control"
              >
                <option value="">-- No Faculty --</option>
                {faculties.map(fac => (
                  <option key={fac.userId} value={fac.userId}>
                    {fac.name} ({fac.userId})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setCourseToAssignFaculty(null)} className="btn-cancel">Cancel</button>
              <button onClick={saveFacultyAssignment} className="btn-primary">Save Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
