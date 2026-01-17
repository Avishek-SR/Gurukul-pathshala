package com.lms.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    public void logUserCreation(Long userId, String role) {
        log.info("AUDIT: User created - ID: {}, Role: {}", userId, role);
    }

    public void logUserStatusChange(Long userId, boolean fromStatus, boolean toStatus, String updatedBy) {
        log.info("AUDIT: User status changed - UserID: {}, From: {}, To: {}, By: {}", 
            userId, fromStatus, toStatus, updatedBy);
    }

    public void logSuccessfulLogin(Long userId) {
        log.info("AUDIT: Successful login - UserID: {}", userId);
    }

    public void logFailedLogin(String email) {
        log.warn("AUDIT: Failed login attempt - Email: {}", email);
    }

    public void logLogout(Long userId) {
        log.info("AUDIT: User logged out - UserID: {}", userId);
    }

    public void logPasswordChange(Long userId) {
        log.info("AUDIT: Password changed - UserID: {}", userId);
    }

    public void logAccountLock(Long userId) {
        log.warn("AUDIT: Account locked - UserID: {}", userId);
    }
    
    public void logLockedAccountAttempt(Long userId, String email) {
        log.warn("AUDIT: Locked account login attempt - UserID: {}, Email: {}", userId, email);
    }
    
    public void logUserDeactivation(Long userId, String deactivatedBy) {
        log.info("AUDIT: User deactivated - UserID: {}, By: {}", userId, deactivatedBy);
    }
}