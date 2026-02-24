import React, { useState, useEffect } from 'react';
import { noticeAPI } from '../../../services/api';
import './NoticeManagement.css';

const NoticeManagement = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newNotice, setNewNotice] = useState({
        title: '',
        content: '',
        type: 'event', // event, holiday, admission, exam
        priority: 0,
        publishDate: new Date().toISOString().split('T')[0],
        expiryDate: ''
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const data = await noticeAPI.getAll();
            setNotices(data);
        } catch (error) {
            console.error("Failed to fetch notices", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this notice?")) {
            try {
                await noticeAPI.delete(id);
                setNotices(notices.filter(n => n.id !== id));
            } catch (error) {
                console.error("Failed to delete notice", error);
            }
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const savedNotice = await noticeAPI.create(newNotice);
            setNotices([savedNotice, ...notices]);
            setShowModal(false);
            setNewNotice({
                title: '',
                content: '',
                type: 'event',
                priority: 0,
                publishDate: new Date().toISOString().split('T')[0],
                expiryDate: ''
            });
        } catch (error) {
            console.error("Failed to create notice", error);
        }
    };

    const toggleActive = async (notice) => {
        try {
            const updated = { ...notice, active: !notice.active };
            await noticeAPI.update(notice.id, updated);
            setNotices(notices.map(n => n.id === notice.id ? updated : n));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    return (
        <div className="notice-management">
            <div className="page-header">
                <h2>Notice Board Management</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus"></i> Add New Notice
                </button>
            </div>

            {loading ? (
                <div className="spinner">Loading...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Publish Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notices.map(notice => (
                                <tr key={notice.id}>
                                    <td>
                                        <div className="notice-title-cell">
                                            <strong>{notice.title}</strong>
                                            <small>{notice.content.substring(0, 50)}...</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${notice.type}`}>
                                            {notice.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{notice.publishDate}</td>
                                    <td>
                                        <button
                                            className={`status-toggle ${notice.active ? 'active' : 'inactive'}`}
                                            onClick={() => toggleActive(notice)}
                                        >
                                            {notice.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>
                                        <button className="btn-icon delete" onClick={() => handleDelete(notice.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {notices.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center">No notices found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create New Notice</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form id="noticeForm" onSubmit={handleCreate}>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newNotice.title}
                                        onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            value={newNotice.type}
                                            onChange={e => setNewNotice({ ...newNotice, type: e.target.value })}
                                        >
                                            <option value="event">Event</option>
                                            <option value="holiday">Holiday</option>
                                            <option value="admission">Admission</option>
                                            <option value="exam">Exam</option>
                                            <option value="general">General</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <input
                                            type="number"
                                            value={newNotice.priority}
                                            onChange={e => setNewNotice({ ...newNotice, priority: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Content</label>
                                    <textarea
                                        rows="4"
                                        value={newNotice.content}
                                        onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Publish Date</label>
                                        <input
                                            type="date"
                                            value={newNotice.publishDate}
                                            onChange={e => setNewNotice({ ...newNotice, publishDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Expiry Date</label>
                                        <input
                                            type="date"
                                            value={newNotice.expiryDate}
                                            onChange={e => setNewNotice({ ...newNotice, expiryDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" form="noticeForm" className="btn-primary">Create Notice</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeManagement;
