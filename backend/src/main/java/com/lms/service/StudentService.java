package com.lms.service;

import com.lms.dto.StudentDashboardDTO;
import com.lms.model.Assignment;
import com.lms.model.Attendance;
import com.lms.model.Course;
import com.lms.model.Enrollment;
import com.lms.model.User;
import com.lms.repository.AssignmentRepository;
import com.lms.repository.AttendanceRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.NotificationRepository;
import com.lms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationRepository notificationRepository;
    private final AssignmentRepository assignmentRepository;

    public StudentService(UserRepository userRepository,
            EnrollmentRepository enrollmentRepository,
            AttendanceRepository attendanceRepository,
            NotificationRepository notificationRepository,
            AssignmentRepository assignmentRepository) {
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.notificationRepository = notificationRepository;
        this.assignmentRepository = assignmentRepository;
    }

    private User getAuthenticatedStudent() {
        String studentUserId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new IllegalStateException("Authenticated student not found"));
    }

    public Map<String, Object> getProfile() {
        User student = getAuthenticatedStudent();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", student.getUserId());
        profile.put("name", student.getName());
        profile.put("email", student.getEmail());
        profile.put("section", "Section " + (student.getSection() != null ? student.getSection() : "N/A"));
        profile.put("program", student.getProgram());
        profile.put("dob", student.getDob());
        // Calculate basic stats for profile
        profile.put("attendance", calculateAttendancePercentage(student));
        return profile;
    }

    public StudentDashboardDTO getDashboard() {
        StudentDashboardDTO dto = new StudentDashboardDTO();
        User student = getAuthenticatedStudent();

        dto.setWelcomeMessage("Welcome " + student.getName());

        long enrolled = enrollmentRepository.countByStudent(student);
        dto.setEnrolledCourses((int) enrolled);

        long unread = notificationRepository.countByUserAndReadFalse(student);
        dto.setUnreadNotifications((int) unread);

        dto.setAttendancePercentage(calculateAttendancePercentage(student));

        // Pending assignments
        List<Course> courses = enrollmentRepository.findByStudent(student).stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());

        if (courses.isEmpty()) {
            dto.setPendingAssignments(0);
        } else {
            List<Assignment> assignments = assignmentRepository.findByCourseInAndActiveTrue(courses);
            // In a real app check submission status, for now just count all active
            // assignments as pending or assume some logic
            dto.setPendingAssignments(assignments.size());
        }

        dto.setCompletedAssignments(0); // Placeholder

        return dto;
    }

    private int calculateAttendancePercentage(User student) {
        List<Attendance> records = attendanceRepository.findByStudent(student);
        if (records.isEmpty()) {
            return 0;
        }
        long present = records.stream().filter(Attendance::isPresent).count();
        return (int) ((present * 100) / records.size());
    }

    public List<Map<String, Object>> getEnrolledCourses() {
        User student = getAuthenticatedStudent();
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        return enrollments.stream().map(e -> {
            Course c = e.getCourse();
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("code", c.getCode());
            map.put("name", c.getName());
            map.put("description", c.getDescription());
            map.put("fee", c.getFee());
            map.put("duration", c.getDuration());

            if (c.getFaculty() != null) {
                map.put("facultyName", c.getFaculty().getName());
            } else {
                map.put("facultyName", "TBA");
            }
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAssignments() {
        User student = getAuthenticatedStudent();
        List<Course> courses = enrollmentRepository.findByStudent(student).stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());

        if (courses.isEmpty())
            return new ArrayList<>();

        List<Assignment> assignments = assignmentRepository.findByCourseInAndActiveTrue(courses);

        return assignments.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("title", a.getTitle());
            map.put("description", a.getDescription());
            map.put("dueDate", a.getDueAt());
            map.put("courseName", a.getCourse().getName());
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAttendance() {
        User student = getAuthenticatedStudent();
        List<Attendance> records = attendanceRepository.findByStudent(student);

        return records.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("date", r.getDate());
            map.put("present", r.isPresent());
            map.put("courseName", r.getCourse().getName());
            return map;
        }).collect(Collectors.toList());
    }
}
