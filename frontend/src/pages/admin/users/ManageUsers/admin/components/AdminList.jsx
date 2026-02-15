import React from 'react';

const AdminList = ({ admins, loading, onStatusChange, onEdit, onDelete, onResetPassword, currentUser, onManagePermissions, canEdit, canDelete }) => {
    if (loading) return <div className="p-4">Loading admins...</div>;

    const isSuperAdmin = currentUser?.superAdmin;

    return (
        <div className="admin-table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>DOB</th>
                        <th>Gender</th>
                        <th>Work Email</th>
                        <th>Personal Email</th>
                        <th>Mobile</th>
                        <th>Citizenship</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {admins.map(admin => (
                        <tr key={admin.id}>
                            <td>{admin.userId}</td>
                            <td>
                                <div className="user-cell">
                                    <div className="user-avatar-small">
                                        {admin.name.charAt(0)}
                                    </div>
                                    <div>
                                        {admin.name}
                                        {admin.superAdmin && (
                                            <span className="badge badge-warning ml-2" style={{ fontSize: '0.7em', background: '#f39c12', color: 'white', padding: '2px 5px', borderRadius: '4px', marginLeft: '5px' }}>
                                                SUPER ADMIN
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td>{admin.dob || 'N/A'}</td>
                            <td>{admin.gender || 'N/A'}</td>
                            <td>{admin.email}</td>
                            <td>{admin.personalEmail || 'N/A'}</td>
                            <td>{admin.mobileNumber || 'N/A'}</td>
                            <td>{admin.citizenship || 'N/A'}</td>
                            <td>
                                <span className={`status-badge ${admin.active ? 'active' : 'inactive'}`}>
                                    {admin.active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    {canEdit && (
                                        <>
                                            {!admin.superAdmin && (
                                                <button
                                                    className={`status-toggle-btn ${admin.active ? 'deactivate' : 'activate'}`}
                                                    onClick={() => onStatusChange(admin.id, admin.active)}
                                                    title={admin.active ? 'Deactivate' : 'Activate'}
                                                    disabled={!isSuperAdmin && admin.superAdmin} // Prevent deactivating Super Admin unless you are one? Actually Super Admin usually can't be deactivated.
                                                >
                                                    <i className={`fas fa-${admin.active ? 'user-slash' : 'user-check'}`}></i>
                                                </button>
                                            )}
                                            <button className="edit-btn" onClick={() => onEdit(admin)} title="Edit">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </>
                                    )}

                                    {isSuperAdmin && !admin.superAdmin && (
                                        <button
                                            className="permission-btn"
                                            onClick={() => onManagePermissions(admin)}
                                            title="Manage Permissions"
                                        >
                                            <i className="fas fa-user-lock"></i>
                                        </button>
                                    )}

                                    {canEdit && (
                                        <button
                                            className="reset-password-btn"
                                            onClick={() => onResetPassword(admin.id)}
                                            title="Reset Password"
                                        >
                                            <i className="fas fa-key"></i>
                                        </button>
                                    )}

                                    {canDelete && (
                                        <button
                                            className="delete-btn"
                                            onClick={() => onDelete(admin.id)}
                                            title="Delete"
                                            disabled={admin.superAdmin} // Cannot delete Super Admin
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {admins.length === 0 && (
                        <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                                No admins found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminList;
