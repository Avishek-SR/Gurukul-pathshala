package com.lms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicController {

    @GetMapping("/api/health")
    public String health() {
        return "OK";
    }

    @GetMapping("/api/public/hello")
    public String hello() {
        return "Hello from School Management System!";
    }
}
