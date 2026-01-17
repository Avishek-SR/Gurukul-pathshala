package com.lms.dto;

public class FacultyDashboardDTO {

    private String welcomeMessage;
    private int totalSubjects;
    private int totalStudents;
    private int pendingAssignments;

    public String getWelcomeMessage() {
        return welcomeMessage;
    }

    public void setWelcomeMessage(String welcomeMessage) {
        this.welcomeMessage = welcomeMessage;
    }

    public int getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(int totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public int getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(int totalStudents) {
        this.totalStudents = totalStudents;
    }

    public int getPendingAssignments() {
        return pendingAssignments;
    }

    public void setPendingAssignments(int pendingAssignments) {
        this.pendingAssignments = pendingAssignments;
    }
}
