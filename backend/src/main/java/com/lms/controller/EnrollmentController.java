package com.lms.controller;

import com.lms.model.Enrollment;
import com.lms.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    /**
     * Enroll a student into a course.
     * Body example:
     * {
     *   "studentUserId": "rahul210503",
     *   "courseId": 1
     * }
     */
    @PostMapping
    public ResponseEntity<Enrollment> enroll(@RequestBody EnrollRequest request) {
        Enrollment enrollment = enrollmentService.enroll(request.getStudentUserId(), request.getCourseId());
        return ResponseEntity.ok(enrollment);
    }

    /**
     * Get all enrollments for the logged-in student.
     */
    @GetMapping("/me")
    public ResponseEntity<List<Enrollment>> myEnrollments() {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments());
    }

    // Simple inner DTO for request body
    public static class EnrollRequest {
        private String studentUserId;
        private Long courseId;

        public String getStudentUserId() {
            return studentUserId;
        }

        public void setStudentUserId(String studentUserId) {
            this.studentUserId = studentUserId;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }
    }
}
