package com.lms.controller;

import com.lms.dto.FacultyDashboardDTO;
import com.lms.model.Assignment;
import com.lms.model.AssignmentSubmission;
import com.lms.service.AssignmentService;
import com.lms.service.FacultyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/faculty")
public class FacultyController {

    private final FacultyService facultyService;
    private final com.lms.service.EnrollmentService enrollmentService;
    private final com.lms.service.AttendanceService attendanceService;
    private final AssignmentService assignmentService;

    public FacultyController(FacultyService facultyService,
            com.lms.service.EnrollmentService enrollmentService,
            com.lms.service.AttendanceService attendanceService,
            AssignmentService assignmentService) {
        this.facultyService = facultyService;
        this.enrollmentService = enrollmentService;
        this.attendanceService = attendanceService;
        this.assignmentService = assignmentService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<FacultyDashboardDTO> dashboard() {
        return ResponseEntity.ok(facultyService.getDashboard());
    }

    @GetMapping("/profile")
    public ResponseEntity<com.lms.model.User> getProfile() {
        return ResponseEntity.ok(facultyService.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<com.lms.model.User> updateProfile(@RequestBody com.lms.model.User user) {
        return ResponseEntity.ok(facultyService.updateProfile(user));
    }

    @GetMapping("/courses")
    public ResponseEntity<java.util.List<com.lms.model.Course>> getMyCourses() {
        return ResponseEntity.ok(facultyService.getMyCourses());
    }

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<java.util.List<com.lms.model.User>> getStudentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getStudentsByCourse(courseId));
    }

    @PostMapping("/attendance/batch")
    public ResponseEntity<Void> markBatchAttendance(@RequestBody com.lms.dto.BatchAttendanceDTO batchDTO) {
        attendanceService.markBatchAttendance(batchDTO);
        return ResponseEntity.ok().build();
    }

    // --- Assignment Management (Moved for reliability) ---

    @PostMapping("/assignments")
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentService.createAssignment(assignment));
    }

    @GetMapping("/assignments/course/{courseId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseId));
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments/{id}/submissions")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getSubmissions(id));
    }

    @PostMapping("/assignments/submissions/{submissionId}/grade")
    public ResponseEntity<AssignmentSubmission> gradeSubmission(@PathVariable Long submissionId, @RequestBody Map<String, Object> body) {
        Integer grade = (Integer) body.get("grade");
        String feedback = (String) body.get("feedback");
        return ResponseEntity.ok(assignmentService.gradeSubmission(submissionId, grade, feedback));
    }

    // --- Student Proxy Endpoints ---

    @PostMapping("/assignments/{id}/submit")
    public ResponseEntity<AssignmentSubmission> submitWork(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(assignmentService.submitWork(id, body.get("submissionUrl")));
    }

    @GetMapping("/assignments/{id}/my-submission")
    public ResponseEntity<AssignmentSubmission> getMySubmission(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getStudentSubmission(id));
    }
}
