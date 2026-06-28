// src/services/gradeService.js
// Grades are stored in localStorage keyed by studentId.
// Students are fetched live from the backend.

import api from './api';

// ─── Grade calculation helpers ──────────────────────────────────────────────

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
  let totalCredits = 0, weightedGpa4 = 0, weightedGpa10 = 0, totalScore = 0, maxTotal = 0, hasFailed = false;

  const enrichedSubjects = student.subjects.map(sub => {
    const m = calculateGradeMetrics(sub.score, sub.maxScore || 100);
    if (m.grade === 'F') hasFailed = true;
    totalCredits   += Number(sub.credit) || 0;
    weightedGpa4   += m.gpa4        * (Number(sub.credit) || 0);
    weightedGpa10  += m.gradePoint  * (Number(sub.credit) || 0);
    totalScore     += Number(sub.score)          || 0;
    maxTotal       += Number(sub.maxScore || 100);
    return { ...sub, ...m };
  });

  const gpa      = totalCredits > 0 ? (weightedGpa4  / totalCredits).toFixed(2) : '0.00';
  const gpa10    = totalCredits > 0 ? (weightedGpa10 / totalCredits).toFixed(2) : '0.00';
  const percentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;

  let resultStatus = 'PASSED WITH DISTINCTION';
  if (hasFailed)              resultStatus = 'NEEDS RE-EXAMINATION';
  else if (percentage < 60)   resultStatus = 'PASSED SECOND CLASS';
  else if (percentage < 75)   resultStatus = 'PASSED FIRST CLASS';

  return { ...student, subjects: enrichedSubjects, gpa, gpa10, totalCredits, totalScore, maxTotalScore: maxTotal, percentage, resultStatus };
};

// ─── localStorage grade storage (keyed by student userId) ───────────────────

const GRADE_KEY = (userId) => `gurukul_grades_${userId}`;

const loadGrades = (userId) => {
  try {
    const raw = localStorage.getItem(GRADE_KEY(userId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveGrades = (userId, gradeData) => {
  localStorage.setItem(GRADE_KEY(userId), JSON.stringify(gradeData));
};

// ─── API helpers ─────────────────────────────────────────────────────────────

/** Fetch all students from backend (ADMIN token) */
export const fetchStudentsFromDB = async () => {
  const res = await api.get('/admin/users/role/STUDENT');
  return res.data;
};

/** Fetch school settings from backend */
export const fetchSchoolSettings = async () => {
  const res = await api.get('/admin/settings');
  const settings = {};
  for (const s of (res.data || [])) {
    settings[s.settingKey] = s.settingValue;
  }
  return settings;
};

/** Merge DB student with locally-stored grades, returning enriched object */
export const mergeStudentWithGrades = (dbStudent) => {
  const stored = loadGrades(dbStudent.userId);
  const merged = {
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
    academicYear:     stored?.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    semester:         stored?.semester  || 'Current Term',
  };
  return enrichStudentGradeData(merged);
};

export const gradeService = {
  /** Save grades for one student to localStorage */
  saveStudentGrades: (userId, subjects, status = 'Evaluated', remarks = '', academicYear = '', semester = '') => {
    const gradeData = { subjects, status, remarks, academicYear, semester, updatedAt: new Date().toISOString() };
    saveGrades(userId, gradeData);
    return gradeData;
  },

  /** Load grades for one student from localStorage */
  getStudentGrades: (userId) => loadGrades(userId),
};
