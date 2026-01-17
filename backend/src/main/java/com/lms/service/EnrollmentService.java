package com.lms.service;

import com.lms.model.Course;
import com.lms.model.Enrollment;
import com.lms.model.User;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             UserRepository userRepository,
                             CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    /**
     * Enroll a student into a course.
     * - Resolves student and course from DB
     * - Prevents duplicate enrollment
     */
    public Enrollment enroll(String studentUserId, Long courseId) {

        if (studentUserId == null || studentUserId.isBlank()) {
            throw new IllegalArgumentException("Student userId is required");
        }
        if (courseId == null) {
            throw new IllegalArgumentException("Course id is required");
        }

        User student = userRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentUserId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));

        // Prevent duplicate enrollment
        enrollmentRepository.findByStudentAndCourse(student, course)
                .ifPresent(e -> {
                    throw new IllegalStateException("Student is already enrolled in this course");
                });

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);

        return enrollmentRepository.save(enrollment);
    }

    /**
     * Get all enrollments for the currently logged-in student.
     */
    @Transactional(readOnly = true)
    public List<Enrollment> getMyEnrollments() {

        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User student = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated student not found"));

        return enrollmentRepository.findByStudent(student);
    }
}
