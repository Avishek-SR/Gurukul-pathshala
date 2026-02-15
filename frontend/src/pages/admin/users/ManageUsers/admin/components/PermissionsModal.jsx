import React, { useState, useEffect } from 'react';

const PermissionsModal = ({ isOpen, onClose, admin, onSave }) => {
    const [permissions, setPermissions] = useState(new Set());
    const [loading, setLoading] = useState(false);

    const AVAILABLE_PERMISSIONS = [
        { key: 'MANAGE_STUDENTS', label: 'Manage Students' },
        { key: 'MANAGE_FACULTY', label: 'Manage Faculty' },
        { key: 'MANAGE_ADMINS', label: 'Manage Admins' },
        { key: 'BULK_UPLOAD', label: 'Bulk Upload' },
        { key: 'DELETE_USERS', label: 'Delete Users' }
    ];

    useEffect(() => {
        if (admin && admin.permissions) {
            setPermissions(new Set(admin.permissions));
        } else {
            setPermissions(new Set());
        }
    }, [admin]);

    const togglePermission = (key) => {
        const newPermissions = new Set(permissions);
        if (newPermissions.has(key)) {
            newPermissions.delete(key);
        } else {
            newPermissions.add(key);
        }
        setPermissions(newPermissions);
    };

    const handleSave = async () => {
        setLoading(true);
        await onSave(admin.id, Array.from(permissions));
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Manage Permissions for {admin?.name}</h3>
                    <button onClick={onClose}>&times;</button>
                </div>

                <div className="permissions-list">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                        <div key={perm.key} className="permission-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={permissions.has(perm.key)}
                                    onChange={() => togglePermission(perm.key)}
                                    disabled={admin?.superAdmin} // Super Admin has all permissions by default/logic
                                />
                                {perm.label}
                            </label>
                        </div>
                    ))}
                </div>

                {admin?.superAdmin && (
                    <p className="super-admin-note">
                        <i className="fas fa-info-circle"></i> Super Admins automatically have all permissions.
                    </p>
                )}

                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={handleSave} className="save-btn" disabled={loading || admin?.superAdmin}>
                        {loading ? 'Saving...' : 'Save Permissions'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionsModal;
