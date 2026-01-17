package com.lms.controller;

import com.lms.dto.StaffDashboardDTO;
import com.lms.service.StaffService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StaffDashboardDTO> dashboard() {
        return ResponseEntity.ok(staffService.getDashboard());
    }
}
