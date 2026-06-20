import api from './api';

const getDashboardStats = async () => {
    const response = await api.get('/faculty/dashboard');
    return response.data;
};

const getProfile = async () => {
    const response = await api.get('/faculty/profile');
    return response.data;
};

const updateProfile = async (data) => {
    const response = await api.put('/faculty/profile', data);
    return response.data;
};

const getCourses = async () => {
    const response = await api.get('/faculty/courses');
    return response.data;
};

// Keep these for now to avoid breaking existing code
const getRecentCourses = async () => {
    const response = await api.get('/faculty/courses');
    return { courses: response.data };
};

const getUpcomingDeadlines = async () => {
    // Return mock data for now
    return {
        count: 0,
        deadlines: []
    };
};

const getRecentAnnouncements = async () => {
    // Return mock data for now
    return {
        announcements: []
    };
};

const facultyService = {
    getDashboardStats,
    getProfile,
    updateProfile,
    getCourses,
    getRecentCourses,
    getUpcomingDeadlines,
    getRecentAnnouncements
};

export default facultyService;
