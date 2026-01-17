package com.lms.controller;

import com.lms.dto.StudentDashboardDTO;
import com.lms.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
