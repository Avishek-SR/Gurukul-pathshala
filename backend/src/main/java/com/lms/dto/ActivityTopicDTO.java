package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityTopicDTO {
    private Long id;
    private String title;
    private String description;

    // Parent Activity details
    private Long activityId;
    private String activityTitle;

    // Assigned Student details
    private Long assignedStudentId;
    private String assignedStudentName;
    private String assignedStudentUserId;

    private LocalDateTime createdAt;

    // Submission Details
    private String submissionUrl;
    private String studyMaterialUrl;
    private com.lms.model.enums.SubmissionStatus submissionStatus;
    private LocalDateTime submissionDate;
    private Integer grade;
    private String feedback;
}
