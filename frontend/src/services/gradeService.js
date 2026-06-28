// src/services/gradeService.js

const STORAGE_KEY = 'gurukul_student_grades_v1';

const initialStudents = [
  {
    id: 'STU-2025-001',
    rollNo: 'CS-101',
    name: 'Avishek Sharma',
    program: 'B.Tech Computer Science',
    semester: 'Semester 4',
    academicYear: '2025-2026',
    email: 'avishek.sharma@gurukul.edu',
    profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'Evaluated',
    remarks: 'Excellent academic performance across all theoretical and lab modules.',
    subjects: [
      { code: 'CS401', subject: 'Mathematics IV', credit: 4, score: 95, maxScore: 100 },
      { code: 'CS402', subject: 'Physics & Semiconductor Devices', credit: 3, score: 88, maxScore: 100 },
      { code: 'CS403', subject: 'Design & Analysis of Algorithms', credit: 4, score: 96, maxScore: 100 },
      { code: 'HU401', subject: 'Professional English & Communication', credit: 3, score: 82, maxScore: 100 },
      { code: 'CS404', subject: 'Database Management Systems', credit: 4, score: 91, maxScore: 100 },
      { code: 'CS405', subject: 'Operating Systems', credit: 4, score: 89, maxScore: 100 }
    ]
  },
  {
    id: 'STU-2025-002',
    rollNo: 'CS-102',
    name: 'Priya Patel',
    program: 'B.Tech Computer Science',
    semester: 'Semester 4',
    academicYear: '2025-2026',
    email: 'priya.patel@gurukul.edu',
    profilePictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'Evaluated',
    remarks: 'Consistent hard work demonstrated. Good grasp of database fundamentals.',
    subjects: [
      { code: 'CS401', subject: 'Mathematics IV', credit: 4, score: 78, maxScore: 100 },
      { code: 'CS402', subject: 'Physics & Semiconductor Devices', credit: 3, score: 85, maxScore: 100 },
      { code: 'CS403', subject: 'Design & Analysis of Algorithms', credit: 4, score: 82, maxScore: 100 },
      { code: 'HU401', subject: 'Professional English & Communication', credit: 3, score: 90, maxScore: 100 },
      { code: 'CS404', subject: 'Database Management Systems', credit: 4, score: 88, maxScore: 100 },
      { code: 'CS405', subject: 'Operating Systems', credit: 4, score: 79, maxScore: 100 }
    ]
  },
  {
    id: 'STU-2025-003',
    rollNo: 'CS-103',
    name: 'Rohan Gupta',
    program: 'B.Tech Computer Science',
    semester: 'Semester 4',
    academicYear: '2025-2026',
    email: 'rohan.gupta@gurukul.edu',
    profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'Pending',
    remarks: 'Needs improvement in algorithmic logic and core mathematics.',
    subjects: [
      { code: 'CS401', subject: 'Mathematics IV', credit: 4, score: 65, maxScore: 100 },
      { code: 'CS402', subject: 'Physics & Semiconductor Devices', credit: 3, score: 72, maxScore: 100 },
      { code: 'CS403', subject: 'Design & Analysis of Algorithms', credit: 4, score: 68, maxScore: 100 },
      { code: 'HU401', subject: 'Professional English & Communication', credit: 3, score: 75, maxScore: 100 },
      { code: 'CS404', subject: 'Database Management Systems', credit: 4, score: 80, maxScore: 100 },
      { code: 'CS405', subject: 'Operating Systems', credit: 4, score: 70, maxScore: 100 }
    ]
  },
  {
    id: 'STU-2025-004',
    rollNo: 'EC-201',
    name: 'Ananya Singh',
    program: 'B.Tech Electronics',
    semester: 'Semester 4',
    academicYear: '2025-2026',
    email: 'ananya.singh@gurukul.edu',
    profilePictureUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    status: 'Evaluated',
    remarks: 'Outstanding performance in microcontrollers and digital systems.',
    subjects: [
      { code: 'EC401', subject: 'Circuit Theory & Networks', credit: 4, score: 92, maxScore: 100 },
      { code: 'EC402', subject: 'Digital Signal Processing', credit: 4, score: 89, maxScore: 100 },
      { code: 'EC403', subject: 'Electromagnetic Field Theory', credit: 3, score: 85, maxScore: 100 },
      { code: 'EC404', subject: 'Microprocessors & Microcontrollers', credit: 4, score: 94, maxScore: 100 },
      { code: 'EC405', subject: 'Analog Integrated Circuits', credit: 3, score: 88, maxScore: 100 }
    ]
  },
  {
    id: 'STU-2025-005',
    rollNo: 'MBA-301',
    name: 'Vikram Malhotra',
    program: 'MBA',
    semester: 'Semester 2',
    academicYear: '2025-2026',
    email: 'vikram.malhotra@gurukul.edu',
    profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'Evaluated',
    remarks: 'Strong strategic thinking and leadership qualities observed.',
    subjects: [
      { code: 'MB201', subject: 'Financial Management & Accounting', credit: 4, score: 88, maxScore: 100 },
      { code: 'MB202', subject: 'Marketing Strategy', credit: 3, score: 92, maxScore: 100 },
      { code: 'MB203', subject: 'Organizational Behavior', credit: 3, score: 85, maxScore: 100 },
      { code: 'MB204', subject: 'Quantitative Methods in Business', credit: 4, score: 80, maxScore: 100 },
      { code: 'MB205', subject: 'Supply Chain & Operations', credit: 3, score: 84, maxScore: 100 }
    ]
  }
];

