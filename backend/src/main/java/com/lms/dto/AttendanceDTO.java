package com.lms.dto;

public class AttendanceDTO {

    private Long id;
    private Long studentId;
    private Long courseId;
    private String studentUserId; // Added for display
    private String facultyUserId; // Added for display
    private java.time.LocalDate date;
    private boolean present;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentUserId() {
        return studentUserId;
    }

    public void setStudentUserId(String studentUserId) {
        this.studentUserId = studentUserId;
    }

    public String getFacultyUserId() {
        return facultyUserId;
    }

    public void setFacultyUserId(String facultyUserId) {
        this.facultyUserId = facultyUserId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public java.time.LocalDate getDate() {
        return date;
    }

    public void setDate(java.time.LocalDate date) {
        this.date = date;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }
}
