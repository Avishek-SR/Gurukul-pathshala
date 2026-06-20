import React, { useState, useEffect } from 'react';
import AdminList from './components/AdminList';
import AddAdminForm from './components/AddAdminForm';
import EditAdminForm from './components/EditAdminForm';
import BulkUploadModal from '../../../../../components/BulkUploadModal';
import PermissionsModal from './components/PermissionsModal';
import './AdminManagement.css';
import api from '../../../../../services/api';

const AdminManagement = ({ currentUser }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    // Permissions Modal State
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);

    // Permissions
    const canManage = currentUser?.superAdmin || currentUser?.permissions?.includes('MANAGE_ADMINS');
    const canBulkUpload = currentUser?.superAdmin || currentUser?.permissions?.includes('BULK_UPLOAD');
    const canDelete = currentUser?.superAdmin || currentUser?.permissions?.includes('DELETE_USERS');

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const data = await api.get('/admin/users/role/ADMIN').then(r => r.data);
            setAdmins(data);
        } catch (error) {
            console.error('Error fetching admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleDeleteAdmin = async (adminId) => {
        if (window.confirm('Are you sure you want to delete this admin?')) {
            try {
                await api.delete(`/admin/users/${adminId}`);
                fetchAdmins();
            } catch (error) {
                console.error('Error deleting admin:', error);
                alert('Failed to delete admin');
            }
        }
    };

    const handleAddAdmin = async (adminData) => {
        try {
            await api.post('/admin/users', { ...adminData, role: 'ADMIN' });
            fetchAdmins();
            setShowAddForm(false);
        } catch (error) {
            console.error('Error adding admin:', error);
            alert('Failed to add admin');
        }
    };

    const handleStatusChange = async (adminId, currentStatus) => {
        try {
            await api.put(`/admin/users/${adminId}/status?active=${!currentStatus}`);
            fetchAdmins();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }


    const handleBulkUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('role', 'ADMIN');

        try {
            await api.post('/admin/users/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchAdmins();
        } catch (error) {
            console.error('Upload failed', error);
            throw new Error('Upload failed');
        }
    };

    const handleResetPassword = async (adminId) => {
        if (window.confirm('Are you sure you want to reset the password to default (FirstName@ddMM)?')) {
            try {
                await api.put(`/admin/users/${adminId}/reset-password`);
                alert('Password reset successfully');
            } catch (error) {
                console.error('Error resetting password:', error);
                alert('Failed to reset password');
            }
        }
    };

    const handleEditAdmin = (admin) => {
        setSelectedAdmin(admin);
        setShowEditForm(true);
    };

    const handleManagePermissions = (admin) => {
        setSelectedAdmin(admin);
        setShowPermissionsModal(true);
    };

    const handleSavePermissions = async (adminId, permissions) => {
        try {
            await api.put(`/admin/users/${adminId}/permissions`, permissions);
            fetchAdmins(); // Refresh list to see updates
            alert('Permissions updated successfully');
        } catch (error) {
            console.error('Error updating permissions:', error);
            alert('Error updating permissions');
        }
    };

    const handleUpdateAdmin = async (updatedData) => {
        try {
            await api.put(`/admin/users/${updatedData.id}`, updatedData);
            fetchAdmins();
            setShowEditForm(false);
        } catch (error) {
            console.error('Error updating admin:', error);
            alert('Failed to update admin');
        }
    };


    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = async () => {
        try {
            const response = await api.get('/admin/export/users?role=ADMIN', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'admin_users.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed');
        }
    };



    return (
        <div className="admin-management-container">
            <div className="admin-page-header">
                <h2><i className="fas fa-user-shield"></i> Admin Management</h2>
                <div className="header-actions">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search admins..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {canManage && (
                        <button className="add-admin-btn" onClick={() => setShowAddForm(true)}>
                            <i className="fas fa-plus"></i> Add Admin
                        </button>
                    )}
                    {canBulkUpload && (
                        <button className="add-admin-btn bulk" onClick={() => setShowBulkUpload(true)}>
                            <i className="fas fa-file-upload"></i> Bulk Upload
                        </button>
                    )}
                    <button
                        className="add-admin-btn"
                        onClick={handleExport}
                        title="Download Excel Report"
                    >
                        <i className="fas fa-file-excel"></i> Export
                    </button>
                </div>
            </div>

            {/* Filtered Count */}
            {searchTerm && (
                <div style={{ margin: '15px 0 10px', color: '#555', fontSize: '0.95rem', fontWeight: '500' }}>
                    Found <span style={{ color: '#2c3e50', fontWeight: '700' }}>{filteredAdmins.length}</span> matches from <span style={{ color: '#7f8c8d' }}>{admins.length}</span> total admins
                </div>
            )}

            <AdminList
                admins={filteredAdmins}
                loading={loading}
                onStatusChange={handleStatusChange}
                onEdit={handleEditAdmin}
                onDelete={handleDeleteAdmin}
                onResetPassword={handleResetPassword}
                currentUser={currentUser} // Pass current user
                onManagePermissions={handleManagePermissions} // Pass handler
                canEdit={canManage}
                canDelete={canDelete}
            />

            <AddAdminForm
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                onSave={handleAddAdmin}
            />

            <EditAdminForm
                admin={selectedAdmin}
                isOpen={showEditForm}
                onClose={() => setShowEditForm(false)}
                onSave={handleUpdateAdmin}
            />

            <BulkUploadModal
                isOpen={showBulkUpload}
                onClose={() => setShowBulkUpload(false)}
                onUpload={handleBulkUpload}
                role="Admin"
            />

            <PermissionsModal
                isOpen={showPermissionsModal}
                onClose={() => setShowPermissionsModal(false)}
                admin={selectedAdmin}
                onSave={handleSavePermissions}
            />
        </div>
    );
};

export default AdminManagement;
