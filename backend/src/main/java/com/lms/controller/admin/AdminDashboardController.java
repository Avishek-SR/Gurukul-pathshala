package com.lms.controller.admin;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.model.Role;
import com.lms.repository.CourseRepository;
import com.lms.repository.FacultyRepository;
import com.lms.repository.UserRepository;

@RestController
@RequestMapping("/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private com.lms.repository.AttendanceRepository attendanceRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> data = new HashMap<>();

        // Fetch real stats
        long totalStudents = userRepository.countByRoleAndActiveTrue(Role.STUDENT);
        long totalFaculty = facultyRepository.countByRoleAndActiveTrue(Role.FACULTY);
        long activeCourses = courseRepository.countByActiveTrue();
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();

        // Populate response
        data.put("status", "ok");
        data.put("totalStudents", totalStudents);
        data.put("totalFaculty", totalFaculty);
        data.put("activeCourses", activeCourses);
        data.put("totalUsers", totalUsers);
        data.put("totalCourses", totalCourses);

        // Placeholders for future modules
        data.put("totalBatches", 0);

        java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
        long todayLogins = userRepository.countByLastLoginAtAfter(startOfDay);
        data.put("todayLogins", todayLogins);

        data.put("revenue", 0);
        data.put("pendingRequests", 0);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> data = new HashMap<>();

        // 1. Gender Distribution
        long maleStudents = userRepository.countByRoleAndGender(Role.STUDENT, "Male");
        long femaleStudents = userRepository.countByRoleAndGender(Role.STUDENT, "Female");
        data.put("genderDistribution", Map.of("Male", maleStudents, "Female", femaleStudents));

        // 2. Attendance Trend (Last 7 Days)
        java.util.List<Map<String, Object>> attendanceTrend = new java.util.ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = today.minusDays(i);
            long presentCount = attendanceRepository.countByDateAndPresentTrue(date);
            attendanceTrend.add(Map.of("date", date.toString(), "present", presentCount));
        }
        data.put("attendanceTrend", attendanceTrend);

        // 3. Admission Trend (Last 6 Months - Simplified to monthly new students)
        // For MVP, we'll just show "New This Month" vs "Total" to avoid complex
        // aggregation queries
        java.time.LocalDateTime startOfMonth = java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long newStudentsThisMonth = userRepository.countByRoleAndCreatedAtAfter(Role.STUDENT, startOfMonth);
        data.put("admissionTrend", Map.of("newThisMonth", newStudentsThisMonth, "total",
                userRepository.countByRoleAndActiveTrue(Role.STUDENT)));

        return ResponseEntity.ok(data);
    }
}
