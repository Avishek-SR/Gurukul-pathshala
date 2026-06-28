// src/services/gradeService.js
// Role-aware grade service:
//   ADMIN  → /admin/users/role/STUDENT
//   FACULTY → /faculty/students  (new endpoint)
//   STUDENT → reads own profile from sessionStorage
// Grades are stored in localStorage keyed by studentId.

import api from './api';

// ─── Grade calculation ─────────────────────────────────────────────────────

export const calculateGradeMetrics = (score, maxScore = 100) => {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  let grade = 'F', gradePoint = 0.0, gpa4 = 0.0, color = '#EF4444';
  if (percentage >= 90)      { grade = 'A+'; gradePoint = 10.0; gpa4 = 4.0; color = '#10B981'; }
  else if (percentage >= 80) { grade = 'A';  gradePoint = 9.0;  gpa4 = 3.7; color = '#3B82F6'; }
  else if (percentage >= 75) { grade = 'B+'; gradePoint = 8.0;  gpa4 = 3.3; color = '#6366F1'; }
  else if (percentage >= 70) { grade = 'B';  gradePoint = 7.0;  gpa4 = 3.0; color = '#F59E0B'; }
  else if (percentage >= 60) { grade = 'C';  gradePoint = 6.0;  gpa4 = 2.3; color = '#EC4899'; }
  else if (percentage >= 50) { grade = 'D';  gradePoint = 5.0;  gpa4 = 2.0; color = '#8B5CF6'; }
  return { percentage, grade, gradePoint, gpa4, color };
};

export const enrichStudentGradeData = (student) => {
  if (!student?.subjects?.length) {
    return { ...student, gpa: '0.00', gpa10: '0.00', totalCredits: 0, percentage: 0, resultStatus: 'N/A', subjects: [] };
  }
  let totalCredits = 0, wGpa4 = 0, wGpa10 = 0, totalScore = 0, maxTotal = 0, hasFailed = false;
  const enrichedSubjects = student.subjects.map(sub => {
    const m = calculateGradeMetrics(sub.score, sub.maxScore || 100);
    if (m.grade === 'F') hasFailed = true;
    totalCredits += Number(sub.credit) || 0;
    wGpa4        += m.gpa4       * (Number(sub.credit) || 0);
    wGpa10       += m.gradePoint * (Number(sub.credit) || 0);
    totalScore   += Number(sub.score) || 0;
    maxTotal     += Number(sub.maxScore || 100);
    return { ...sub, ...m };
  });
  const gpa       = totalCredits > 0 ? (wGpa4  / totalCredits).toFixed(2) : '0.00';
  const gpa10     = totalCredits > 0 ? (wGpa10 / totalCredits).toFixed(2) : '0.00';
  const percentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;
  let resultStatus = 'PASSED WITH DISTINCTION';
  if (hasFailed)            resultStatus = 'NEEDS RE-EXAMINATION';
  else if (percentage < 60) resultStatus = 'PASSED SECOND CLASS';
  else if (percentage < 75) resultStatus = 'PASSED FIRST CLASS';
  return { ...student, subjects: enrichedSubjects, gpa, gpa10, totalCredits, totalScore, maxTotalScore: maxTotal, percentage, resultStatus };
};

// ─── localStorage grade storage ────────────────────────────────────────────
const GRADE_KEY = (userId) => `gurukul_grades_${userId}`;

const loadGrades = (userId) => {
  try { const r = localStorage.getItem(GRADE_KEY(userId)); return r ? JSON.parse(r) : null; }
  catch { return null; }
};
const saveGrades = (userId, data) => localStorage.setItem(GRADE_KEY(userId), JSON.stringify(data));

// ─── Merge DB student + locally-saved grades ────────────────────────────────
export const mergeStudentWithGrades = (dbStudent) => {
  const stored = loadGrades(dbStudent.userId);
  return enrichStudentGradeData({
    id:               dbStudent.id,
    userId:           dbStudent.userId,
    rollNo:           dbStudent.userId,
    name:             dbStudent.name,
    email:            dbStudent.email,
    program:          dbStudent.program || 'General',
    section:          dbStudent.section || '',
    gender:           dbStudent.gender  || '',
    dob:              dbStudent.dob     || '',
    profilePictureUrl: dbStudent.profilePictureUrl || null,
    status:           stored?.status    || 'Pending',
    remarks:          stored?.remarks   || '',
    subjects:         stored?.subjects  || [],
    academicYear:     stored?.academicYear || '',
    semester:         stored?.semester  || '',
  });
};

// ─── API helpers ────────────────────────────────────────────────────────────

/**
 * Fetch students based on user role:
 * - ADMIN  → /admin/users/role/STUDENT (full list)
 * - FACULTY → /faculty/students        (full list, new endpoint)
 * - STUDENT → returns the single logged-in student from session
 */
export const fetchStudentsFromDB = async (userRole) => {
  if (userRole === 'STUDENT') {
    const stored = sessionStorage.getItem('user');
    if (stored) return [JSON.parse(stored)];
    return [];
  }
  if (userRole === 'ADMIN') {
    const res = await api.get('/admin/users/role/STUDENT');
    return res.data;
  }
  // FACULTY: use the new /faculty/students endpoint
  const res = await api.get('/faculty/students');
  return res.data;
};

/** Fetch school settings */
export const fetchSchoolSettings = async () => {
  try {
    const res = await api.get('/admin/settings');
    const s = {};
    for (const item of (res.data || [])) s[item.settingKey] = item.settingValue;
    return s;
  } catch {
    return {};
  }
};

/** Get current user's role from sessionStorage */
export const getCurrentUserRole = () => {
  try {
    const u = JSON.parse(sessionStorage.getItem('user') || '{}');
    return u.role || '';
  } catch { return ''; }
};

export const gradeService = {
  saveStudentGrades: (userId, subjects, status = 'Evaluated', remarks = '', academicYear = '', semester = '') => {
    const data = { subjects, status, remarks, academicYear, semester, updatedAt: new Date().toISOString() };
    saveGrades(userId, data);
    return data;
  },
  getStudentGrades: (userId) => loadGrades(userId),
};
