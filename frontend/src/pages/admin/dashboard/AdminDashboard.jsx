import React, { useEffect, useState } from 'react';
import axios from '../../../api/axiosConfig'; // Configured axios instance
import './AdminDashboard.css';
import DashboardStats from './components/DashboardStats';
import DashboardCharts from './components/DashboardCharts';
import UpcomingEvents from './components/UpcomingEvents';
import GlobalActivityLog from './components/GlobalActivityLog';

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // Parallel fetch for stats and analytics using axios
        const [statsRes, analyticsRes] = await Promise.all([
          axios.get('/admin/dashboard'),
          axios.get('/admin/dashboard/analytics')
        ]);

        if (statsRes.data && analyticsRes.data) {
          setStats(statsRes.data);
          setAnalytics(analyticsRes.data);
        } else {
          throw new Error('Failed to fetch dashboard data');
        }
      } catch (e) {
        console.error(e);
        if (e.response?.status === 401) {
          // Handled by interceptor usually, but good to know
          setError('Unauthorized. Please login again.');
        } else {
          setError('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="admin-dashboard"><div className="loading-spinner">Loading dashboard...</div></div>;
  }

  if (error) {
    return <div className="admin-dashboard"><p className="error">{error}</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of school performance and activities</p>
      </div>

      <div className="dashboard-content">
        {/* Top: Key Statistics */}
        <DashboardStats stats={stats} onNavigate={onNavigate} />

        {/* Middle: Visual Analytics */}
        <DashboardCharts analytics={analytics} />

        {/* Bottom: Activity & Events */}
        <div className="dashboard-bottom-grid">
          <div className="bottom-widget events-widget">
            <UpcomingEvents />
          </div>
          <div className="bottom-widget activity-widget">
            <GlobalActivityLog />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;