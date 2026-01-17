package com.lms.dto;

public class UserDTO {
    private Long id;
    private String userId;
    private String name;
    private String email;
    private String role;
    private String program;
    private String year;
    private String department;
    private String designation;
    private boolean active;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }
    
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}