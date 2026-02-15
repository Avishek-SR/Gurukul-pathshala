import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Users,
  FileText,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Search,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import './FacultyCourses.css';

// API service
const facultyCoursesAPI = {
  getCourses: async () => {
    // configured axios instance already has baseURL (likely /api)
    // if baseURL is http://localhost:8080/api, then we just need /faculty/courses
    const response = await axios.get('/faculty/courses');
    return response.data;
  },

  getCourseById: async (courseId) => {
    const response = await axios.get(`/api/faculty/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await axios.post('/api/faculty/courses', courseData);
    return response.data;
  },

  updateCourse: async (courseId, courseData) => {
    const response = await axios.put(`/api/faculty/courses/${courseId}`, courseData);
    return response.data;
  },

  deleteCourse: async (courseId) => {
    const response = await axios.delete(`/api/faculty/courses/${courseId}`);
    return response.data;
  },

  getCourseAnalytics: async (courseId) => {
    const response = await axios.get(`/api/faculty/courses/${courseId}/analytics`);
    return response.data;
  }
};

const FacultyCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const queryClient = useQueryClient();

  // Form state for create/edit
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    description: '',
    semester: 'spring_2024',
    credits: 3,
    maxStudents: 50,
    department: ''
  });

  // Fetch courses with React Query
  const {
    data: coursesData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['facultyCourses'],
    queryFn: facultyCoursesAPI.getCourses,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: facultyCoursesAPI.createCourse,
    onSuccess: () => {
      toast.success('Course created successfully!');
      queryClient.invalidateQueries(['facultyCourses']);
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create course');
    }
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => facultyCoursesAPI.updateCourse(id, data),
    onSuccess: () => {
      toast.success('Course updated successfully!');
      queryClient.invalidateQueries(['facultyCourses']);
      setShowEditModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update course');
    }
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: facultyCoursesAPI.deleteCourse,
    onSuccess: () => {
      toast.success('Course deleted successfully!');
      queryClient.invalidateQueries(['facultyCourses']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  });

  // Reset form
  const resetForm = () => {
    setCourseForm({
      code: '',
      name: '',
      description: '',
      semester: 'spring_2024',
      credits: 3,
      maxStudents: 50,
      department: ''
    });
    setSelectedCourse(null);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create course
  const handleCreateCourse = (e) => {
    e.preventDefault();
    createMutation.mutate(courseForm);
  };

  // Handle edit course
  const handleEditCourse = (e) => {
    e.preventDefault();
    if (selectedCourse) {
      updateMutation.mutate({
        id: selectedCourse.id,
        data: courseForm
      });
    }
  };

  // Handle delete course
  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(courseId);
    }
  };

  // Open edit modal
  const openEditModal = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      code: course.code,
      name: course.name,
      description: course.description,
      semester: course.semester,
      credits: course.credits,
      maxStudents: course.maxStudents,
      department: course.department
    });
    setShowEditModal(true);
  };

  // Filter courses based on search and filters
  const filteredCourses = coursesData?.courses?.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || course.semester === selectedSemester;
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;

    return matchesSearch && matchesSemester && matchesStatus;
  }) || [];

  // Calculate statistics
  const stats = {
    totalCourses: coursesData?.courses?.length || 0,
    activeStudents: coursesData?.courses?.reduce((sum, course) => sum + course.enrolledStudents, 0) || 0,
    totalAssignments: coursesData?.courses?.reduce((sum, course) => sum + course.assignmentsCount, 0) || 0,
    averageAttendance: coursesData?.averageAttendance || 0
  };

  // Semester options
  const semesters = [
    { value: 'all', label: 'All Semesters' },
    { value: 'spring_2024', label: 'Spring 2024' },
    { value: 'fall_2023', label: 'Fall 2023' },
    { value: 'summer_2023', label: 'Summer 2023' }
  ];

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' }
  ];

  if (isLoading) {
    return (
      <div className="faculty-courses-loading">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading courses...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="faculty-courses-error">
        <AlertCircle size={48} />
        <h3>Failed to load courses</h3>
        <p>{error.message}</p>
        <button onClick={() => refetch()} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="faculty-courses-container">
      {/* Header with Stats */}
      <div className="courses-header">
        <div>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Manage and monitor your courses</p>
        </div>

      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100">
            <BookOpen className="text-blue-600" size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Courses</p>
            <h3 className="stat-value">{stats.totalCourses}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green-100">
            <Users className="text-green-600" size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Students</p>
            <h3 className="stat-value">{stats.activeStudents}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-purple-100">
            <FileText className="text-purple-600" size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Assignments</p>
            <h3 className="stat-value">{stats.totalAssignments}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-yellow-100">
            <Calendar className="text-yellow-600" size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Avg. Attendance</p>
            <h3 className="stat-value">{stats.averageAttendance}%</h3>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search courses by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="filter-select"
            >
              {semesters.map(semester => (
                <option key={semester.value} value={semester.value}>
                  {semester.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <BookOpen size={48} />
            <h3>No courses found</h3>
            <p>Try adjusting your search or create a new course</p>
          </div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-card-header">
                <div className="course-code">{course.code}</div>
                <span className={`course-status ${course.status}`}>
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </span>
              </div>

              <h3 className="course-title">{course.name}</h3>
              <p className="course-description">{course.description}</p>

              <div className="course-meta">
                <div className="meta-item">
                  <Users size={16} />
                  <span>{course.enrolledStudents}/{course.maxStudents} students</span>
                </div>
                <div className="meta-item">
                  <FileText size={16} />
                  <span>{course.assignmentsCount} assignments</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{course.semester.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="course-card-footer">
                <button
                  className="view-details-btn"
                  onClick={() => window.location.href = `/faculty/courses/${course.id}`}
                >
                  View Details
                  <ChevronRight size={16} />
                </button>

                <div className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(course)}
                    title="Edit course"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteCourse(course.id)}
                    title="Delete course"
                    disabled={deleteMutation.isLoading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Create New Course</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="modal-close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCourse}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Course Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={courseForm.code}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., CS101"
                    />
                  </div>

                  <div className="form-group">
                    <label>Course Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={courseForm.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Introduction to Programming"
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={courseForm.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Course description..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Semester *</label>
                    <select
                      name="semester"
                      value={courseForm.semester}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="spring_2024">Spring 2024</option>
                      <option value="fall_2023">Fall 2023</option>
                      <option value="summer_2023">Summer 2023</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Credits *</label>
                    <input
                      type="number"
                      name="credits"
                      value={courseForm.credits}
                      onChange={handleInputChange}
                      min="1"
                      max="6"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Students *</label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={courseForm.maxStudents}
                      onChange={handleInputChange}
                      min="1"
                      max="200"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={courseForm.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="submit-btn"
                >
                  {createMutation.isLoading ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Edit Course: {selectedCourse.code}</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="modal-close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditCourse}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Course Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={courseForm.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Course Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={courseForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={courseForm.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Semester *</label>
                    <select
                      name="semester"
                      value={courseForm.semester}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="spring_2024">Spring 2024</option>
                      <option value="fall_2023">Fall 2023</option>
                      <option value="summer_2023">Summer 2023</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Credits *</label>
                    <input
                      type="number"
                      name="credits"
                      value={courseForm.credits}
                      onChange={handleInputChange}
                      min="1"
                      max="6"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Students *</label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={courseForm.maxStudents}
                      onChange={handleInputChange}
                      min="1"
                      max="200"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={courseForm.department}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isLoading}
                  className="submit-btn"
                >
                  {updateMutation.isLoading ? 'Updating...' : 'Update Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyCourses;