// src/api/studentApi.js
import axiosInstance from './axiosConfig';

export const studentApi = {
  // Get all students (admin/teacher only)
  getAllStudents: async (params = {}) => {
    const response = await axiosInstance.get('/students', { params });
    return response.data;
  },

  // Get student by ID
  getStudentById: async (studentId) => {
    const response = await axiosInstance.get(`/students/${studentId}`);
    return response.data;
  },

  // Create new student
  createStudent: async (studentData) => {
    const response = await axiosInstance.post('/students', studentData);
    return response.data;
  },

  // Update student
  updateStudent: async (studentId, studentData) => {
    const response = await axiosInstance.put(`/students/${studentId}`, studentData);
    return response.data;
  },

  // Delete student
  deleteStudent: async (studentId) => {
    const response = await axiosInstance.delete(`/students/${studentId}`);
    return response.data;
  },

  // Get student's courses
  getStudentCourses: async (studentId) => {
    const response = await axiosInstance.get(`/students/${studentId}/courses`);
    return response.data;
  },

  // Get student's attendance
  getStudentAttendance: async (studentId, params = {}) => {
    const response = await axiosInstance.get(`/students/${studentId}/attendance`, { params });
    return response.data;
  },

  // Get student's grades
  getStudentGrades: async (studentId) => {
    const response = await axiosInstance.get(`/students/${studentId}/grades`);
    return response.data;
  },

  // Upload student photo
  uploadStudentPhoto: async (studentId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(
      `/students/${studentId}/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Search students
  searchStudents: async (query) => {
    const response = await axiosInstance.get('/students/search', { params: { query } });
    return response.data;
  },

  // Get student statistics
  getStudentStats: async () => {
    const response = await axiosInstance.get('/students/stats');
    return response.data;
  }
};