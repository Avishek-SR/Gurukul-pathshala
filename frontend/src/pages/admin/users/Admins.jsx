// src/pages/admin/users/Admins.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaUserPlus, FaEdit, 
  FaTrash, FaEye, FaUserShield, FaEnvelope,
  FaPhone, FaCalendarAlt, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';

const Admins = () => {
  // State for admins data
  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: 'Rajesh Sharma',
      email: 'rajesh@school.com',
      phone: '+91 9876543210',
      role: 'Super Admin',
      status: 'active',
      joinDate: '2023-01-15',
      lastLogin: '2024-01-20 10:30 AM',
      permissions: ['all']
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya@school.com',
      phone: '+91 9876543211',
      role: 'Academic Admin',
      status: 'active',
      joinDate: '2023-03-10',
      lastLogin: '2024-01-20 09:15 AM',
      permissions: ['students', 'teachers', 'courses']
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'amit@school.com',
      phone: '+91 9876543212',
      role: 'Finance Admin',
      status: 'inactive',
      joinDate: '2023-05-22',
      lastLogin: '2024-01-18 03:45 PM',
      permissions: ['finance', 'fees']
    },
    {
      id: 4,
      name: 'Sneha Gupta',
      email: 'sneha@school.com',
      phone: '+91 9876543213',
      role: 'HR Admin',
      status: 'active',
      joinDate: '2023-07-30',
      lastLogin: '2024-01-20 11:20 AM',
      permissions: ['staff', 'attendance']
    },
    {
      id: 5,
      name: 'Vikram Singh',
      email: 'vikram@school.com',
      phone: '+91 9876543214',
      role: 'Infrastructure Admin',
      status: 'active',
      joinDate: '2023-09-05',
      lastLogin: '2024-01-19 02:00 PM',
      permissions: ['facilities', 'maintenance']
    },
  ]);

  // State for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Academic Admin',
    permissions: []
  });

  // Filtered admins
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.phone.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || admin.status === filterStatus;
    const matchesRole = filterRole === 'all' || admin.role === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Role options
  const roleOptions = [
    'Super Admin',
    'Academic Admin',
    'Finance Admin',
    'HR Admin',
    'Infrastructure Admin',
    'Examination Admin'
  ];

  // Permission options
  const permissionOptions = [
    { id: 'all', label: 'Full Access' },
    { id: 'students', label: 'Student Management' },
    { id: 'teachers', label: 'Teacher Management' },
    { id: 'courses', label: 'Course Management' },
    { id: 'finance', label: 'Finance & Fees' },
    { id: 'staff', label: 'Staff Management' },
    { id: 'attendance', label: 'Attendance System' },
    { id: 'exams', label: 'Examination System' },
    { id: 'facilities', label: 'Facilities Management' },
    { id: 'reports', label: 'Reports & Analytics' },
  ];

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAdmins(filteredAdmins.map(admin => admin.id));
    } else {
      setSelectedAdmins([]);
    }
  };

  // Handle individual selection
  const handleSelectAdmin = (id) => {
    if (selectedAdmins.includes(id)) {
      setSelectedAdmins(selectedAdmins.filter(adminId => adminId !== id));
    } else {
      setSelectedAdmins([...selectedAdmins, id]);
    }
  };

  // Open add modal
  const handleAddAdmin = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Academic Admin',
      permissions: []
    });
    setShowAddModal(true);
  };

  // Open edit modal
  const handleEditAdmin = (admin) => {
    setCurrentAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      permissions: admin.permissions
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const handleDeleteAdmin = (admin) => {
    setCurrentAdmin(admin);
    setShowDeleteModal(true);
  };

  // Handle form submit (add/edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (showAddModal) {
      // Add new admin
      const newAdmin = {
        id: admins.length + 1,
        ...formData,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: 'Never'
      };
      setAdmins([...admins, newAdmin]);
      setShowAddModal(false);
    } else if (showEditModal) {
      // Update existing admin
      setAdmins(admins.map(admin => 
        admin.id === currentAdmin.id 
          ? { ...admin, ...formData }
          : admin
      ));
      setShowEditModal(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    setAdmins(admins.filter(admin => admin.id !== currentAdmin.id));
    setShowDeleteModal(false);
    setSelectedAdmins(selectedAdmins.filter(id => id !== currentAdmin.id));
  };

  // Toggle permission
  const togglePermission = (permissionId) => {
    if (permissionId === 'all') {
      // If "all" is selected, toggle all permissions
      if (formData.permissions.includes('all')) {
        setFormData({...formData, permissions: []});
      } else {
        setFormData({...formData, permissions: permissionOptions.map(p => p.id)});
      }
    } else {
      // Toggle individual permission
      const newPermissions = formData.permissions.includes(permissionId)
        ? formData.permissions.filter(p => p !== permissionId && p !== 'all')
        : [...formData.permissions, permissionId];
      setFormData({...formData, permissions: newPermissions});
    }
  };

  // Toggle admin status
  const toggleAdminStatus = (id) => {
    setAdmins(admins.map(admin => 
      admin.id === id 
        ? { ...admin, status: admin.status === 'active' ? 'inactive' : 'active' }
        : admin
    ));
  };

  // Bulk actions
  const handleBulkAction = (action) => {
    switch(action) {
      case 'activate':
        setAdmins(admins.map(admin => 
          selectedAdmins.includes(admin.id) 
            ? { ...admin, status: 'active' }
            : admin
        ));
        break;
      case 'deactivate':
        setAdmins(admins.map(admin => 
          selectedAdmins.includes(admin.id) 
            ? { ...admin, status: 'inactive' }
            : admin
        ));
        break;
      case 'delete':
        setAdmins(admins.filter(admin => !selectedAdmins.includes(admin.id)));
        setSelectedAdmins([]);
        break;
      default:
        break;
    }
  };

  // Stats
  const stats = {
    total: admins.length,
    active: admins.filter(a => a.status === 'active').length,
    superAdmins: admins.filter(a => a.role === 'Super Admin').length,
    recent: admins.filter(a => new Date(a.joinDate) > new Date(Date.now() - 30*24*60*60*1000)).length
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Management</h1>
            <p className="text-gray-600 mt-2">Manage system administrators and their permissions</p>
          </div>
          <button
            onClick={handleAddAdmin}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
          >
            <FaUserPlus className="mr-2" />
            Add New Admin
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Admins</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUserShield className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Admins</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.active}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Super Admins</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.superAdmins}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUserShield className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Recently Added</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.recent}</h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaCalendarAlt className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 md:max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search admins by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {roleOptions.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAdmins.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-medium text-blue-800">
                  {selectedAdmins.length} admin(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedAdmins.length === filteredAdmins.length && filteredAdmins.length > 0}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedAdmins.includes(admin.id)}
                      onChange={() => handleSelectAdmin(admin.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="font-semibold text-blue-600">
                            {admin.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FaEnvelope className="mr-1 text-gray-400" size={12} />
                          {admin.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FaPhone className="mr-1 text-gray-400" size={12} />
                          {admin.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admin.role === 'Super Admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : admin.role === 'Academic Admin'
                        ? 'bg-blue-100 text-blue-800'
                        : admin.role === 'Finance Admin'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.role}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {admin.permissions.length} permission(s)
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleAdminStatus(admin.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                          admin.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {admin.status === 'active' ? (
                          <>
                            <FaCheckCircle className="mr-1" size={10} />
                            Active
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="mr-1" size={10} />
                            Inactive
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(admin.joinDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {admin.lastLogin}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredAdmins.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FaUserShield className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No admins found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' || filterRole !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Get started by adding your first admin'}
            </p>
            <button
              onClick={handleAddAdmin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <FaUserPlus className="inline mr-2" />
              Add New Admin
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredAdmins.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredAdmins.length}</span> of{' '}
                <span className="font-medium">{admins.length}</span> admins
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {showAddModal ? 'Add New Admin' : 'Edit Admin'}
                </h2>
                <button
                  onClick={() => showAddModal ? setShowAddModal(false) : setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {roleOptions.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {permissionOptions.map(permission => (
                      <label
                        key={permission.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          formData.permissions.includes(permission.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => showAddModal ? setShowAddModal(false) : setShowEditModal(false)}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {showAddModal ? 'Add Admin' : 'Update Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && currentAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                Delete Admin
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">{currentAdmin.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;