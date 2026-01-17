import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen,
  Users,
  FileText,
  Calendar,
  BarChart3,
  ChevronRight,
  Clock,
  Award,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Loader2
} from 'lucide-react';
import './FacultyDashboard.css';

// API service
const facultyDashboardAPI = {
  getDashboardStats: async () => {
    const response = await axios.get('/api/faculty/dashboard/stats');
    return response.data;
  },
  
  getRecentCourses: async () => {
    const response = await axios.get('/api/faculty/courses/recent');
    return response.data;
  },
  
  getUpcomingDeadlines: async () => {
    const response = await axios.get('/api/faculty/deadlines/upcoming');
    return response.data;
  },
  
  getRecentAnnouncements: async () => {
    const response = await axios.get('/api/announcements/faculty/recent');
    return response.data;
  }
};

const FacultyDashboard = () => {
  // Fetch dashboard data
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['facultyDashboardStats'],
    queryFn: facultyDashboardAPI.getDashboardStats,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const { data: coursesData } = useQuery({
    queryKey: ['facultyRecentCourses'],
    queryFn: facultyDashboardAPI.getRecentCourses,
    enabled: !!statsData
  });

  const { data: deadlinesData } = useQuery({
    queryKey: ['facultyUpcomingDeadlines'],
    queryFn: facultyDashboardAPI.getUpcomingDeadlines,
    enabled: !!statsData
  });

  const { data: announcementsData } = useQuery({
    queryKey: ['facultyRecentAnnouncements'],
    queryFn: facultyDashboardAPI.getRecentAnnouncements,
    enabled: !!statsData
  });

  // Loading state
  if (statsLoading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="loading-spinner" size={48} />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={64} />
        <h2>Unable to load dashboard</h2>
        <p>Please check your connection and try again</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Good Morning, Professor!</h2>
          <p>You have {deadlinesData?.count || 0} pending deadlines today.</p>
        </div>
        <div className="welcome-actions">
          <Link to="/faculty/courses/new" className="primary-btn">
            Create New Course
          </Link>
          <Link to="/faculty/calendar" className="secondary-btn">
            View Calendar
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>Active Courses</h3>
            <p className="stat-value">{statsData?.activeCourses || 0}</p>
            <span className="stat-trend positive">
              <TrendingUp size={16} />
              {statsData?.newCourses || 0} new this semester
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-value">{statsData?.totalStudents || 0}</p>
            <span className="stat-trend positive">
              <TrendingUp size={16} />
              {statsData?.newStudents || 0} newly enrolled
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>Pending Grading</h3>
            <p className="stat-value">{statsData?.pendingGrading || 0}</p>
            <span className="stat-trend urgent">
              {statsData?.overdueGrading || 0} overdue
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3>Avg. Attendance</h3>
            <p className="stat-value">{statsData?.attendanceRate || 0}%</p>
            <span className="stat-trend positive">
              +{statsData?.attendanceChange || 0}% from last week
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Courses */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Courses</h3>
            <Link to="/faculty/courses" className="view-all">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="card-content">
            {coursesData?.courses?.slice(0, 3).map((course) => (
              <div key={course.id} className="course-item">
                <div className="course-icon">
                  <BookOpen size={20} />
                </div>
                <div className="course-info">
                  <h4>{course.name}</h4>
                  <p className="course-code">{course.code} • {course.semester}</p>
                  <div className="course-meta">
                    <span className="meta-item">
                      <Users size={14} />
                      {course.studentCount} students
                    </span>
                    <span className="meta-item">
                      <FileText size={14} />
                      {course.assignmentCount} assignments
                    </span>
                  </div>
                </div>
                <Link to={`/faculty/courses/${course.id}`} className="course-link">
                  <ChevronRight size={20} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Upcoming Deadlines</h3>
            <Link to="/faculty/assignments" className="view-all">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="card-content">
            {deadlinesData?.deadlines?.slice(0, 4).map((deadline) => (
              <div key={deadline.id} className="deadline-item">
                <div className="deadline-date">
                  <div className="date-month">
                    {new Date(deadline.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="date-day">
                    {new Date(deadline.dueDate).getDate()}
                  </div>
                </div>
                <div className="deadline-info">
                  <h4>{deadline.title}</h4>
                  <p className="deadline-course">{deadline.course}</p>
                  <div className="deadline-meta">
                    <span className="meta-item">
                      <Clock size={14} />
                      {new Date(deadline.dueDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className={`priority-badge ${deadline.priority}`}>
                      {deadline.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Announcements</h3>
            <Link to="/faculty/announcements" className="view-all">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="card-content">
            {announcementsData?.announcements?.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="announcement-item">
                <div className="announcement-icon">
                  <MessageSquare size={20} />
                </div>
                <div className="announcement-content">
                  <h4>{announcement.title}</h4>
                  <p className="announcement-text">{announcement.content}</p>
                  <div className="announcement-meta">
                    <span className="meta-item">
                      {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="meta-item">
                      By {announcement.author}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="quick-actions-grid">
              <Link to="/faculty/attendance/take" className="quick-action">
                <Clock size={24} />
                <span>Take Attendance</span>
              </Link>
              <Link to="/faculty/grades/enter" className="quick-action">
                <Award size={24} />
                <span>Enter Grades</span>
              </Link>
              <Link to="/faculty/assignments/create" className="quick-action">
                <FileText size={24} />
                <span>Create Assignment</span>
              </Link>
              <Link to="/faculty/announcements/new" className="quick-action">
                <MessageSquare size={24} />
                <span>Post Announcement</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;