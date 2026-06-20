import api from './api';

const getAllCourses = async () => {
    const response = await api.get('/admin/courses');
    return response.data;
};

const createCourse = async (courseData) => {
    const response = await api.post('/admin/courses', courseData);
    return response.data;
};

const updateCourse = async (id, courseData) => {
    const response = await api.put(`/admin/courses/${id}`, courseData);
    return response.data;
};

const deleteCourse = async (id) => {
    await api.delete(`/admin/courses/${id}`);
};

const assignStudents = async (id) => {
    // The backend returns a plain string
    const response = await api.post(`/admin/courses/${id}/assign-students`);
    return response.data;
};

const courseService = {
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    assignStudents
};

export default courseService;
