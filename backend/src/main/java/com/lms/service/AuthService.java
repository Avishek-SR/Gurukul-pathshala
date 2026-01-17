package com.lms.service;

import com.lms.dto.LoginRequest;
import com.lms.dto.LoginResponse;
import com.lms.model.User;
import com.lms.config.JwtUtil;
import com.lms.service.CaptchaService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CaptchaService captchaService;

    public AuthService(UserService userService,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       CaptchaService captchaService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.captchaService = captchaService;
    }

    public LoginResponse login(LoginRequest request) {

        // 0. Validate CAPTCHA (real LMS behavior)
        if (!captchaService.validate(request.getCaptchaId(), request.getCaptchaValue())) {
            throw new RuntimeException("Invalid CAPTCHA");
        }

        // 1. Find user by USER ID
        User user = userService.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

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
            throw new RuntimeException("Invalid credentials");
        }

        // 4. Successful login
        user.resetFailedAttempts();
        user.setLastLoginAt(LocalDateTime.now());
        userService.save(user);

        // 5. Generate JWT Token
        String token = jwtUtil.generateToken(
                user.getUserId(),
                user.getRole().name(),
                user.getName()
        );
        

        // 6. Build response
        LoginResponse response = new LoginResponse();
        response.setAccessToken(token);
        response.setTokenType("Bearer");
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setName(user.getName());
        response.setExpiresIn(86400L);

        return response;
    }


    public LoginResponse profile(String userId) {
        User user = userService.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LoginResponse response = new LoginResponse();
        response.setAccessToken(null); // no new token on profile
        response.setTokenType("Bearer");
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setName(user.getName());
        response.setExpiresIn(0L);

        return response;

    }
}    