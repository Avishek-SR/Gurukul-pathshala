package com.lms.dto;

public class StaffDashboardDTO {

    private String welcomeMessage;
    private int totalTasks;
    private int pendingApprovals;
    private int completedToday;
    private int notifications;

    public String getWelcomeMessage() {
        return welcomeMessage;
    }

    public void setWelcomeMessage(String welcomeMessage) {
        this.welcomeMessage = welcomeMessage;
    }

    public int getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(int totalTasks) {
        this.totalTasks = totalTasks;
    }

    public int getPendingApprovals() {
        return pendingApprovals;
    }

    public void setPendingApprovals(int pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }

    public int getCompletedToday() {
        return completedToday;
    }

    public void setCompletedToday(int completedToday) {
        this.completedToday = completedToday;
    }

    public int getNotifications() {
        return notifications;
    }

    public void setNotifications(int notifications) {
        this.notifications = notifications;
    }
}
