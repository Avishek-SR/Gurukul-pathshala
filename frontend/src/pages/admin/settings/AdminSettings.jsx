import React, { useState, useEffect } from 'react';
import api, { authAPI, settingsAPI, landingSlidesAPI } from '../../../services/api';
import { useAuth } from "../../../contexts/AuthContext";
import './AdminSettings.css';

const AdminSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Map of setting keys to their form fields
  const [formData, setFormData] = useState({
    site_name: '',
    academic_year: '',
    site_logo_text: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    max_login_attempts: 5,
    password_expiry: 90
  });

  // Slides State
  const [slides, setSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(false);

  const fetchSlides = async () => {
    setLoadingSlides(true);
    try {
      const data = await landingSlidesAPI.getAllAdmin();
      setSlides(data);
    } catch (err) {
      console.error("Failed to fetch slides", err);
    } finally {
      setLoadingSlides(false);
    }
  };

  const handleAddNewSlide = async (file) => {
    try {
      // Optimistic UI or wait? Let's wait for simplicity
      setLoadingSlides(true);
      await landingSlidesAPI.create(file);
      await fetchSlides();
    } catch (err) {
      console.error("Failed to upload slide", err);
      alert("Failed to upload slide.");
      setLoadingSlides(false);
    }
  };

  const handleDeleteSlide = async (id) => {
    try {
      await landingSlidesAPI.delete(id);
      setSlides(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete slide", err);
      alert("Failed to delete slide.");
    }
  };

  useEffect(() => {
    if (activeTab === 'landing') {
      fetchSlides();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsAPI.getAllAdmin();
      const settingsMap = {};
      data.forEach(s => {
        settingsMap[s.settingKey] = s.settingValue;
      });
      setSettings(settingsMap);
      setFormData({
        site_name: settingsMap['site_name'] || '',
        academic_year: settingsMap['academic_year'] || '',
        max_login_attempts: settingsMap['max_login_attempts'] || '',
        password_expiry: settingsMap['password_expiry'] || '90',
        site_logo_text: settingsMap['site_logo_text'] || 'Gurukul Pathshala',
        contact_email: settingsMap['contact_email'] || 'gurukulpathshala76@gmail.com',
        contact_phone: settingsMap['contact_phone'] || '+977-9819782671',
        contact_address: settingsMap['contact_address'] || 'Lahan-8, Nepal'
      });
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key, value, group, description) => {
    try {
      setMessage({ text: 'Saving...', type: 'info' });
      await settingsAPI.update({
        key,
        value,
        group,
        description
      });
      setSettings(prev => ({ ...prev, [key]: value }));
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error("Failed to save setting", error);
      setMessage({ text: 'Failed to save settings.', type: 'error' });
    }
  };

  // Helper to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generic save handler for a group of settings
  const saveGroup = async (groupName, fields) => {
    for (const field of fields) {
      await handleSave(field.key, formData[field.key], groupName, field.desc);
    }
  };

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h1>System Settings</h1>
        <p>Manage school-wide configuration and preferences</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
          {message.text}
        </div>
      )}

      <div className="settings-container">
        <aside className="settings-sidebar">
          <button
            className={activeTab === 'general' ? 'active' : ''}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={activeTab === 'branding' ? 'active' : ''}
            onClick={() => setActiveTab('branding')}
          >
            Branding & Contact
          </button>
          <button
            className={activeTab === 'landing' ? 'active' : ''}
            onClick={() => setActiveTab('landing')}
          >
            Landing Page
          </button>
          <button
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </aside>

        <section className="settings-content">
          {loading ? <div className="spinner">Loading settings...</div> : (
            <>
              {activeTab === 'general' && (
                <div className="settings-panel">
                  <h2>General Settings</h2>
                  <div className="form-group">
                    <label>School Name</label>
                    <input
                      type="text"
                      name="site_name"
                      value={formData.site_name}
                      onChange={handleChange}
                      placeholder="Gurukul Pathshala"
                    />
                  </div>
                  <div className="form-group">
                    <label>Academic Year</label>
                    <input
                      type="text"
                      name="academic_year"
                      value={formData.academic_year}
                      onChange={handleChange}
                      placeholder="2025 - 2026"
                    />
                  </div>
                  <button className="primary-btn" onClick={() => saveGroup('General', [
                    { key: 'site_name', desc: 'Name of the school' },
                    { key: 'academic_year', desc: 'Current academic session' }
                  ])}>Save Changes</button>
                </div>
              )}

              {activeTab === 'branding' && (
                <div className="settings-panel">
                  <h2>Branding & Contact Information</h2>
                  <div className="form-group">
                    <label>Logo Text</label>
                    <input
                      type="text"
                      name="site_logo_text"
                      value={formData.site_logo_text}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="text"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="contact_address"
                      value={formData.contact_address}
                      onChange={handleChange}
                    />
                  </div>
                  <button className="primary-btn" onClick={() => saveGroup('Branding', [
                    { key: 'site_logo_text', desc: 'Text displayed next to logo' },
                    { key: 'contact_email', desc: 'Public contact email' },
                    { key: 'contact_phone', desc: 'Public phone number' },
                    { key: 'contact_address', desc: 'School address' }
                  ])}>Save Changes</button>
                </div>
              )}

              {activeTab === 'landing' && (
                <div className="settings-panel">
                  <div className="flex justify-between items-center mb-4">
                    <h2>Landing Page Slider</h2>
                    <label className="primary-btn cursor-pointer inline-flex items-center gap-2">
                      <i className="fas fa-plus"></i> Add Slide
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleAddNewSlide(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Upload images or videos for the homepage slider. Recommended size: 1920x800.</p>

                  {loadingSlides ? (
                    <div>Loading slides...</div>
                  ) : (
                    <div className="landing-images-grid">
                      {slides.map((slide, index) => (
                        <LandingPageSlideItem
                          key={slide.id}
                          slide={slide}
                          index={index}
                          onDelete={handleDeleteSlide}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-panel">
                  <h2>Security Settings</h2>
                  <div className="form-group">
                    <label>Max Login Attempts</label>
                    <input
                      type="number"
                      name="max_login_attempts"
                      value={formData.max_login_attempts}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password Expiry (days)</label>
                    <input
                      type="number"
                      name="password_expiry"
                      value={formData.password_expiry}
                      onChange={handleChange}
                    />
                  </div>
                  <button className="primary-btn" onClick={() => saveGroup('Security', [
                    { key: 'max_login_attempts', desc: 'Lockout threshold' },
                    { key: 'password_expiry', desc: 'Days before password reset required' }
                  ])}>Update Security</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

// Helper Component for Landing Page Slide Item
const LandingPageSlideItem = ({ slide, index, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  let url = slide.fileUrl;
  if (url && url.startsWith('/api/uploads')) {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    url = `${baseUrl}${url}`;
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    setDeleting(true);
    await onDelete(slide.id);
    setDeleting(false);
  }

  return (
    <div className="image-upload-card relative">
      <div className="card-header flex justify-between items-center">
        <span>Slide {index + 1}</span>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700"
          disabled={deleting}
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
      <div className="image-preview-area">
        {slide.fileType === 'VIDEO' ? (
          <video src={url} className="w-full h-full object-cover" controls />
        ) : (
          <img
            src={url}
            alt={`Slide ${slide.id}`}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
      </div>
      <div className="p-2 text-xs text-center text-gray-500">
        {slide.fileType}
      </div>
    </div>
  );
};

export default AdminSettings;