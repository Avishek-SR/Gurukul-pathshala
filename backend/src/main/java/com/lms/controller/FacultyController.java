package com.lms.controller;

import com.lms.dto.FacultyDashboardDTO;
import com.lms.service.FacultyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/faculty")
public class FacultyController {

    private final FacultyService facultyService;
    private final com.lms.service.EnrollmentService enrollmentService;
    private final com.lms.service.AttendanceService attendanceService;

    public FacultyController(FacultyService facultyService,
            com.lms.service.EnrollmentService enrollmentService,
            com.lms.service.AttendanceService attendanceService) {
        this.facultyService = facultyService;
        this.enrollmentService = enrollmentService;
        this.attendanceService = attendanceService;
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
}
