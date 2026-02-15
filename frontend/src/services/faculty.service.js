const API_URL = '/api/faculty';

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const getDashboardStats = async () => {
    const response = await fetch(`${API_URL}/dashboard`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
};

const getProfile = async () => {
    const response = await fetch(`${API_URL}/profile`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
};

const updateProfile = async (data) => {
    const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
};

const getCourses = async () => {
    const response = await fetch(`${API_URL}/courses`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
};

// Keep these for now to avoid breaking existing code
const getRecentCourses = async () => {
    const response = await fetch(`${API_URL}/courses`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch recent courses');
    const data = await response.json();
    return { courses: data };
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
