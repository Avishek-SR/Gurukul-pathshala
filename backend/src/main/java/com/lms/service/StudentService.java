package com.lms.service;

import com.lms.dto.StudentDashboardDTO;
import com.lms.model.Attendance;
import com.lms.model.User;
import com.lms.repository.AttendanceRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.NotificationRepository;
import com.lms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationRepository notificationRepository;

    public StudentService(UserRepository userRepository,
                          EnrollmentRepository enrollmentRepository,
                          AttendanceRepository attendanceRepository,
                          NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.notificationRepository = notificationRepository;
    }

    /**
     * Production-grade dashboard:
     * - Uses the currently authenticated student
     * - Uses only real, database-backed values
     * - Returns ZERO only for modules that truly do not exist yet
     */
    public StudentDashboardDTO getDashboard() {
        StudentDashboardDTO dto = new StudentDashboardDTO();

        // Get logged-in userId from Spring Security context
        String studentUserId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // Resolve real user
        User student = userRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new IllegalStateException("Authenticated student not found"));

        dto.setWelcomeMessage("Welcome " + student.getName());

        // Real data from DB
        long enrolled = enrollmentRepository.countByStudent(student);
        dto.setEnrolledCourses((int) enrolled);

        long unread = notificationRepository.countByUserAndReadFalse(student);
        dto.setUnreadNotifications((int) unread);

        // Calculate overall attendance percentage from real records
        List<Attendance> records = attendanceRepository.findByStudent(student);
        if (records.isEmpty()) {
            dto.setAttendancePercentage(0);
        } else {
            long present = records.stream().filter(Attendance::isPresent).count();
            int percent = (int) ((present * 100) / records.size());
            dto.setAttendancePercentage(percent);
        }

        /*
         * These require a Submission module which does not yet exist:
         * - Pending Assignments
         * - Completed Assignments
         *
         * Until StudentAssignment/Submission entities are implemented,
         * these must remain ZERO in production.
         */
        dto.setPendingAssignments(0);
        dto.setCompletedAssignments(0);

        return dto;
    }
}
