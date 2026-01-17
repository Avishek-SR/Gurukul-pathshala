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
import AdmissionsPage from "../pages/public/Admissions/Admissionspage";
import AcademicPage from '../pages/public/Academics/AcademicPage';
import AboutPage from '../pages/public/About/AboutPage';
// Admin pages
import AdminDashboard from '../pages/admin/dashboard/AdminDashboard';
import Admins from '../pages/admin/users/Admins';

// Faculty pages
import FacultyDashboard from '../pages/faculty/dashboard/FacultyDashboard';
import FacultyCourses from '../pages/faculty/courses/FacultyCourses';

// Student pages
import StudentDashboard from '../pages/student/dashboard/StudentDashboard';
import StudentProfile from '../pages/student/profile/StudentProfile';



// Shared pages
import Notices from '../pages/shared/Notices';
import Settings from '../pages/shared/Settings';

const RequireAuth = ({ role, children }) => {
  const raw = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!raw || !token) {
    return <Navigate to="/login" replace />;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (role && parsed.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
        <Route path="courses" element={<FacultyCourses />} />
        {/* 
        <Route path="assignments" element={<FacultyAssignments />} />
        <Route path="students" element={<FacultyStudents />} />
        <Route path="grades" element={<FacultyGrades />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="analytics" element={<FacultyAnalytics />} />
        <Route path="announcements" element={<FacultyAnnouncements />} />
        <Route path="calendar" element={<FacultyCalendar />} />
        <Route path="profile" element={<FacultyProfile />} />
        <Route path="settings" element={<FacultySettings />} />
        */}
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