// Calculate Letter Grade and Grade Points based on score percentage
export const calculateGradeMetrics = (score, maxScore = 100) => {
  const percentage = Math.round((score / maxScore) * 100);
  let grade = 'F';
  let gradePoint = 0.0;
  let gpa4 = 0.0;
  let color = '#F44336';

  if (percentage >= 90) {
    grade = 'A+'; gradePoint = 10.0; gpa4 = 4.0; color = '#10B981'; // Emerald
  } else if (percentage >= 80) {
    grade = 'A'; gradePoint = 9.0; gpa4 = 3.7; color = '#3B82F6'; // Blue
  } else if (percentage >= 75) {
    grade = 'B+'; gradePoint = 8.0; gpa4 = 3.3; color = '#6366F1'; // Indigo
  } else if (percentage >= 70) {
    grade = 'B'; gradePoint = 7.0; gpa4 = 3.0; color = '#F59E0B'; // Amber
  } else if (percentage >= 60) {
    grade = 'C'; gradePoint = 6.0; gpa4 = 2.3; color = '#EC4899'; // Pink
  } else if (percentage >= 50) {
    grade = 'D'; gradePoint = 5.0; gpa4 = 2.0; color = '#8B5CF6'; // Purple
  } else {
    grade = 'F'; gradePoint = 0.0; gpa4 = 0.0; color = '#EF4444'; // Red
  }

  return { percentage, grade, gradePoint, gpa4, color };
};

// Calculate cumulative statistics for a student
export const enrichStudentGradeData = (student) => {
  if (!student || !student.subjects || student.subjects.length === 0) {
    return {
      ...student,
      gpa: '0.00',
      gpa10: '0.00',
      totalCredits: 0,
      totalScore: 0,
      maxTotalScore: 0,
      percentage: 0,
      resultStatus: 'N/A'
    };
  }

  let totalCredits = 0;
  let weightedGpa4Sum = 0;
  let weightedGpa10Sum = 0;
  let totalScore = 0;
  let maxTotalScore = 0;
  let hasFailed = false;

  const enrichedSubjects = student.subjects.map(sub => {
    const metrics = calculateGradeMetrics(sub.score, sub.maxScore || 100);
    if (metrics.grade === 'F') hasFailed = true;
    totalCredits += (Number(sub.credit) || 0);
    weightedGpa4Sum += metrics.gpa4 * (Number(sub.credit) || 0);
    weightedGpa10Sum += metrics.gradePoint * (Number(sub.credit) || 0);
    totalScore += Number(sub.score) || 0;
    maxTotalScore += Number(sub.maxScore || 100);

    return {
      ...sub,
      ...metrics
    };
  });

  const gpa = totalCredits > 0 ? (weightedGpa4Sum / totalCredits).toFixed(2) : '0.00';
  const gpa10 = totalCredits > 0 ? (weightedGpa10Sum / totalCredits).toFixed(2) : '0.00';
  const percentage = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;
  
  let resultStatus = 'PASSED WITH DISTINCTION';
  if (hasFailed) {
    resultStatus = 'NEEDS RE-EXAMINATION';
  } else if (percentage < 75 && percentage >= 60) {
    resultStatus = 'PASSED FIRST CLASS';
  } else if (percentage < 60) {
    resultStatus = 'PASSED SECOND CLASS';
  }

  return {
    ...student,
    subjects: enrichedSubjects,
    gpa,
    gpa10,
    totalCredits,
    totalScore,
    maxTotalScore,
    percentage,
    resultStatus
  };
};

export const gradeService = {
  getStudents: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStudents));
        return initialStudents.map(enrichStudentGradeData);
      }
      const parsed = JSON.parse(stored);
      return parsed.map(enrichStudentGradeData);
    } catch (e) {
      console.error('Failed to load grades from localStorage:', e);
      return initialStudents.map(enrichStudentGradeData);
    }
  },

  getStudentById: (studentId) => {
    const all = gradeService.getStudents();
    return all.find(s => String(s.id) === String(studentId) || String(s.rollNo) === String(studentId));
  },

  saveStudentGrades: (studentId, updatedSubjects, status = 'Evaluated', remarks = '') => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let students = stored ? JSON.parse(stored) : [...initialStudents];
      const index = students.findIndex(s => String(s.id) === String(studentId));
      
      if (index !== -1) {
        students[index] = {
          ...students[index],
          subjects: updatedSubjects,
          status,
          remarks
        };
      } else {
        // If not found, create entry
        students.push({
          id: studentId,
          rollNo: `RO-${studentId}`,
          name: 'Student ' + studentId,
          program: 'General Studies',
          semester: 'Semester 1',
          academicYear: '2025-2026',
          status,
          remarks,
          subjects: updatedSubjects
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      return enrichStudentGradeData(students[index] || students[students.length - 1]);
    } catch (e) {
      console.error('Failed to save student grades:', e);
      throw e;
    }
  },

  addNewStudentSubject: (studentId, newSubject) => {
    const student = gradeService.getStudentById(studentId);
    if (!student) return null;
    const updatedSubjects = [...student.subjects, { ...newSubject, maxScore: 100 }];
    return gradeService.saveStudentGrades(studentId, updatedSubjects, student.status, student.remarks);
  },

  resetToDefault: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStudents));
    return initialStudents.map(enrichStudentGradeData);
  }
};
