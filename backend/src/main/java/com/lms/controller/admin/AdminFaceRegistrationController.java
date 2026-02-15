package com.lms.controller.admin;

import com.lms.model.User;
import com.lms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/face-registration")
public class AdminFaceRegistrationController {

    private final UserRepository userRepository;

    public AdminFaceRegistrationController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/{studentId}")
    public ResponseEntity<Void> registerFace(
            @PathVariable Long studentId,
            @RequestBody Map<String, String> payload) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        String descriptor = payload.get("descriptor");
        student.setFaceDescriptor(descriptor);
        userRepository.save(student);

        return ResponseEntity.ok().build();
    }

}
