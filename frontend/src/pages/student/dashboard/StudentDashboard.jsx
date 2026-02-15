import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { student } = useOutletContext(); // Basic profile from layout
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/student/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          // Fetch subjects separately to show in My Subjects card
          const subjectsRes = await fetch('http://localhost:8080/api/student/courses', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const subjects = subjectsRes.ok ? await subjectsRes.json() : [];

          setDashboardData({ ...data, subjects });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="student-dashboard fade-in">


      {/* Stats Grid */}
      <div className="dashboard-stats">
        <div className="d-stat-card blue">
          <div className="icon-wrapper">
            <i className="fas fa-book-open"></i>
          </div>
          <div className="stat-info">
            <h3>{dashboardData?.enrolledCourses || 0}</h3>
            <p>Enrolled Courses</p>
          </div>
        </div>

        <div className="d-stat-card green">
          <div className="icon-wrapper">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-info">
            <h3>{dashboardData?.attendancePercentage || 0}%</h3>
            <p>Attendance</p>
          </div>
        </div>

        <div className="d-stat-card purple">
          <div className="icon-wrapper">
            <i className="fas fa-tasks"></i>
          </div>
          <div className="stat-info">
            <h3>{dashboardData?.pendingAssignments || 0}</h3>
            <p>Pending Tasks</p>
          </div>
        </div>

        <div className="d-stat-card orange">
          <div className="icon-wrapper">
            <i className="fas fa-bell"></i>
          </div>
          <div className="stat-info">
            <h3>{dashboardData?.unreadNotifications || 0}</h3>
            <p>Notifications</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Access & Calendar */}
      <div className="dashboard-main-grid">
        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-grid">
            <Link to="/student/courses" className="action-btn">
              <i className="fas fa-chalkboard-teacher"></i>
              <span>My Classes</span>
            </Link>
            <Link to="/student/assignments" className="action-btn">
              <i className="fas fa-file-alt"></i>
              <span>Assignments</span>
            </Link>
            <Link to="/student/attendance" className="action-btn">
              <i className="fas fa-user-check"></i>
              <span>Attendance</span>
            </Link>
            <Link to="/student/fees" className="action-btn">
              <i className="fas fa-receipt"></i>
              <span>Pay Fees</span>
            </Link>
          </div>
        </div>

        {/* Recent Notices / Events Placeholder */}
        <div className="dashboard-card events-widget">
          <div className="card-header">
            <h3>Upcoming Events</h3>
          </div>
          <div className="events-list">
            <div className="empty-state">
              <i className="fas fa-calendar-day"></i>
              <p>No upcoming events scheduled.</p>
            </div>
          </div>
        </div>
      </div>
      {/* My Subjects Card */}
      <div className="dashboard-card my-subjects">
        <div className="card-header">
          <h3>My Subjects</h3>
          <Link to="/student/courses" className="view-all">View All <i className="fas fa-arrow-right"></i></Link>
        </div>
        <div className="subjects-list-dashboard">
          {dashboardData?.subjects?.length > 0 ? (
            dashboardData.subjects.map(subj => (
              <div key={subj.id} className="subject-item-mini">
                <div className="subj-icon"><i className="fas fa-book"></i></div>
                <div className="subj-info">
                  <h4>{subj.name}</h4>
                  <span>{subj.code}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-mini">No subjects assigned yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;