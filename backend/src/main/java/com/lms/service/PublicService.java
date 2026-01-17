package com.lms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PublicService {

    @Value("${spring.application.name:School Management System}")
    private String appName;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    /**
     * Basic public landing information.
     * Used by landing page before login.
     */
    public Map<String, Object> getLandingInfo() {
        Map<String, Object> data = new HashMap<>();
        data.put("name", appName);
        data.put("tagline", "Smart Learning Management System");
        data.put("timestamp", LocalDateTime.now().toString());
        return data;
    }

    /**
     * Health check endpoint data.
     * Used by load balancers / uptime monitors.
     */
    public Map<String, Object> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("time", LocalDateTime.now().toString());
        return health;
    }

    /**
     * Placeholder for CAPTCHA or verification token generation.
     * Real implementation can integrate Google reCAPTCHA later.
     */
    public Map<String, Object> getCaptchaStub() {
        Map<String, Object> captcha = new HashMap<>();
        captcha.put("enabled", false);
        captcha.put("message", "Captcha service not yet configured");
        return captcha;
    }
}
