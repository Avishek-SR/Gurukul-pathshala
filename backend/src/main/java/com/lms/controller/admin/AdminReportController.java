package com.lms.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/reports")
public class AdminReportController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getReports() {
        // Temporary real endpoint to stop 404/500.
        // Later this will be wired to a ReportService.
        return ResponseEntity.ok(Collections.emptyList());
    }
}
