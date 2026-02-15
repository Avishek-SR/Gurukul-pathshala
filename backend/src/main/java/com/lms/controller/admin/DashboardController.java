package com.lms.controller.admin;

import com.lms.model.Role;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import com.lms.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // User Counts
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalFaculty = userRepository.countByRole(Role.FACULTY);

        // Course Counts
        long totalCourses = courseRepository.count();
        long activeCourses = courseRepository.countByActiveTrue();

        // Batch Count (Approximation: Placeholder)
        long totalBatches = 0; // Placeholder

        // Today's Logins
        long todayLogins = activityLogService.getTodayLoginCount();

        stats.put("totalUsers", totalUsers);
        stats.put("totalStudents", totalStudents);
        stats.put("totalFaculty", totalFaculty);
        stats.put("totalCourses", totalCourses);
        stats.put("activeCourses", activeCourses);
        stats.put("totalBatches", totalBatches);
        stats.put("todayLogins", todayLogins);

        return ResponseEntity.ok(stats);
    }
}
