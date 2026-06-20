import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import facultyService from '../../../services/faculty.service';
import api from '../../../services/api';
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
  Loader2,
  CheckCircle2,
  Bell,
  Zap
} from 'lucide-react';
import './facultyDashboard.css';

const FacultyDashboard = () => {
  const facultyName = sessionStorage.getItem('name') || 'Faculty';
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
      const response = await api.get('/faculty/timetable');
      return response.data;
    }
  });

  const todaySchedule = timetableData
    ? timetableData
        .filter(t => t.dayOfWeek === now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase())
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];

  if (statsLoading) {
    return (
      <div className="fd-loading">
        <Loader2 className="fd-spinner" size={40} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="fd-error">
        <AlertCircle size={48} />
        <h2>Unable to load dashboard</h2>
        <p>Please check your connection and try again</p>
        <button onClick={() => window.location.reload()} className="fd-retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="fd-wrap">

      {/* ── Welcome Banner ── */}
      <div className="fd-welcome">
        <div className="fd-welcome-left">
          <p className="fd-greeting">{greeting},</p>
          <h2 className="fd-name">{facultyName} 👋</h2>
          <p className="fd-date">{today}</p>
        </div>
        <div className="fd-welcome-right">
          <div className="fd-welcome-stat">
            <span className="fd-ws-value">{todaySchedule.length}</span>
            <span className="fd-ws-label">Classes Today</span>
          </div>
          <div className="fd-welcome-divider" />
          <div className="fd-welcome-stat">
            <span className="fd-ws-value">{statsData?.pendingGrading || 0}</span>
            <span className="fd-ws-label">Pending Grades</span>
          </div>
          <div className="fd-welcome-divider" />
          <div className="fd-welcome-stat">
            <span className="fd-ws-value">{statsData?.totalStudents || 0}</span>
            <span className="fd-ws-label">Total Students</span>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div className="fd-stats">
        <div className="fd-stat-card fd-stat-teal">
          <div className="fd-stat-icon"><Users size={22} /></div>
          <div className="fd-stat-body">
            <span className="fd-stat-val">{statsData?.totalStudents || 0}</span>
            <span className="fd-stat-lbl">Total Students</span>
            <span className="fd-stat-sub positive"><TrendingUp size={12}/> {statsData?.newStudents || 0} newly enrolled</span>
          </div>
        </div>
        <div className="fd-stat-card fd-stat-orange">
          <div className="fd-stat-icon"><FileText size={22} /></div>
          <div className="fd-stat-body">
            <span className="fd-stat-val">{statsData?.pendingGrading || 0}</span>
            <span className="fd-stat-lbl">Pending Grading</span>
            <span className="fd-stat-sub warn">{statsData?.overdueGrading || 0} overdue</span>
          </div>
        </div>
        <div className="fd-stat-card fd-stat-green">
          <div className="fd-stat-icon"><BarChart3 size={22} /></div>
          <div className="fd-stat-body">
            <span className="fd-stat-val">{statsData?.attendanceRate || 0}%</span>
            <span className="fd-stat-lbl">Avg. Attendance</span>
            <span className="fd-stat-sub positive"><TrendingUp size={12}/> +{statsData?.attendanceChange || 0}% this week</span>
          </div>
        </div>
        <div className="fd-stat-card fd-stat-purple">
          <div className="fd-stat-icon"><BookOpen size={22} /></div>
          <div className="fd-stat-body">
            <span className="fd-stat-val">{coursesData?.courses?.length || 0}</span>
            <span className="fd-stat-lbl">My Subjects</span>
            <span className="fd-stat-sub neutral">Active this semester</span>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="fd-grid">

        {/* Today's Schedule — spans left 2/3 */}
        <div className="fd-card fd-schedule">
          <div className="fd-card-header">
            <div className="fd-card-title">
              <Clock size={18} className="fd-card-icon" />
              <h3>Today's Schedule</h3>
            </div>
            <Link to="/faculty/timetable" className="fd-view-all">View Full <ChevronRight size={15}/></Link>
          </div>
          <div className="fd-card-body">
            {todaySchedule.length > 0 ? todaySchedule.map((slot, i) => (
              <div key={slot.id} className="fd-schedule-row">
                <div className="fd-time-badge">{slot.startTime.substring(0, 5)}</div>
                <div className="fd-schedule-info">
                  <span className="fd-course-name">{slot.courseName}</span>
                  <span className="fd-course-meta">{slot.program} {slot.year} &bull; Room {slot.roomNumber || 'N/A'}</span>
                </div>
                <CheckCircle2 size={16} className="fd-done-icon" />
              </div>
            )) : (
              <div className="fd-empty"><Calendar size={36}/><p>No classes today — enjoy your day!</p></div>
            )}
          </div>
        </div>

        {/* Quick Actions — right 1/3 */}
        <div className="fd-card fd-quick">
          <div className="fd-card-header">
            <div className="fd-card-title">
              <Zap size={18} className="fd-card-icon" />
              <h3>Quick Actions</h3>
            </div>
          </div>
          <div className="fd-card-body fd-qa-body">
            <Link to="/faculty/attendance/take" className="fd-qa-btn fd-qa-teal">
              <Clock size={20} />
              <span>Take Attendance</span>
            </Link>
            <Link to="/faculty/grades/enter" className="fd-qa-btn fd-qa-purple">
              <Award size={20} />
              <span>Enter Grades</span>
            </Link>
            <Link to="/faculty/assignments/create" className="fd-qa-btn fd-qa-orange">
              <FileText size={20} />
              <span>Create Assignment</span>
            </Link>
            <Link to="/faculty/announcements/new" className="fd-qa-btn fd-qa-green">
              <MessageSquare size={20} />
              <span>Post Announcement</span>
            </Link>
          </div>
        </div>

        {/* My Subjects */}
        <div className="fd-card fd-subjects">
          <div className="fd-card-header">
            <div className="fd-card-title">
              <BookOpen size={18} className="fd-card-icon" />
              <h3>My Subjects</h3>
            </div>
            <Link to="/faculty/courses" className="fd-view-all">View All <ChevronRight size={15}/></Link>
          </div>
          <div className="fd-card-body">
            {coursesData?.courses?.length > 0 ? coursesData.courses.slice(0, 5).map((course) => (
              <div key={course.id} className="fd-subject-row">
                <div className="fd-subject-dot" />
                <div className="fd-subject-info">
                  <span className="fd-course-name">{course.name}</span>
                  <span className="fd-course-meta">{course.code} &bull; {course.program} {course.year}</span>
                </div>
                <Link to={`/faculty/courses/${course.id}`} className="fd-arrow"><ChevronRight size={18}/></Link>
              </div>
            )) : <div className="fd-empty"><BookOpen size={32}/><p>No subjects assigned</p></div>}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="fd-card fd-deadlines">
          <div className="fd-card-header">
            <div className="fd-card-title">
              <AlertCircle size={18} className="fd-card-icon" />
              <h3>Upcoming Deadlines</h3>
            </div>
            <Link to="/faculty/assignments" className="fd-view-all">View All <ChevronRight size={15}/></Link>
          </div>
          <div className="fd-card-body">
            {deadlinesData?.deadlines?.length > 0 ? deadlinesData.deadlines.slice(0, 4).map((d) => (
              <div key={d.id} className="fd-deadline-row">
                <div className="fd-date-box">
                  <span className="fd-date-mon">{new Date(d.dueDate).toLocaleDateString('en-US', {month:'short'})}</span>
                  <span className="fd-date-day">{new Date(d.dueDate).getDate()}</span>
                </div>
                <div className="fd-deadline-info">
                  <span className="fd-course-name">{d.title}</span>
                  <span className="fd-course-meta">{d.course}</span>
                </div>
                <span className={`fd-priority fd-p-${d.priority?.toLowerCase()}`}>{d.priority}</span>
              </div>
            )) : <div className="fd-empty"><CheckCircle2 size={32}/><p>No upcoming deadlines</p></div>}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="fd-card fd-announcements">
          <div className="fd-card-header">
            <div className="fd-card-title">
              <Bell size={18} className="fd-card-icon" />
              <h3>Recent Announcements</h3>
            </div>
            <Link to="/faculty/announcements" className="fd-view-all">View All <ChevronRight size={15}/></Link>
          </div>
          <div className="fd-card-body">
            {announcementsData?.announcements?.length > 0 ? announcementsData.announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="fd-announcement-row">
                <div className="fd-ann-icon"><Bell size={16}/></div>
                <div className="fd-ann-info">
                  <span className="fd-course-name">{a.title}</span>
                  <p className="fd-ann-text">{a.content}</p>
                  <span className="fd-course-meta">
                    {new Date(a.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})} &bull; By {a.author}
                  </span>
                </div>
              </div>
            )) : <div className="fd-empty"><Bell size={32}/><p>No announcements yet</p></div>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;