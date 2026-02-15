import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import facultyService from '../../../services/faculty.service';
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

const FacultyDashboard = () => {
  // Fetch dashboard data
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['facultyDashboardStats'],
    queryFn: facultyService.getDashboardStats,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const { data: coursesData } = useQuery({
    queryKey: ['facultyRecentCourses'],
    queryFn: facultyService.getRecentCourses,
    enabled: !!statsData
  });

  const { data: deadlinesData } = useQuery({
    queryKey: ['facultyUpcomingDeadlines'],
    queryFn: facultyService.getUpcomingDeadlines,
    enabled: !!statsData
  });

  const { data: announcementsData } = useQuery({
    queryKey: ['facultyRecentAnnouncements'],
    queryFn: facultyService.getRecentAnnouncements,
    enabled: !!statsData
  });
  const { data: timetableData } = useQuery({
    queryKey: ['facultyTimetable'],
    queryFn: async () => {
      // Direct call or service call
      const response = await fetch('http://localhost:8080/api/faculty/timetable', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch timetable');
      return response.json();
    }
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


      {/* Stats Grid */}
      <div className="stats-grid">


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
        {/* Your Schedule (New Card) */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Your Schedule (Today)</h3>
            <Link to="/faculty/timetable" className="view-all">
              View Full <ChevronRight size={16} />
            </Link>
          </div>
          <div className="card-content">
            {timetableData?.length > 0 ? (
              timetableData.filter(t => t.dayOfWeek === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase())
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((slot) => (
                  <div key={slot.id} className="course-item">
                    <div className="course-icon" style={{ background: '#e0f2fe' }}>
                      <Clock size={20} className="text-blue-600" />
                    </div>
                    <div className="course-info">
                      <h4>{slot.startTime.substring(0, 5)} - {slot.courseName}</h4>
                      <p className="course-code">{slot.program} {slot.year} • Room {slot.roomNumber || 'N/A'}</p>
                    </div>
                  </div>
                ))
            ) : <div className="empty-state-text">No classes scheduled for today.</div>}
            {timetableData?.filter(t => t.dayOfWeek === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()).length === 0 && timetableData?.length > 0 && (
              <div className="empty-state-text">No classes scheduled for today.</div>
            )}
          </div>
        </div>

        {/* My Subjects */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>My Subjects</h3>
            <Link to="/faculty/courses" className="view-all">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="card-content">
            {coursesData?.courses?.length > 0 ? coursesData.courses.slice(0, 4).map((course) => (
              <div key={course.id} className="course-item">
                <div className="course-icon">
                  <BookOpen size={20} />
                </div>
                <div className="course-info">
                  <h4>{course.name}</h4>
                  <p className="course-code">{course.code} • {course.program} {course.year}</p>
                </div>
                <Link to={`/faculty/courses/${course.id}`} className="course-link">
                  <ChevronRight size={20} />
                </Link>
              </div>
            )) : <div className="empty-state-text">No subjects assigned.</div>}
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