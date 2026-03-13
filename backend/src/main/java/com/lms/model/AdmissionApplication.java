package com.lms.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "admission_applications")
public class AdmissionApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // A human-readable application ID like ADM-2026-0001
    @Column(name = "application_id", unique = true, nullable = false)
    private String applicationId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(nullable = false)
    private LocalDate dob;
    
    @Column(nullable = false)
    private String gender;

    @Column(name = "parent_name", nullable = false)
    private String parentName;

    @Column(name = "parent_email", nullable = false)
    private String parentEmail;

    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    @Column(name = "class_applying", nullable = false)
    private String classApplying;

    @Column(columnDefinition = "TEXT")
    private String message;

    // PENDING, APPROVED, REJECTED
    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "submission_date", nullable = false, updatable = false)
    private LocalDateTime submissionDate;

    // The user ID generated after approval
    @Column(name = "generated_student_id")
    private String generatedStudentId;

    @PrePersist
    protected void onCreate() {
        submissionDate = LocalDateTime.now();
    }

    public AdmissionApplication() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getClassApplying() { return classApplying; }
    public void setClassApplying(String classApplying) { this.classApplying = classApplying; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

    public String getGeneratedStudentId() { return generatedStudentId; }
    public void setGeneratedStudentId(String generatedStudentId) { this.generatedStudentId = generatedStudentId; }
}
