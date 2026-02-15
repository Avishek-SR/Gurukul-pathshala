package com.lms.controller.admin;

import com.lms.model.Course;
import com.lms.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/courses")
public class AdminCourseController {

    private final CourseService courseService;
    private final com.lms.service.EnrollmentService enrollmentService;

    public AdminCourseController(CourseService courseService, com.lms.service.EnrollmentService enrollmentService) {
        this.courseService = courseService;
        this.enrollmentService = enrollmentService;
    }

    // Get enrolled students for a course (for manual attendance marking)
    @GetMapping("/{id}/students")
    public ResponseEntity<List<com.lms.model.User>> getStudentsByCourse(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getStudentsByCourse(id));
    }

    // Create a new course (Admin only)
    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.create(course));
    }

    // Update existing course
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id,
            @RequestBody Course course) {
        return ResponseEntity.ok(courseService.update(id, course));
    }

    // Delete a course
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // List all courses (admin view)
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getActiveCourses());
    }

    // Get a single course
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.findById(id));
    }

    // Auto-assign students based on Course Class/Section
    @PostMapping("/{id}/assign-students")
    public ResponseEntity<String> assignStudents(@PathVariable Long id) {
        int count = courseService.assignCourseToClass(id);
        return ResponseEntity.ok("Assigned course to " + count + " students.");
    }
}
