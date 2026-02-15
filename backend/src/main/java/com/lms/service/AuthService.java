package com.lms.service;

import com.lms.dto.LoginRequest;
import com.lms.dto.LoginResponse;
import com.lms.model.User;
// import com.lms.config.JwtUtil; // REMOVED

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService; // CHANGED
    private final CaptchaService captchaService;
    private final ActivityLogService activityLogService;

    public AuthService(UserService userService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            CaptchaService captchaService,
            ActivityLogService activityLogService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.captchaService = captchaService;
        this.activityLogService = activityLogService;
    }

    public LoginResponse login(LoginRequest request) {

        // 0. Validate CAPTCHA (real LMS behavior)
        if (!captchaService.validate(request.getCaptchaId(), request.getCaptchaValue())) {
            throw new RuntimeException("Invalid CAPTCHA");
        }

        // 1. Find user by USER ID
        User user = userService.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

        // 2. Account checks
        if (user.isLocked()) {
            throw new RuntimeException("Account is locked. Contact admin.");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated.");
        }

        // 3. Password validation
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.incrementFailedAttempts();

            if (user.getFailedAttempts() >= 5) {
                user.setLocked(true);
                user.setLockedAt(LocalDateTime.now());
            }

            userService.save(user);
            throw new RuntimeException("Password mismatch for user: " + request.getUserId());
        }

        // 4. Successful login
        user.resetFailedAttempts();
        user.setLastLoginAt(LocalDateTime.now());
        userService.save(user);

        // 5. Generate JWT Token
        String token = jwtService.generateToken(user);

        // Log login activity
        try {
            activityLogService.logActivity(user.getUserId(), "LOGIN", "User logged in successfully");
        } catch (Exception e) {
            System.err.println("Failed to log activity: " + e.getMessage());
        }

        // 6. Build response
        LoginResponse response = new LoginResponse();
        response.setAccessToken(token);
        response.setTokenType("Bearer");
        response.setId(user.getId());
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());

        if (user.getRole() != null) {
            response.setRole(user.getRole().name());
        } else {
            // Fallback or log error
            System.err.println("User has NO ROLE: " + user.getUserId());
            response.setRole("STUDENT"); // Default fallback
        }

        response.setName(user.getName());
        response.setExpiresIn(86400L);

        // Map additional fields with null safety
        response.setDepartment(user.getDepartment());
        response.setDesignation(user.getDesignation());
        response.setActive(user.isActive());

        // Map Student fields
        response.setDob(user.getDob());
        response.setProgram(user.getProgram());
        response.setSection(user.getSection());
        response.setParentEmail(user.getParentEmail());
        response.setParentPhoneNumber(user.getParentPhoneNumber());

        response.setMobileNumber(user.getMobileNumber());
        response.setCitizenship(user.getCitizenship());
        response.setGender(user.getGender());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setSuperAdmin(user.isSuperAdmin());

        // Handle Permissions
        if (user.getPermissions() != null) {
            response.setPermissions(user.getPermissions());
        } else {
            response.setPermissions(new java.util.HashSet<>());
        }

        return response;
    }

    public LoginResponse profile(String userIdOrEmail) {
        User user;
        if (userIdOrEmail.contains("@")) {
            user = userService.findByEmail(userIdOrEmail)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + userIdOrEmail));
        } else {
            user = userService.findByUserId(userIdOrEmail)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userIdOrEmail));
        }

        LoginResponse response = new LoginResponse();
        response.setAccessToken(null); // no new token on profile
        response.setTokenType("Bearer");
        response.setId(user.getId());
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setName(user.getName());
        response.setExpiresIn(0L);

        // Map additional fields
        response.setDepartment(user.getDepartment());
        response.setDesignation(user.getDesignation());
        response.setActive(user.isActive());

        // Map Student fields
        response.setDob(user.getDob());
        response.setProgram(user.getProgram());
        response.setSection(user.getSection());
        response.setParentEmail(user.getParentEmail());
        response.setParentPhoneNumber(user.getParentPhoneNumber());

        response.setMobileNumber(user.getMobileNumber());
        response.setCitizenship(user.getCitizenship());
        response.setGender(user.getGender());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setSuperAdmin(user.isSuperAdmin());
        response.setPermissions(user.getPermissions());

        return response;

    }
}