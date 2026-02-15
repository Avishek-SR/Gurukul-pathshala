// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';
import FacultyLayout from '../layouts/FacultyLayout';

// Public pages
import LoginPage from '../pages/public/Login/LoginPage';
import HomePage from '../pages/public/home/HomePage';
import AdmissionsPage from "../pages/public/Admissions/AdmissionsPage";
import AcademicPage from '../pages/public/academics/AcademicPage';
import AboutPage from '../pages/public/About/AboutPage';

// Admin pages
import AdminDashboard from '../pages/admin/dashboard/AdminDashboard';
import Admins from '../pages/admin/users/Admins';
import TimetableManagement from '../pages/admin/timetable/TimetableManagement';

// Faculty pages
import FacultyDashboard from '../pages/faculty/dashboard/FacultyDashboard';
import FacultyCourses from '../pages/faculty/courses/FacultyCourses';
import FacultyProfile from '../pages/faculty/profile/FacultyProfile';
import FacultyAssignments from '../pages/faculty/assignments/FacultyAssignments';
import FacultyAnnouncements from '../pages/faculty/announcements/FacultyAnnouncements';
import MarkAttendance from '../pages/faculty/attendance/MarkAttendance';
import UploadGrades from '../pages/faculty/grading/UploadGrades';
import FacultyTimetable from '../pages/faculty/timetable/FacultyTimetable';

// Student pages
import StudentDashboard from '../pages/student/dashboard/StudentDashboard';
import StudentProfile from '../pages/student/profile/StudentProfile';
import MyClasses from '../pages/student/courses/MyClasses';
import StudentAssignments from '../pages/student/assignments/StudentAssignments';
import StudentAttendance from '../pages/student/attendance/StudentAttendance';
import StudentFees from '../pages/student/payments/StudentFees';
import StudentTimetable from '../pages/student/timetable/StudentTimetable';

// Shared pages
import Notices from '../pages/shared/Notices';
import Settings from '../pages/shared/Settings';

import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const RequireAuth = ({ role, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log("RequireAuth: Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    console.log(`RequireAuth: Role mismatch. Required: ${role}, Current: ${user?.role}. User:`, user);
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Routes>
      {/* Home Page with MainLayout */}
      <Route path="/" element={
        <MainLayout>
          <HomePage />
        </MainLayout>
      } />

      {/* Academics Page */}
      <Route path="/academics" element={
        <MainLayout>
          <AcademicPage />
        </MainLayout>
      } />

      {/* About Page */}
      <Route path="/about" element={
        <MainLayout>
          <AboutPage />
        </MainLayout>
      } />

      {/* Admissions Page */}
      <Route path="/admissions" element={
        <MainLayout>
          <AdmissionsPage />
        </MainLayout>
      } />

      {/* Login Page */}
      <Route path="/login" element={<LoginPage />} />


      {/* Admin Layout + Routes */}
      <Route
        path="/admin"
        element={
          <RequireAuth role="ADMIN">
            <AdminLayout onLogout={handleLogout} />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Admins />} />
        <Route path="timetable" element={<TimetableManagement />} />
        <Route path="notices" element={<Notices />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Faculty Layout + Routes */}
      <Route
        path="/faculty"
        element={
          <RequireAuth role="FACULTY">
            <FacultyLayout />
          </RequireAuth>
        }
      >
        <Route index element={<FacultyDashboard />} />
        <Route path="profile" element={<FacultyProfile />} />
        <Route path="courses" element={<FacultyCourses />} />
        <Route path="assignments" element={<FacultyAssignments />} />
        <Route path="announcements" element={<FacultyAnnouncements />} />
        <Route path="attendance" element={<MarkAttendance />} />
        <Route path="grades" element={<UploadGrades />} />
        <Route path="timetable" element={<FacultyTimetable />} />
      </Route>

      {/* Student Layout + Routes */}
      <Route
        path="/student"
        element={
          <RequireAuth role="STUDENT">
            <StudentLayout onLogout={handleLogout} />
          </RequireAuth>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="courses" element={<MyClasses />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="fees" element={<StudentFees />} />
        <Route path="notices" element={<Notices />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={
        <MainLayout>
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
          </div>
        </MainLayout>
      } />
    </Routes>
  );
};

export default AppRoutes;