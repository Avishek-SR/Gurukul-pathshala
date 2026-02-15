package com.lms.controller;

import com.lms.dto.ActivityTopicDTO;
import com.lms.dto.ClassroomActivityDTO;
import com.lms.model.User;

import com.lms.repository.UserRepository;
import com.lms.service.ClassroomActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
public class ClassroomActivityController {

    private final ClassroomActivityService activityService;
    private final UserRepository userRepository;

    // --- PARENT ACTIVITY ENDPOINTS ---

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ClassroomActivityDTO>> getActivities(@PathVariable Long courseId) {
        return ResponseEntity.ok(activityService.getActivitiesByCourse(courseId));
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ClassroomActivityDTO> createActivity(
            @RequestBody Map<String, Object> payload,
            Authentication authentication) {

        String userId = authentication.getName();
        User faculty = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Long courseId = Long.valueOf(payload.get("courseId").toString());
        String title = (String) payload.get("title");
        String description = (String) payload.get("description");
        return ResponseEntity.ok(activityService.createActivity(courseId, faculty.getId(), title, description));
    }

    @DeleteMapping("/{activityId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long activityId) {
        activityService.deleteActivity(activityId);
        return ResponseEntity.ok().build();
    }

    // --- TOPIC ENDPOINTS ---

    @GetMapping("/{activityId}/topics")
    public ResponseEntity<List<ActivityTopicDTO>> getTopics(@PathVariable Long activityId) {
        return ResponseEntity.ok(activityService.getTopicsByActivity(activityId));
    }

    @PostMapping("/{activityId}/topic/create")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ActivityTopicDTO> createTopic(
            @PathVariable Long activityId,
            @RequestBody Map<String, String> payload) {

        String title = payload.get("title");
        String description = payload.get("description");
        String studyMaterialUrl = payload.get("studyMaterialUrl");

        return ResponseEntity.ok(activityService.createTopic(activityId, title, description, studyMaterialUrl));
    }

    @PutMapping("/topic/{topicId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ActivityTopicDTO> updateTopic(
            @PathVariable Long topicId,
            @RequestBody Map<String, String> payload) {

        String title = payload.get("title");
        String description = payload.get("description");
        String studyMaterialUrl = payload.get("studyMaterialUrl");

        return ResponseEntity.ok(activityService.updateTopic(topicId, title, description, studyMaterialUrl));
    }

    @PostMapping("/topic/{topicId}/select")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ActivityTopicDTO> selectTopic(
            @PathVariable Long topicId,
            Authentication authentication) {

        String userId = authentication.getName();
        User student = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        return ResponseEntity.ok(activityService.assignTopic(topicId, student.getId()));
    }

    @PostMapping("/topic/{topicId}/unassign")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ActivityTopicDTO> unassignTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(activityService.unassignTopic(topicId));
    }

    @DeleteMapping("/topic/{topicId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long topicId) {
        activityService.deleteTopic(topicId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/topic/{topicId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ActivityTopicDTO> submitTopicWork(
            @PathVariable Long topicId,
            @RequestBody Map<String, String> payload) {

        String fileUrl = payload.get("fileUrl");
        return ResponseEntity.ok(activityService.submitTopicWork(topicId, fileUrl));
    }

    @PostMapping("/topic/{topicId}/verify")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ActivityTopicDTO> verifyTopicWork(
            @PathVariable Long topicId,
            @RequestBody Map<String, Object> payload) {

        String status = (String) payload.get("status");
        Integer grade = payload.containsKey("grade") ? (Integer) payload.get("grade") : null;
        String feedback = (String) payload.get("feedback");

        return ResponseEntity
                .ok(activityService.verifyTopicWork(topicId, com.lms.model.enums.SubmissionStatus.valueOf(status),
                        grade, feedback));
    }
}
