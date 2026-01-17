
package com.lms.dto;

import java.util.Map;

public class StatsDTO {
    private Long totalUsers;
    private Long activeUsers;
    private Long facultyCount;
    private Long studentCount;
    private Long newRegistrations;
    private Map<String, Long> usersByRole;
    
    // Getters and Setters
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    
    public Long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(Long activeUsers) { this.activeUsers = activeUsers; }
    
    public Long getFacultyCount() { return facultyCount; }
    public void setFacultyCount(Long facultyCount) { this.facultyCount = facultyCount; }
    
    public Long getStudentCount() { return studentCount; }
    public void setStudentCount(Long studentCount) { this.studentCount = studentCount; }
    
    public Long getNewRegistrations() { return newRegistrations; }
    public void setNewRegistrations(Long newRegistrations) { this.newRegistrations = newRegistrations; }
    
    public Map<String, Long> getUsersByRole() { return usersByRole; }
    public void setUsersByRole(Map<String, Long> usersByRole) { this.usersByRole = usersByRole; }
}