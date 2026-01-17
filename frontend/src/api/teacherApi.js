// src/api/teacherApi.js
import axiosInstance from './axiosConfig';

export const teacherApi = {
  // Get all teachers
  getAllTeachers: async () => {
    const response = await axiosInstance.get('/teachers');
    return response.data;
  },

  // Get teacher by ID
  getTeacherById: async (teacherId) => {
    const response = await axiosInstance.get(`/teachers/${teacherId}`);
    return response.data;
  },

  // Get teacher's classes
  getTeacherClasses: async (teacherId) => {
    const response = await axiosInstance.get(`/teachers/${teacherId}/classes`);
    return response.data;
  },

  // Mark attendance for class
  markAttendance: async (classId, attendanceData) => {
    const response = await axiosInstance.post(
      `/teachers/classes/${classId}/attendance`,
      attendanceData
    );
    return response.data;
  },

  // Upload grades
  uploadGrades: async (classId, gradesData) => {
    const response = await axiosInstance.post(
      `/teachers/classes/${classId}/grades`,
      gradesData
    );
    return response.data;
  },

  // Get teacher's schedule
  getTeacherSchedule: async (teacherId, params = {}) => {
    const response = await axiosInstance.get(
      `/teachers/${teacherId}/schedule`,
      { params }
    );
    return response.data;
  }
};