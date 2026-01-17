package com.lms.controller.admin;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/dashboard")
public class AdminDashboardController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "ok");
        data.put("message", "Admin dashboard is working");

        return ResponseEntity.ok(data);
    }
}
