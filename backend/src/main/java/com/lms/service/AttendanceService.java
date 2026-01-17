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
     * - Uses authenticated faculty
     * - Resolves student and course from DB
     * - Prevents duplicate marking for the same day
     */
    public Attendance markAttendance(String studentUserId, Long courseId, boolean present) {

        // Resolve authenticated faculty (ensures endpoint is protected)
        String facultyUserId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        userRepository.findByUserId(facultyUserId)
                .orElseThrow(() -> new IllegalStateException("Authenticated faculty not found"));

        // Resolve student
        User student = userRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentUserId));

        // Resolve course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));

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
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));

        long total = attendanceRepository.countByStudentAndCourse(student, course);
        if (total == 0) {
            return 0;
        }

        long present = attendanceRepository.countByStudentAndCourseAndPresentTrue(student, course);
        return (int) ((present * 100) / total);
    }

    /**
     * Admin: get all attendance records
     */
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAllAttendance() {
        return attendanceRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin: get attendance for a specific student
     */
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceForStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));

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
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));

        return attendanceRepository.findByCourse(course)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin: save or update attendance from DTO
     */
    public void saveAttendance(AttendanceDTO dto) {
        User student = userRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + dto.getStudentId()));

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + dto.getCourseId()));

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setCourse(course);
        attendance.setDate(dto.getDate());
        attendance.setPresent(dto.isPresent());

        attendanceRepository.save(attendance);
    }

    /**
     * Mapper: Attendance -> AttendanceDTO
     */
    private AttendanceDTO toDTO(Attendance a) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(a.getId());
        dto.setStudentId(a.getStudent().getId());
        dto.setCourseId(a.getCourse().getId());
        dto.setDate(a.getDate());
        dto.setPresent(a.isPresent());
        return dto;
    }
}
