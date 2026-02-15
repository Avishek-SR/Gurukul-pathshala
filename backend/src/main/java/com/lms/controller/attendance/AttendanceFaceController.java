package com.lms.controller.attendance;

import com.lms.dto.UserDTO;
import com.lms.model.User;
import com.lms.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/attendance/face-recognition")
public class AttendanceFaceController {

    private final EnrollmentService enrollmentService;

    public AttendanceFaceController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/course/{courseId}/descriptors")
    public ResponseEntity<List<UserDTO>> getCourseStudentDescriptors(@PathVariable Long courseId) {
        List<User> students = enrollmentService.getStudentsByCourse(courseId);

        List<UserDTO> descriptors = students.stream()
                .filter(s -> s.getFaceDescriptor() != null)
                .map(s -> {
                    UserDTO dto = new UserDTO();
                    dto.setId(s.getId());
                    dto.setUserId(s.getUserId());
                    dto.setName(s.getName());
                    dto.setFaceDescriptor(s.getFaceDescriptor());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(descriptors);
    }
}
