package com.lms.service;

import com.lms.model.Attendance;
import com.lms.model.Course;
import com.lms.model.User;
import com.lms.repository.AttendanceRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import com.lms.dto.AttendanceDTO;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceService {

        private final AttendanceRepository attendanceRepository;
        private final CourseRepository courseRepository;
        private final UserRepository userRepository;

        public AttendanceService(AttendanceRepository attendanceRepository,
                        CourseRepository courseRepository,
                        UserRepository userRepository) {
                this.attendanceRepository = attendanceRepository;
                this.courseRepository = courseRepository;
                this.userRepository = userRepository;
        }

        /**
         * Faculty marks attendance for a student in a course for today.
         */
        public Attendance markAttendance(Long studentId, Long courseId, boolean present) {

                // Resolve authenticated faculty
                String facultyUserId = SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();

                userRepository.findByUserId(facultyUserId)
                                .orElseThrow(() -> new IllegalStateException("Authenticated faculty not found"));

                // Resolve student
                User student = userRepository.findById(studentId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Student not found with id: " + studentId));

                // Resolve course
                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Course not found with id: " + courseId));

                LocalDate today = LocalDate.now();

                // Prevent duplicate attendance for same day
                Attendance existing = attendanceRepository
                                .findByStudentAndCourseAndDate(student, course, today)
                                .orElse(null);

                if (existing != null) {
                        existing.setPresent(present);
                        return attendanceRepository.save(existing);
                }

                Attendance attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setCourse(course);
                attendance.setDate(today);
                attendance.setPresent(present);

                return attendanceRepository.save(attendance);
        }

        /**
         * Get all attendance records for the logged-in student.
         */
        @Transactional(readOnly = true)
        public List<Attendance> getMyAttendance() {
                String studentUserId = SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();

                User student = userRepository.findByUserId(studentUserId)
                                .orElseThrow(() -> new IllegalStateException("Authenticated student not found"));

                return attendanceRepository.findByStudent(student);
        }

        /**
         * Calculate attendance percentage for a student in a course.
         */
        @Transactional(readOnly = true)
        public int calculatePercentage(String studentUserId, Long courseId) {

                User student = userRepository.findByUserId(studentUserId)
                                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentUserId));

                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Course not found with id: " + courseId));

                long total = attendanceRepository.countByStudentAndCourse(student, course);
                if (total == 0) {
                        return 0;
                }

                long present = attendanceRepository.countByStudentAndCourseAndPresentTrue(student, course);
                return (int) ((present * 100) / total);
        }

        /**
         * Admin: get all attendance records, with optional date filtering
         */
        @Transactional(readOnly = true)
        public List<AttendanceDTO> getAllAttendance(Long courseId, Long studentId, String program, String section, LocalDate date) {
                List<Attendance> records;

                if (studentId != null) {
                        User student = userRepository.findById(studentId)
                                        .orElseThrow(() -> new IllegalArgumentException("Student not found"));
                        records = attendanceRepository.findByStudent(student);
                        // apply date filter in-memory if provided
                        if (date != null) {
                                records = records.stream()
                                                .filter(a -> date.equals(a.getDate()))
                                                .collect(Collectors.toList());
                        }
                } else if (courseId != null) {
                        Course course = courseRepository.findById(courseId)
                                        .orElseThrow(() -> new IllegalArgumentException("Course not found"));
                        if (date != null) {
                                records = attendanceRepository.findByCourseAndDate(course, date);
                        } else {
                                records = attendanceRepository.findByCourse(course);
                        }
                } else if (program != null && !program.isBlank()) {
                        if (section != null && !section.isBlank()) {
                                if (date != null) {
                                        records = attendanceRepository.findByStudentProgramAndStudentSectionAndDate(program, section, date);
                                } else {
                                        records = attendanceRepository.findByStudentProgramAndStudentSection(program, section);
                                }
                        } else {
                                if (date != null) {
                                        records = attendanceRepository.findByStudentProgramAndDate(program, date);
                                } else {
                                        records = attendanceRepository.findByStudentProgram(program);
                                }
                        }
                } else {
                        if (date != null) {
                                records = attendanceRepository.findByDate(date);
                        } else {
                                records = attendanceRepository.findAll();
                        }
                }

                return records.stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }

        /**
         * Admin: get all attendance records (Legacy/No-Args)
         */
        @Transactional(readOnly = true)
        public List<AttendanceDTO> getAllAttendance() {
                return getAllAttendance(null, null, null, null, null);
        }

        /**
         * Admin: get attendance for a specific student
         */
        @Transactional(readOnly = true)
        public List<AttendanceDTO> getAttendanceForStudent(Long studentId) {
                User student = userRepository.findById(studentId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Student not found with id: " + studentId));

                return attendanceRepository.findByStudent(student)
                                .stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }

        /**
         * Admin: get attendance for a specific course
         */
        @Transactional(readOnly = true)
        public List<AttendanceDTO> getAttendanceForCourse(Long courseId) {
                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Course not found with id: " + courseId));

                return attendanceRepository.findByCourse(course)
                                .stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }

        /**
         * Mapper: Attendance -> AttendanceDTO
         */
        private AttendanceDTO toDTO(Attendance a) {
                AttendanceDTO dto = new AttendanceDTO();
                dto.setId(a.getId());
                dto.setStudentId(a.getStudent().getId());
                dto.setStudentUserId(a.getStudent().getUserId()); // Set the string ID
                if (a.getCourse().getFaculty() != null) {
                        dto.setFacultyUserId(a.getCourse().getFaculty().getUserId());
                }
                dto.setCourseId(a.getCourse().getId());
                dto.setDate(a.getDate());
                dto.setPresent(a.isPresent());
                return dto;
        }

        /**
         * Mark attendance for a batch of students.
         */
        public void markBatchAttendance(com.lms.dto.BatchAttendanceDTO batchDTO) {
                Course course = courseRepository.findById(batchDTO.getCourseId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Course not found: " + batchDTO.getCourseId()));

                LocalDate date = batchDTO.getDate();

                for (com.lms.dto.BatchAttendanceDTO.StudentAttendanceDTO sDTO : batchDTO.getStudents()) {
                        User student = userRepository.findByUserId(sDTO.getStudentId())
                                        .orElseThrow(() -> new IllegalArgumentException(
                                                        "Student not found: " + sDTO.getStudentId()));

                        // Find existing or create new
                        Attendance attendance = attendanceRepository
                                        .findByStudentAndCourseAndDate(student, course, date)
                                        .orElseGet(() -> {
                                                Attendance newAtt = new Attendance();
                                                newAtt.setStudent(student);
                                                newAtt.setCourse(course);
                                                newAtt.setDate(date);
                                                return newAtt;
                                        });

                        attendance.setPresent(sDTO.isPresent());
                        attendanceRepository.save(attendance);
                }
        }
}
