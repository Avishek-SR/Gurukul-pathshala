package com.lms.service;

import com.lms.model.Assignment;
import com.lms.model.AssignmentSubmission;
import com.lms.model.Course;
import com.lms.model.User;
import com.lms.repository.AssignmentRepository;
import com.lms.repository.AssignmentSubmissionRepository;
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
    private final AssignmentSubmissionRepository submissionRepository;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             CourseRepository courseRepository,
                             UserRepository userRepository,
                             AssignmentSubmissionRepository submissionRepository) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
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
     * Get assignments by course.
     */
    @Transactional(readOnly = true)
    public List<Assignment> getAssignmentsByCourse(Long courseId) {
        return assignmentRepository.findByCourseId(courseId);
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

    // --- Submission Logic ---

    /**
     * Student submits work for an assignment.
     */
    public AssignmentSubmission submitWork(Long assignmentId, String submissionUrl) {
        String studentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new IllegalStateException("Student not found"));

        Assignment assignment = getById(assignmentId);

        AssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .orElse(new AssignmentSubmission());

        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setSubmissionUrl(submissionUrl);
        submission.setSubmissionStatus(com.lms.model.enums.SubmissionStatus.SUBMITTED);
        
        return submissionRepository.save(submission);
    }

    /**
     * Faculty grades a submission.
     */
    public AssignmentSubmission gradeSubmission(Long submissionId, Integer grade, String feedback) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));

        submission.setGrade(grade);
        submission.setFeedback(feedback);
        submission.setSubmissionStatus(com.lms.model.enums.SubmissionStatus.APPROVED);

        return submissionRepository.save(submission);
    }

    /**
     * Get all submissions for an assignment (for faculty).
     */
    public List<AssignmentSubmission> getSubmissions(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    /**
     * Get student's submission for an assignment.
     */
    public AssignmentSubmission getStudentSubmission(Long assignmentId) {
        String studentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new IllegalStateException("Student not found"));

        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .orElse(null);
    }
}
