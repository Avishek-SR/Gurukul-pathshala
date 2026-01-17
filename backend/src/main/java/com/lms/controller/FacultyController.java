package com.lms.controller;

import com.lms.dto.FacultyDashboardDTO;
import com.lms.service.FacultyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<FacultyDashboardDTO> dashboard() {
        return ResponseEntity.ok(facultyService.getDashboard());
    }
}
