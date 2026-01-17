

import React, { useState } from 'react';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h1>System Settings</h1>
        <p>Manage school-wide configuration and preferences</p>
      </div>

      <div className="settings-container">
        <aside className="settings-sidebar">
          <button
            className={activeTab === 'general' ? 'active' : ''}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={activeTab === 'branding' ? 'active' : ''}
            onClick={() => setActiveTab('branding')}
          >
            Branding
          </button>
          <button
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </aside>

        <section className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-panel">
              <h2>General Settings</h2>

              <div className="form-group">
                <label>School Name</label>
                <input type="text" placeholder="Gurukul Pathshala" />
              </div>

              <div className="form-group">
                <label>Academic Year</label>
                <input type="text" placeholder="2025 - 2026" />
              </div>

              <button className="primary-btn">Save Changes</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-panel">
              <h2>Security Settings</h2>

              <div className="form-group">
                <label>Max Login Attempts</label>
                <input type="number" placeholder="5" />
              </div>

              <div className="form-group">
                <label>Password Expiry (days)</label>
                <input type="number" placeholder="90" />
              </div>

              <button className="primary-btn">Update Security</button>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="settings-panel">
              <h2>Branding</h2>

              <div className="form-group">
                <label>School Logo</label>
                <input type="file" />
              </div>

              <div className="form-group">
                <label>Primary Color</label>
                <input type="color" />
              </div>

              <button className="primary-btn">Apply Branding</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h2>Notification Preferences</h2>

              <div className="checkbox-group">
                <label>
                  <input type="checkbox" /> Email alerts for new admissions
                </label>
                <label>
                  <input type="checkbox" /> Notify on system updates
                </label>
                <label>
                  <input type="checkbox" /> Daily summary reports
                </label>
              </div>

              <button className="primary-btn">Save Preferences</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminSettings;