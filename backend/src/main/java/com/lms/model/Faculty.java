package com.lms.model;

/**
 * Faculty is a domain view over User with role = FACULTY.
 * It is NOT a JPA entity because the system uses a single
 * `users` table for all identities (STUDENT, FACULTY, STAFF, ADMIN).
 *
 * Real systems avoid duplicate tables for each role.
 * All persistence happens in `User`.
 */
public class Faculty {

    private Long id;
    private String userId;
    private String name;
    private String email;
    private String department;
    private String designation;
    private boolean active;

    public Faculty() {}

    public Faculty(User user) {
        this.id = user.getId();
        this.userId = user.getUserId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.department = user.getDepartment();
        this.designation = user.getDesignation();
        this.active = user.isActive();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
