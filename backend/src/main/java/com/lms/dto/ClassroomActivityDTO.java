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
public class ClassroomActivityDTO {
    private Long id;
    private String title;
    private String description;

    // Course details
    private Long courseId;
    private String courseName;
    private String courseCode;

    // Creator details
    private Long createdById;
    private String createdByName;

    // Children Topics
    private java.util.List<ActivityTopicDTO> topics; // Optional: include topics if needed

    private LocalDateTime createdAt;
}
