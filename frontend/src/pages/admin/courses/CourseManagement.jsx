import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '../../../services/api';
import './CourseManagement.css';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', code: '', description: '' });

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet('/admin/courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.code) {
      setError('Title and Code are required');
      return;
    }
    try {
      await apiPost('/admin/courses', form);
      setForm({ title: '', code: '', description: '' });
      loadCourses();
    } catch (e) {
      setError('Failed to create course');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDelete(`/admin/courses/${id}`);
      loadCourses();
    } catch (e) {
      setError('Failed to delete course');
    }
  };

  return (
    <div className="course-page">
      <div className="course-header">
        <h1>Courses</h1>
        <p>Create and manage academic courses</p>
      </div>

      <div className="course-card">
        <div className="course-form">
          <input
            type="text"
            placeholder="Course Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Course Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button onClick={handleCreate}>Add Course</button>
        </div>

        {loading && <p className="muted">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && courses.length === 0 && (
          <p className="muted">No courses available.</p>
        )}

        {!loading && !error && courses.length > 0 && (
          <table className="course-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.title}</td>
                  <td>{c.description}</td>
                  <td>
                    <button className="danger" onClick={() => handleDelete(c.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
