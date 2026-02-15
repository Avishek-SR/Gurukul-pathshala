package com.lms.controller;

import com.lms.dto.StudentDashboardDTO;
import com.lms.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardDTO> dashboard() {
        return ResponseEntity.ok(studentService.getDashboard());
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        return ResponseEntity.ok(studentService.getProfile());
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getCourses() {
        return ResponseEntity.ok(studentService.getEnrolledCourses());
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getAssignments() {
        return ResponseEntity.ok(studentService.getAssignments());
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> getAttendance() {
        return ResponseEntity.ok(studentService.getAttendance());
    }
}
