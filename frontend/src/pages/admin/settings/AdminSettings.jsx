import React, { useState, useEffect } from 'react';
import api, { authAPI, settingsAPI, landingSlidesAPI, galleryAPI } from '../../../services/api';
import { useAuth } from "../../../contexts/AuthContext";
import './AdminSettings.css';

const AdminSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Gallery-specific state
  const [galleryAlbums, setGalleryAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumItems, setAlbumItems] = useState([]);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [galleryUploadTitle, setGalleryUploadTitle] = useState('');
  const [galleryUploadDesc, setGalleryUploadDesc] = useState('');
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryMsg, setGalleryMsg] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

  // Map of setting keys to their form fields
  const [formData, setFormData] = useState({
    site_name: '',
    academic_year: '',
    site_logo_text: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    max_login_attempts: 5,
    password_expiry: 90,
    // Home Page
    hero_title: '',
    hero_subtitle: '',
    stat_years: '',
    stat_alumni: '',
    stat_faculty: '',
    stat_satisfaction: '',
    know_gurukul_desc: '',
    know_gurukul_mission: '',
    admissions_open: 'true',
    // Admissions Page
    admissions_hero_title: '',
    admissions_hero_subtitle: '',
    admissions_open_date: '',
    admissions_last_date: '',
    admissions_session_date: '',
    admissions_year_begins: '',
    // Academics Page
    academics_hero_title: '',
    academics_hero_subtitle: '',
    academics_stat_board: '',
    academics_stat_faculty: '',
    academics_stat_years: '',
    academics_stat_alumni: '',
    // Faculty Page
    faculty_page_title: '',
    faculty_page_subtitle: '',
    // Gallery Page
    gallery_page_title: '',
    gallery_page_subtitle: '',
    // About Page
    about_page_subtitle: '',
    about_history: '',
    about_mission: '',
    about_vision: '',
    // Contact Page
    contact_page_subtitle: '',
    // Notices Page
    notices_page_title: '',
    notices_page_subtitle: '',
    site_logo: ''
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
        contact_address: settingsMap['contact_address'] || 'Lahan-8, Nepal',
        // Home Page
        hero_title: settingsMap['hero_title'] || 'Welcome to Gurukul Pathshala',
        hero_subtitle: settingsMap['hero_subtitle'] || '"We believe in excellence in education, Quality Education is our Motto."',
        stat_years: settingsMap['stat_years'] || '40+',
        stat_alumni: settingsMap['stat_alumni'] || '5000+',
        stat_faculty: settingsMap['stat_faculty'] || '50+',
        stat_satisfaction: settingsMap['stat_satisfaction'] || '100%',
        know_gurukul_desc: settingsMap['know_gurukul_desc'] || 'Founded in 1980, Gurukul Pathshala stands at the intersection of discipline, innovation, and holistic education.',
        know_gurukul_mission: settingsMap['know_gurukul_mission'] || 'Our mission is to provide quality education that nurtures intellectual curiosity, critical thinking, and ethical values.',
        admissions_open: settingsMap['admissions_open'] || 'true',
        // Admissions Page
        admissions_hero_title: settingsMap['admissions_hero_title'] || 'Admissions Open for 2024-25',
        admissions_hero_subtitle: settingsMap['admissions_hero_subtitle'] || 'Join Gurukul Pathshala and shape a brighter future for your child',
        admissions_open_date: settingsMap['admissions_open_date'] || '1st December 2023',
        admissions_last_date: settingsMap['admissions_last_date'] || '31st March 2024',
        admissions_session_date: settingsMap['admissions_session_date'] || 'April 2024',
        admissions_year_begins: settingsMap['admissions_year_begins'] || '1st June 2024',
        // Academics Page
        academics_hero_title: settingsMap['academics_hero_title'] || 'Academic Excellence at Gurukul Pathshala',
        academics_hero_subtitle: settingsMap['academics_hero_subtitle'] || 'Nurturing minds, shaping futures through a holistic and innovative curriculum',
        academics_stat_board: settingsMap['academics_stat_board'] || '98%',
        academics_stat_faculty: settingsMap['academics_stat_faculty'] || '50+',
        academics_stat_years: settingsMap['academics_stat_years'] || '15+',
        academics_stat_alumni: settingsMap['academics_stat_alumni'] || '1000+',
        // Faculty Page
        faculty_page_title: settingsMap['faculty_page_title'] || 'Our Faculty',
        faculty_page_subtitle: settingsMap['faculty_page_subtitle'] || 'Meet the dedicated educators shaping the future of our students.',
        // Gallery Page
        gallery_page_title: settingsMap['gallery_page_title'] || 'School Gallery',
        gallery_page_subtitle: settingsMap['gallery_page_subtitle'] || 'Discover the vibrant life, events, and facilities at our campus',
        // About Page
        about_page_subtitle: settingsMap['about_page_subtitle'] || 'Discover the legacy and vision of our school.',
        about_history: settingsMap['about_history'] || 'Founded with a vision to provide holistic education, Gurukul Pathshala has been a beacon of knowledge and character building for over 40 years.',
        about_mission: settingsMap['about_mission'] || 'To empower students with knowledge, skills, and values that enable them to become responsible citizens and global leaders.',
        about_vision: settingsMap['about_vision'] || 'To be a center of excellence in education, fostering innovation, critical thinking, and ethical leadership.',
        // Contact Page
        contact_page_subtitle: settingsMap['contact_page_subtitle'] || 'Get in touch with us for admissions, inquiries, or support.',
        // Notices Page
        notices_page_title: settingsMap['notices_page_title'] || 'Notices & Announcements',
        notices_page_subtitle: settingsMap['notices_page_subtitle'] || 'Stay updated with the latest news and announcements from our school.',
        site_logo: settingsMap['site_logo'] || ''
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

  // Gallery helper functions
  const fetchGalleryAlbums = async () => {
    try {
      const albums = await galleryAPI.getAllAlbums();
      setGalleryAlbums(albums);
    } catch (e) {
      console.error('Failed to load gallery albums', e);
    }
  };

  const fetchAlbumItems = async (albumId) => {
    try {
      const items = await galleryAPI.getItemsByAlbum(albumId);
      setAlbumItems(items);
    } catch (e) {
      console.error('Failed to load album items', e);
    }
  };

  const handleSelectAlbum = async (album) => {
    setSelectedAlbum(album);
    await fetchAlbumItems(album.id);
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    try {
      await galleryAPI.createAlbum(newAlbumName.trim(), newAlbumDesc.trim());
      setNewAlbumName('');
      setNewAlbumDesc('');
      setGalleryMsg('Album created!');
      await fetchGalleryAlbums();
      setTimeout(() => setGalleryMsg(''), 2000);
    } catch (e) {
      setGalleryMsg('Failed to create album.');
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (!window.confirm('Delete this album and all its media?')) return;
    try {
      await galleryAPI.deleteAlbum(id);
      if (selectedAlbum?.id === id) { setSelectedAlbum(null); setAlbumItems([]); }
      await fetchGalleryAlbums();
      setGalleryMsg('Album deleted.');
      setTimeout(() => setGalleryMsg(''), 2000);
    } catch (e) {
      setGalleryMsg('Failed to delete album.');
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedAlbum) return;
    setGalleryUploading(true);
    try {
      await galleryAPI.uploadItem(selectedAlbum.id, file, galleryUploadTitle, galleryUploadDesc);
      setGalleryUploadTitle('');
      setGalleryUploadDesc('');
      setGalleryMsg('Media uploaded!');
      await fetchAlbumItems(selectedAlbum.id);
      await fetchGalleryAlbums();
      setTimeout(() => setGalleryMsg(''), 2000);
    } catch (e) {
      setGalleryMsg('Upload failed.');
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    try {
      await galleryAPI.deleteItem(id);
      setAlbumItems(prev => prev.filter(i => i.id !== id));
      setGalleryMsg('Item deleted.');
      setTimeout(() => setGalleryMsg(''), 2000);
    } catch (e) {
      setGalleryMsg('Delete failed.');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const updatedSetting = await settingsAPI.uploadImage('site_logo', file);
      setFormData(prev => ({ ...prev, site_logo: updatedSetting.settingValue }));
      setMessage({ text: 'Logo uploaded successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (e) {
      console.error('Logo upload failed', e);
      setMessage({ text: 'Logo upload failed.', type: 'error' });
    } finally {
      setLogoUploading(false);
    }
  };

  const deleteLogo = async () => {
    if (!window.confirm('Are you sure you want to remove the school logo?')) return;
    try {
      await settingsAPI.delete('site_logo');
      setFormData(prev => ({ ...prev, site_logo: '' }));
      setMessage({ text: 'Logo removed.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (e) {
      console.error('Logo delete failed', e);
      setMessage({ text: 'Failed to remove logo.', type: 'error' });
    }
  };

  useEffect(() => {
    if (activeTab === 'gallery') fetchGalleryAlbums();
  }, [activeTab]);

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
            className={activeTab === 'homepage' ? 'active' : ''}
            onClick={() => setActiveTab('homepage')}
          >
            🏠 Home Page
          </button>
          <button
            className={activeTab === 'admissions' ? 'active' : ''}
            onClick={() => setActiveTab('admissions')}
          >
            🎓 Admissions Page
          </button>
          <button
            className={activeTab === 'academics' ? 'active' : ''}
            onClick={() => setActiveTab('academics')}
          >
            📚 Academics Page
          </button>
          <button
            className={activeTab === 'faculty' ? 'active' : ''}
            onClick={() => setActiveTab('faculty')}
          >
            👨‍🏫 Faculty Page
          </button>
          <button
            className={activeTab === 'gallery' ? 'active' : ''}
            onClick={() => setActiveTab('gallery')}
          >
            🖼️ Gallery Page
          </button>
          <button
            className={activeTab === 'about' ? 'active' : ''}
            onClick={() => setActiveTab('about')}
          >
            ℹ️ About Page
          </button>
          <button
            className={activeTab === 'contact' ? 'active' : ''}
            onClick={() => setActiveTab('contact')}
          >
            📞 Contact Page
          </button>
          <button
            className={activeTab === 'notices' ? 'active' : ''}
            onClick={() => setActiveTab('notices')}
          >
            📢 Notices Page
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
                  <div className="form-group">
                    <label>School Logo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                      {formData.site_logo ? (
                        <div style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                          <img 
                            src={formData.site_logo.startsWith('http') ? formData.site_logo : `${(import.meta.env.VITE_API_URL || '').replace(/\/api$/, '')}${formData.site_logo}`} 
                            alt={formData.site_logo_text || "School Logo"} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                          <button 
                            onClick={deleteLogo}
                            style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                          >✕</button>
                        </div>
                      ) : (
                        <div style={{ width: '100px', height: '100px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                          No Logo
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          style={{ display: 'none' }}
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="primary-btn" style={{ cursor: 'pointer', padding: '8px 15px', display: 'inline-block' }}>
                          {logoUploading ? 'Uploading...' : formData.site_logo ? 'Change Logo' : 'Upload Logo'}
                        </label>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Recommended size: 200x200px (PNG/JPG)</p>
                      </div>
                    </div>
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

              {activeTab === 'homepage' && (
                <div className="settings-panel">
                  <h2>🏠 Home Page Content</h2>

                  <h3 style={{marginTop:'15px',marginBottom:'10px',color:'#20b2aa'}}>Hero Section</h3>
                  <div className="form-group">
                    <label>Hero Title</label>
                    <input type="text" name="hero_title" value={formData.hero_title} onChange={handleChange} placeholder="Welcome to Gurukul Pathshala" />
                  </div>
                  <div className="form-group">
                    <label>Hero Subtitle</label>
                    <input type="text" name="hero_subtitle" value={formData.hero_subtitle} onChange={handleChange} placeholder="We believe in excellence..." />
                  </div>

                  <h3 style={{marginTop:'20px',marginBottom:'10px',color:'#20b2aa'}}>Statistics</h3>
                  <div className="form-group">
                    <label>Years of Excellence (e.g. 40+)</label>
                    <input type="text" name="stat_years" value={formData.stat_years} onChange={handleChange} placeholder="40+" />
                  </div>
                  <div className="form-group">
                    <label>Successful Alumni (e.g. 5000+)</label>
                    <input type="text" name="stat_alumni" value={formData.stat_alumni} onChange={handleChange} placeholder="5000+" />
                  </div>
                  <div className="form-group">
                    <label>Expert Faculty (e.g. 50+)</label>
                    <input type="text" name="stat_faculty" value={formData.stat_faculty} onChange={handleChange} placeholder="50+" />
                  </div>
                  <div className="form-group">
                    <label>Student Satisfaction (e.g. 100%)</label>
                    <input type="text" name="stat_satisfaction" value={formData.stat_satisfaction} onChange={handleChange} placeholder="100%" />
                  </div>

                  <h3 style={{marginTop:'20px',marginBottom:'10px',color:'#20b2aa'}}>Know Gurukul Section</h3>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="know_gurukul_desc" value={formData.know_gurukul_desc} onChange={handleChange} rows={3} />
                  </div>
                  <div className="form-group">
                    <label>Mission Statement</label>
                    <textarea name="know_gurukul_mission" value={formData.know_gurukul_mission} onChange={handleChange} rows={3} />
                  </div>

                  <h3 style={{marginTop:'20px',marginBottom:'10px',color:'#20b2aa'}}>Admissions Toggle</h3>
                  <div className="form-group">
                    <label>Admissions Status</label>
                    <select name="admissions_open" value={formData.admissions_open} onChange={handleChange}>
                      <option value="true">Open</option>
                      <option value="false">Closed</option>
                    </select>
                  </div>

                  <button className="primary-btn" onClick={() => saveGroup('HomePage', [
                    { key: 'hero_title', desc: 'Hero section main title' },
                    { key: 'hero_subtitle', desc: 'Hero section subtitle' },
                    { key: 'stat_years', desc: 'Years of excellence stat' },
                    { key: 'stat_alumni', desc: 'Successful alumni stat' },
                    { key: 'stat_faculty', desc: 'Expert faculty stat' },
                    { key: 'stat_satisfaction', desc: 'Student satisfaction stat' },
                    { key: 'know_gurukul_desc', desc: 'Know Gurukul description' },
                    { key: 'know_gurukul_mission', desc: 'Know Gurukul mission text' },
                    { key: 'admissions_open', desc: 'Whether admissions are open' }
                  ])}>Save Home Page Settings</button>
                </div>
              )}

              {activeTab === 'admissions' && (
                <div className="settings-panel">
                  <h2>🎓 Admissions Page Content</h2>

                  <h3 style={{marginTop:'15px',marginBottom:'10px',color:'#20b2aa'}}>Hero Section</h3>
                  <div className="form-group">
                    <label>Page Title (when open)</label>
                    <input type="text" name="admissions_hero_title" value={formData.admissions_hero_title} onChange={handleChange} placeholder="Admissions Open for 2024-25" />
                  </div>
                  <div className="form-group">
                    <label>Page Subtitle</label>
                    <input type="text" name="admissions_hero_subtitle" value={formData.admissions_hero_subtitle} onChange={handleChange} placeholder="Join Gurukul Pathshala..." />
                  </div>

                  <h3 style={{marginTop:'20px',marginBottom:'10px',color:'#20b2aa'}}>Important Dates</h3>
                  <div className="form-group">
                    <label>Admissions Open Date</label>
                    <input type="text" name="admissions_open_date" value={formData.admissions_open_date} onChange={handleChange} placeholder="1st December 2023" />
                  </div>
                  <div className="form-group">
                    <label>Last Date for Submission</label>
                    <input type="text" name="admissions_last_date" value={formData.admissions_last_date} onChange={handleChange} placeholder="31st March 2024" />
                  </div>
                  <div className="form-group">
                    <label>Interaction Sessions</label>
                    <input type="text" name="admissions_session_date" value={formData.admissions_session_date} onChange={handleChange} placeholder="April 2024" />
                  </div>
                  <div className="form-group">
                    <label>Academic Year Begins</label>
                    <input type="text" name="admissions_year_begins" value={formData.admissions_year_begins} onChange={handleChange} placeholder="1st June 2024" />
                  </div>

                  <button className="primary-btn" onClick={() => saveGroup('AdmissionsPage', [
                    { key: 'admissions_hero_title', desc: 'Admissions page hero title' },
                    { key: 'admissions_hero_subtitle', desc: 'Admissions page hero subtitle' },
                    { key: 'admissions_open_date', desc: 'Date admissions open' },
                    { key: 'admissions_last_date', desc: 'Last date for application submission' },
                    { key: 'admissions_session_date', desc: 'Interaction session dates' },
                    { key: 'admissions_year_begins', desc: 'When new academic year begins' }
                  ])}>Save Admissions Page Settings</button>
                </div>
              )}

              {activeTab === 'academics' && (
                <div className="settings-panel">
                  <h2>📚 Academics Page Content</h2>

                  <h3 style={{marginTop:'15px',marginBottom:'10px',color:'#20b2aa'}}>Hero Section</h3>
                  <div className="form-group">
                    <label>Hero Title</label>
                    <input type="text" name="academics_hero_title" value={formData.academics_hero_title} onChange={handleChange} placeholder="Academic Excellence at Gurukul Pathshala" />
                  </div>
                  <div className="form-group">
                    <label>Hero Subtitle</label>
                    <input type="text" name="academics_hero_subtitle" value={formData.academics_hero_subtitle} onChange={handleChange} placeholder="Nurturing minds, shaping futures..." />
                  </div>

                  <h3 style={{marginTop:'20px',marginBottom:'10px',color:'#20b2aa'}}>Statistics</h3>
                  <div className="form-group">
                    <label>Board Results (e.g. 98%)</label>
                    <input type="text" name="academics_stat_board" value={formData.academics_stat_board} onChange={handleChange} placeholder="98%" />
                  </div>
                  <div className="form-group">
                    <label>Expert Faculty (e.g. 50+)</label>
                    <input type="text" name="academics_stat_faculty" value={formData.academics_stat_faculty} onChange={handleChange} placeholder="50+" />
                  </div>
                  <div className="form-group">
                    <label>Years Excellence (e.g. 15+)</label>
                    <input type="text" name="academics_stat_years" value={formData.academics_stat_years} onChange={handleChange} placeholder="15+" />
                  </div>
                  <div className="form-group">
                    <label>Successful Alumni (e.g. 1000+)</label>
                    <input type="text" name="academics_stat_alumni" value={formData.academics_stat_alumni} onChange={handleChange} placeholder="1000+" />
                  </div>

                  <button className="primary-btn" onClick={() => saveGroup('AcademicsPage', [
                    { key: 'academics_hero_title', desc: 'Academics page hero title' },
                    { key: 'academics_hero_subtitle', desc: 'Academics page hero subtitle' },
                    { key: 'academics_stat_board', desc: 'Board results stat' },
                    { key: 'academics_stat_faculty', desc: 'Expert faculty stat' },
                    { key: 'academics_stat_years', desc: 'Years of excellence stat' },
                    { key: 'academics_stat_alumni', desc: 'Successful alumni stat' }
                  ])}>Save Academics Page Settings</button>
                </div>
              )}

              {activeTab === 'faculty' && (
                <div className="settings-panel">
                  <h2>👨‍🏫 Faculty Page Content</h2>
                  <p style={{color:'#666',marginBottom:'15px',fontSize:'0.9rem'}}>Note: Faculty member profiles are managed in the <strong>Faculty</strong> section of the admin portal.</p>

                  <h3 style={{marginTop:'15px',marginBottom:'10px',color:'#20b2aa'}}>Page Header</h3>
                  <div className="form-group">
                    <label>Page Title</label>
                    <input type="text" name="faculty_page_title" value={formData.faculty_page_title} onChange={handleChange} placeholder="Our Faculty" />
                  </div>
                  <div className="form-group">
                    <label>Page Subtitle</label>
                    <input type="text" name="faculty_page_subtitle" value={formData.faculty_page_subtitle} onChange={handleChange} placeholder="Meet the dedicated educators..." />
                  </div>

                  <button className="primary-btn" onClick={() => saveGroup('FacultyPage', [
                    { key: 'faculty_page_title', desc: 'Faculty page title' },
                    { key: 'faculty_page_subtitle', desc: 'Faculty page subtitle' }
                  ])}>Save Faculty Page Settings</button>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="settings-panel">
                  <h2>🖼️ Gallery Management</h2>

                  {galleryMsg && (
                    <div style={{padding:'8px 14px',borderRadius:'6px',marginBottom:'12px',background:'#d4edda',color:'#155724',fontSize:'0.9rem'}}>
                      {galleryMsg}
                    </div>
                  )}

                  {/* Page Header Settings */}
                  <h3 style={{marginTop:'10px',marginBottom:'10px',color:'#20b2aa'}}>Page Header</h3>
                  <div className="form-group">
                    <label>Gallery Title</label>
                    <input type="text" name="gallery_page_title" value={formData.gallery_page_title} onChange={handleChange} placeholder="School Gallery" />
                  </div>
                  <div className="form-group">
                    <label>Gallery Subtitle</label>
                    <input type="text" name="gallery_page_subtitle" value={formData.gallery_page_subtitle} onChange={handleChange} placeholder="Discover the vibrant life at our campus" />
                  </div>
                  <button className="primary-btn" style={{marginBottom:'20px'}} onClick={() => saveGroup('GalleryPage', [
                    { key: 'gallery_page_title', desc: 'Gallery page title' },
                    { key: 'gallery_page_subtitle', desc: 'Gallery page subtitle' }
                  ])}>Save Header Text</button>

                  {/* Album Management */}
                  <h3 style={{marginTop:'20px',marginBottom:'10px',color:'#20b2aa'}}>📁 Albums / Collections</h3>

                  {/* Create Album Form */}
                  <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'14px',alignItems:'flex-end'}}>
                    <div style={{flex:'1',minWidth:'150px'}}>
                      <label style={{display:'block',marginBottom:'4px',fontSize:'0.85rem',fontWeight:'600'}}>Album Name *</label>
                      <input type="text" value={newAlbumName} onChange={e => setNewAlbumName(e.target.value)} placeholder="e.g. Annual Day 2024" style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}} />
                    </div>
                    <div style={{flex:'2',minWidth:'180px'}}>
                      <label style={{display:'block',marginBottom:'4px',fontSize:'0.85rem',fontWeight:'600'}}>Description</label>
                      <input type="text" value={newAlbumDesc} onChange={e => setNewAlbumDesc(e.target.value)} placeholder="Optional description" style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}} />
                    </div>
                    <button className="primary-btn" onClick={handleCreateAlbum} style={{whiteSpace:'nowrap'}}>+ Create Album</button>
                  </div>

                  {/* Album List */}
                  <div style={{display:'flex',flexWrap:'wrap',gap:'10px',marginBottom:'20px'}}>
                    {galleryAlbums.length === 0 && <p style={{color:'#888',fontSize:'0.9rem'}}>No albums yet. Create your first album above.</p>}
                    {galleryAlbums.map(album => (
                      <div key={album.id}
                        onClick={() => handleSelectAlbum(album)}
                        style={{
                          border: selectedAlbum?.id === album.id ? '2px solid #20b2aa' : '1px solid #ddd',
                          borderRadius:'10px', padding:'10px 14px', cursor:'pointer',
                          background: selectedAlbum?.id === album.id ? '#e6f9f8' : '#f9f9f9',
                          minWidth:'130px', position:'relative'
                        }}
                      >
                        <div style={{fontWeight:'600',fontSize:'0.9rem',marginBottom:'4px'}}>📁 {album.name}</div>
                        <div style={{fontSize:'0.78rem',color:'#888'}}>{album.description || 'No description'}</div>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteAlbum(album.id); }}
                          style={{position:'absolute',top:'6px',right:'6px',background:'none',border:'none',cursor:'pointer',color:'#e74c3c',fontSize:'1rem'}}
                          title="Delete album"
                        >✕</button>
                      </div>
                    ))}
                  </div>

                  {/* Media Upload & List for selected album */}
                  {selectedAlbum && (
                    <div style={{border:'1px solid #ddd',borderRadius:'10px',padding:'16px',background:'#fafafa'}}>
                      <h4 style={{color:'#20b2aa',marginBottom:'12px'}}>📷 {selectedAlbum.name} — Upload Media</h4>

                      <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'flex-end',marginBottom:'14px'}}>
                        <div style={{flex:'1',minWidth:'130px'}}>
                          <label style={{display:'block',marginBottom:'4px',fontSize:'0.85rem',fontWeight:'600'}}>Title (optional)</label>
                          <input type="text" value={galleryUploadTitle} onChange={e => setGalleryUploadTitle(e.target.value)} placeholder="Photo title" style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}} />
                        </div>
                        <div style={{flex:'2',minWidth:'160px'}}>
                          <label style={{display:'block',marginBottom:'4px',fontSize:'0.85rem',fontWeight:'600'}}>Description (optional)</label>
                          <input type="text" value={galleryUploadDesc} onChange={e => setGalleryUploadDesc(e.target.value)} placeholder="Caption" style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}} />
                        </div>
                        <div>
                          <label style={{display:'block',marginBottom:'4px',fontSize:'0.85rem',fontWeight:'600'}}>Choose Image / Video</label>
                          <input type="file" accept="image/*,video/*" onChange={handleGalleryUpload} disabled={galleryUploading}
                            style={{padding:'6px',border:'1px solid #ccc',borderRadius:'6px',background:'#fff',cursor:'pointer'}} />
                        </div>
                        {galleryUploading && <span style={{color:'#20b2aa',fontSize:'0.9rem'}}>Uploading...</span>}
                      </div>

                      {/* Media Grid */}
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:'10px'}}>
                        {albumItems.length === 0 && <p style={{color:'#aaa',fontSize:'0.85rem',gridColumn:'1/-1'}}>No media in this album yet.</p>}
                        {albumItems.map(item => (
                          <div key={item.id} style={{borderRadius:'8px',overflow:'hidden',border:'1px solid #ddd',position:'relative',background:'#e0e0e0'}}>
                            {item.mediaType === 'VIDEO' ? (
                              <video src={item.fileUrl} style={{width:'100%',height:'90px',objectFit:'cover'}} muted />
                            ) : (
                              <img src={item.fileUrl} alt={item.title || 'Gallery'} style={{width:'100%',height:'90px',objectFit:'cover'}} />
                            )}
                            {item.title && <div style={{fontSize:'0.72rem',padding:'3px 5px',background:'rgba(0,0,0,0.5)',color:'#fff',position:'absolute',bottom:0,left:0,right:0,textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{item.title}</div>}
                            <button
                              onClick={() => handleDeleteGalleryItem(item.id)}
                              style={{position:'absolute',top:'4px',right:'4px',background:'rgba(255,255,255,0.85)',border:'none',borderRadius:'50%',width:'22px',height:'22px',cursor:'pointer',color:'#e74c3c',fontSize:'0.75rem',display:'flex',alignItems:'center',justifyContent:'center'}}
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="settings-panel">
                  <h2>ℹ️ About Page Content</h2>

                  <h3 style={{marginTop:'15px',marginBottom:'10px',color:'#20b2aa'}}>Page Header</h3>
                  <div className="form-group">
                    <label>Page Subtitle</label>
                    <input type="text" name="about_page_subtitle" value={formData.about_page_subtitle} onChange={handleChange} placeholder="Discover the legacy and vision of our school." />
                  </div>

                  <h3 style={{marginTop:'20px',marginBottom:'10px',color:'#20b2aa'}}>Content Sections</h3>
                  <div className="form-group">
                    <label>Our History</label>
                    <textarea name="about_history" value={formData.about_history} onChange={handleChange} rows={4} />
                  </div>
                  <div className="form-group">
                    <label>Our Mission</label>
                    <textarea name="about_mission" value={formData.about_mission} onChange={handleChange} rows={4} />
                  </div>
                  <div className="form-group">
                    <label>Our Vision</label>
                    <textarea name="about_vision" value={formData.about_vision} onChange={handleChange} rows={4} />
                  </div>

                  <button className="primary-btn" onClick={() => saveGroup('AboutPage', [
                    { key: 'about_page_subtitle', desc: 'About page subtitle' },
                    { key: 'about_history', desc: 'About page history section' },
                    { key: 'about_mission', desc: 'About page mission section' },
                    { key: 'about_vision', desc: 'About page vision section' }
                  ])}>Save About Page Settings</button>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="settings-panel">
                  <h2>📞 Contact Page Content</h2>

                  <h3 style={{marginTop:'15px',marginBottom:'10px',color:'#20b2aa'}}>Page Header</h3>
                  <div className="form-group">
                    <label>Page Subtitle</label>
                    <input type="text" name="contact_page_subtitle" value={formData.contact_page_subtitle} onChange={handleChange} placeholder="Get in touch with us for admissions, inquiries, or support." />
                  </div>

                  <h3 style={{marginTop:'20px',marginBottom:'10px',color:'#20b2aa'}}>📍 Get In Touch Details</h3>

                  <div className="form-group">
                    <label>Address</label>
                    <input type="text" name="contact_address" value={formData.contact_address} onChange={handleChange} placeholder="e.g. Lahan-8, Siraha, Nepal" />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="e.g. +977-9819782671" />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="e.g. gurukulpathshala76@gmail.com" />
                  </div>

                  <button className="primary-btn" onClick={() => saveGroup('ContactPage', [
                    { key: 'contact_page_subtitle', desc: 'Contact page subtitle' },
                    { key: 'contact_address', desc: 'School address' },
                    { key: 'contact_phone', desc: 'School phone number' },
                    { key: 'contact_email', desc: 'School contact email' },
                  ])}>Save Contact Page Settings</button>
                </div>
              )}


              {activeTab === 'notices' && (
                <div className="settings-panel">
                  <h2>📢 Notices Page Content</h2>
                  <p style={{color:'#666',marginBottom:'15px',fontSize:'0.9rem'}}>Note: Actual notices/announcements are managed in the <strong>Notices</strong> section of the admin portal.</p>

                  <h3 style={{marginTop:'15px',marginBottom:'10px',color:'#20b2aa'}}>Page Header</h3>
                  <div className="form-group">
                    <label>Page Title</label>
                    <input type="text" name="notices_page_title" value={formData.notices_page_title} onChange={handleChange} placeholder="Notices & Announcements" />
                  </div>
                  <div className="form-group">
                    <label>Page Subtitle</label>
                    <input type="text" name="notices_page_subtitle" value={formData.notices_page_subtitle} onChange={handleChange} placeholder="Stay updated with the latest news..." />
                  </div>

                  <button className="primary-btn" onClick={() => saveGroup('NoticesPage', [
                    { key: 'notices_page_title', desc: 'Notices page title' },
                    { key: 'notices_page_subtitle', desc: 'Notices page subtitle' }
                  ])}>Save Notices Page Settings</button>
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
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
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