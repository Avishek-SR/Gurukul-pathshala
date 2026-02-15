package com.lms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activity_topics")
public class ActivityTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private ClassroomActivity activity;

    /**
     * The student assigned to this topic.
     * If null, the topic is open for selection.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_student_id")
    private User assignedStudent;

    @Column(name = "submission_url")
    private String submissionUrl;

    @Column(name = "study_material_url")
    private String studyMaterialUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "submission_status")
    @Builder.Default
    private com.lms.model.enums.SubmissionStatus submissionStatus = com.lms.model.enums.SubmissionStatus.PENDING;

    @Column(name = "submission_date")
    private LocalDateTime submissionDate;

    @Column(name = "grade")
    private Integer grade;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
