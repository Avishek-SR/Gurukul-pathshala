package com.lms.controller.admin;

import com.lms.model.User;
import com.lms.model.Role;
import com.lms.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/admin/faculty")  // CORRECT: No /api prefix since context-path adds it
public class AdminFacultyController {

    private static final Logger logger = LoggerFactory.getLogger(AdminFacultyController.class);
    private final UserService userService;

    public AdminFacultyController(UserService userService) {
        this.userService = userService;
        logger.info("=== AdminFacultyController INITIALIZED ===");
        logger.info("Controller mapped to: /admin/faculty");  // FIXED: Remove /api
        logger.info("Full URL will be: /api/admin/faculty (context-path adds /api)");
        logger.info("Available endpoints:");
        logger.info("  GET  /admin/faculty");           // FIXED: Remove /api
        logger.info("  GET  /admin/faculty/test");      // FIXED: Remove /api
        logger.info("  POST /admin/faculty");           // FIXED: Remove /api
        logger.info("  PUT  /admin/faculty/{id}/status"); // FIXED: Remove /api
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllFaculty() {
        logger.info("=== GET /admin/faculty called ===");  // FIXED: Remove /api
        try {
            logger.info("Calling userService.getUsersByRole(Role.FACULTY)...");
            List<User> faculty = userService.getUsersByRole(Role.FACULTY);
            logger.info("Success! Found {} faculty members", faculty.size());
            if (!faculty.isEmpty()) {
                logger.info("Faculty list: {}", faculty.stream()
                    .map(u -> String.format("[id=%d, userId=%s, name=%s]", 
                        u.getId(), u.getUserId(), u.getName()))
                    .toList());
            }
            return ResponseEntity.ok(faculty);
        } catch (Exception e) {
            logger.error("ERROR in getAllFaculty: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("=== TEST endpoint /admin/faculty/test called ===");  // FIXED: Remove /api
        return ResponseEntity.ok("AdminFacultyController is working! " + System.currentTimeMillis());
    }

    @PostMapping
    public ResponseEntity<User> createFaculty(@RequestBody User faculty) {
        logger.info("=== POST /admin/faculty called ===");  // FIXED: Remove /api
        logger.info("Request body: {}", faculty);
        faculty.setRole(Role.FACULTY);
        User createdFaculty = userService.createUser(faculty);
        logger.info("Faculty created successfully: {}", createdFaculty.getUserId());
        return ResponseEntity.ok(createdFaculty);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateFacultyStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        logger.info("=== PUT /admin/faculty/{}/status called, active={} ===", id, active);  // FIXED: Remove /api
        User updatedFaculty = userService.updateUserStatus(id, active);
        logger.info("Faculty status updated: userId={}, active={}", 
            updatedFaculty.getUserId(), updatedFaculty.isActive());
        return ResponseEntity.ok(updatedFaculty);
    }
}