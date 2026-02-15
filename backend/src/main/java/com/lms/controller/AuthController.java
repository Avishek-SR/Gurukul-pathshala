package com.lms.controller;

import com.lms.dto.LoginRequest;
import com.lms.dto.LoginResponse;
import com.lms.service.AuthService;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/auth") // context-path already /api
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/login")
    public String loginPage() {
        return "AuthController is working!";
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) { // Use wildcard or specific error DTO
        System.out.println("Login attempt for user: " + request.getUserId());
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | SecurityException e) {
            System.err.println("Login error: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Login failed: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected login error: " + e.getMessage());
            e.printStackTrace();
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ErrorResponse("Internal Error: " + e.toString()));
        }
    }

    // Simple inner class for error response
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<LoginResponse> profile(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            LoginResponse response = authService.profile(authentication.getName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(401).build();
        }
    }
}