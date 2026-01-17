package com.lms.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    // Add these fields that your code is trying to access
    @Column(name = "program")
    private String program;
    
    @Column(name = "year")
    private String year;
    
    @Column(name = "department")
    private String department;
    
    @Column(name = "designation")
    private String designation;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "dob")
    private LocalDate dob;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @Column(name = "password_updated_at")
    private LocalDateTime passwordUpdatedAt;
    
    @Column(name = "locked_at")
    private LocalDateTime lockedAt;
    
    @Column(name = "is_active", nullable = false)
    private boolean active = true;
    
    @Column(name = "is_locked", nullable = false)
    private boolean locked = false;
    
    @Column(name = "failed_attempts", nullable = false)
    private int failedAttempts = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public User() {}
    
    public User(String userId, String name, String email, String password, Role role) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    // Add these new getters/setters
    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }
    
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    
    public String getFullName() { 
        // Return fullName if set, otherwise return name
        return fullName != null ? fullName : name; 
    }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public LocalDate getDob() {
        return dob;
    }
    
    public void setDob(LocalDate dob) {
        this.dob = dob;
    }
    
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    
    public LocalDateTime getPasswordUpdatedAt() { return passwordUpdatedAt; }
    public void setPasswordUpdatedAt(LocalDateTime passwordUpdatedAt) { this.passwordUpdatedAt = passwordUpdatedAt; }
    
    public LocalDateTime getLockedAt() { return lockedAt; }
    public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }
    
    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Helper methods
    public void incrementFailedAttempts() {
        this.failedAttempts++;
    }
    
    public void resetFailedAttempts() {
        this.failedAttempts = 0;
    }
}