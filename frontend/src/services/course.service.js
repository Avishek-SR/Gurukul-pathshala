const API_URL = '/api/admin/courses';

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const getAllCourses = async () => {
    const response = await fetch(API_URL, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
};

const createCourse = async (courseData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(courseData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create course');
    }
    return response.json();
};

const updateCourse = async (id, courseData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(courseData)
    });
    if (!response.ok) throw new Error('Failed to update course');
    return response.json();
};

const deleteCourse = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete course');
};

const assignStudents = async (id) => {
    const response = await fetch(`${API_URL}/${id}/assign-students`, {
        method: 'POST',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to assign students');
    // The backend returns a plain string, so we use .text() instead of .json()
    return response.text();
};

const courseService = {
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    assignStudents
};

export default courseService;
