import React, { useState, useEffect } from 'react';
import './student/StudentManagement.css'; // Keep reusing base styles if needed, but load specific CSS after
import './AllUsersManagement.css';
import api, { getImageUrl } from '../../../../services/api';

const AllUsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await api.get('/admin/users').then(r => r.data);
                setUsers(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'ADMIN': return 'badge badge-admin'; // Ensure CSS exists or use inline style
            case 'STUDENT': return 'badge badge-student'; // Assuming reusable css has these or generic
            case 'FACULTY': return 'badge badge-faculty';
            default: return 'badge';
        }
    };

    // Inline simplified badge styles just in case
    const badgeStyle = (role) => {
        let bg = '#e2e8f0';
        let color = '#2d3748';
        if (role === 'ADMIN') { bg = '#fed7d7'; color = '#c53030'; }
        if (role === 'STUDENT') { bg = '#c6f6d5'; color = '#2f855a'; }
        if (role === 'FACULTY') { bg = '#bee3f8'; color = '#2b6cb0'; }
        return { backgroundColor: bg, color: color, padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' };
    };

    const handleExport = async () => {
        try {
            const endpoint = roleFilter !== 'ALL'
                ? `/admin/export/users?role=${roleFilter}`
                : '/admin/export/users';

            const response = await api.get(endpoint, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = (roleFilter !== 'ALL' ? roleFilter.toLowerCase() : 'all') + '_users.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed');
        }
    };

    if (loading) return <div className="p-4">Loading users...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="student-management-container"> {/* Reusing container style */}
            <div className="header-actions">
                <h1>All Users Management</h1>
                <div className="search-filter-container" style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search by Name, Email, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="filter-select"
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="ALL">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="STUDENT">Student</option>
                        <option value="FACULTY">Faculty</option>
                    </select>
                    <button
                        className="filter-select" // Reusing class for basic styling or add inline
                        onClick={handleExport}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#e67e22',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                        title="Download All Users Excel"
                    >
                        <i className="fas fa-file-excel"></i> Export All
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.userId}</td>
                                <td>
                                    <div className="student-name">
                                        {user.profilePictureUrl ? (
                                            <img src={getImageUrl(user.profilePictureUrl)} alt="" className="avatar-small" />
                                        ) : (
                                            <div className="avatar-placeholder-small">{user.name.charAt(0)}</div>
                                        )}
                                        {user.name}
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span style={badgeStyle(user.role)}>{user.role}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                                        {user.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllUsersManagement;
