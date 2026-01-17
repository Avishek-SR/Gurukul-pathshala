package com.lms.dto;

public class AdminDashboardDTO {

    private long totalUsers;
    private long activeUsers;
    private long studentCount;
    private long facultyCount;
    private long staffCount;
    private long adminCount;

    private long newRegistrationsToday;

    // System overview
    private String systemStatus;
    private String serverTime;

    // Getters and Setters
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(long studentCount) {
        this.studentCount = studentCount;
    }

    public long getFacultyCount() {
        return facultyCount;
    }

    public void setFacultyCount(long facultyCount) {
        this.facultyCount = facultyCount;
    }

    public long getStaffCount() {
        return staffCount;
    }

    public void setStaffCount(long staffCount) {
        this.staffCount = staffCount;
    }

    public long getAdminCount() {
        return adminCount;
    }

    public void setAdminCount(long adminCount) {
        this.adminCount = adminCount;
    }

    public long getNewRegistrationsToday() {
        return newRegistrationsToday;
    }

    public void setNewRegistrationsToday(long newRegistrationsToday) {
        this.newRegistrationsToday = newRegistrationsToday;
    }

    public String getSystemStatus() {
        return systemStatus;
    }

    public void setSystemStatus(String systemStatus) {
        this.systemStatus = systemStatus;
    }

    public String getServerTime() {
        return serverTime;
    }

    public void setServerTime(String serverTime) {
        this.serverTime = serverTime;
    }
}
