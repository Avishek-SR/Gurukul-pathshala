package com.lms.service;

import com.lms.model.Assignment;
import com.lms.model.Course;
import com.lms.model.User;
import com.lms.repository.AssignmentRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             CourseRepository courseRepository,
                             UserRepository userRepository) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Faculty creates an assignment for a course.
     * - Uses the authenticated faculty user
     * - Resolves course from DB
     * - Persists only real data
     */
    public Assignment createAssignment(Assignment assignment) {

        if (assignment.getTitle() == null || assignment.getTitle().isBlank()) {
            throw new IllegalArgumentException("Assignment title is required");
        }

        if (assignment.getCourse() == null || assignment.getCourse().getId() == null) {
            throw new IllegalArgumentException("Course id is required");
        }

        // Resolve authenticated faculty
        String facultyUserId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User faculty = userRepository.findByUserId(facultyUserId)
                .orElseThrow(() -> new IllegalStateException("Authenticated faculty not found"));

        // Resolve course from DB
        Course course = courseRepository.findById(assignment.getCourse().getId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + assignment.getCourse().getId()));

        assignment.setFaculty(faculty);
        assignment.setCourse(course);
        assignment.setActive(true);

        return assignmentRepository.save(assignment);
    }

    /**
     * Return all assignments from DB.
     */
    @Transactional(readOnly = true)
    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    /**
     * Get assignment by id.
     */
    @Transactional(readOnly = true)
    public Assignment getById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + id));
    }

    /**
     * Soft delete (deactivate) an assignment.
     */
    public void delete(Long id) {
        Assignment assignment = getById(id);
        assignment.setActive(false);
        assignmentRepository.save(assignment);
    }
}
