package com.lms.service;

import com.lms.model.Course;
import com.lms.model.User;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CourseService {

    private final EnrollmentService enrollmentService;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository,
            EnrollmentService enrollmentService) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentService = enrollmentService;
    }

    /**
     * Create a new course.
     * - Ensures course code uniqueness
     * - Optionally assigns a faculty by userId
     */
    public Course createCourse(Course course) {

        if (course.getCode() == null || course.getCode().isBlank()) {
            throw new IllegalArgumentException("Course code is required");
        }

        if (courseRepository.existsByCode(course.getCode())) {
            throw new IllegalStateException("Course with code already exists: " + course.getCode());
        }

        // If faculty is provided with only userId, resolve it from DB
        if (course.getFaculty() != null && course.getFaculty().getUserId() != null) {
            String facultyUserId = course.getFaculty().getUserId();
            User faculty = userRepository.findByUserId(facultyUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Faculty not found: " + facultyUserId));
            course.setFaculty(faculty);
        }

        course.setActive(true);
        return courseRepository.save(course);
    }

    // Alias used by controllers expecting create(...)
    public Course create(Course course) {
        return createCourse(course);
    }

    /**
     * Return all courses from DB.
     */
    @Transactional(readOnly = true)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // Compatibility alias for controllers using findAll()
    @Transactional(readOnly = true)
    public List<Course> findAll() {
        return getAllCourses();
    }

    /**
     * Return only active courses.
     */
    @Transactional(readOnly = true)
    public List<Course> getActiveCourses() {
        return courseRepository.findByActiveTrue();
    }

    /**
     * Get a course by id.
     */
    @Transactional(readOnly = true)
    public Course getById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));
    }

    // Compatibility alias for controllers using findById()
    @Transactional(readOnly = true)
    public Course findById(Long id) {
        return getById(id);
    }

    /**
     * Update an existing course.
     */
    public Course update(Long id, Course course) {
        Course existing = getById(id);

        existing.setCode(course.getCode());
        existing.setTitle(course.getTitle());
        existing.setDescription(course.getDescription());
        existing.setDuration(course.getDuration());
        existing.setFee(course.getFee());
        existing.setActive(course.isActive());
        // Update Class/Section mapping
        existing.setProgram(course.getProgram());
        existing.setSection(course.getSection());

        // If faculty is provided with only userId, resolve it from DB
        if (course.getFaculty() != null && course.getFaculty().getUserId() != null) {
            String facultyUserId = course.getFaculty().getUserId();
            User faculty = userRepository.findByUserId(facultyUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Faculty not found: " + facultyUserId));
            existing.setFaculty(faculty);
        }

        return courseRepository.save(existing);
    }

    /**
     * Deactivate (soft delete) a course.
     */
    public void delete(Long id) {
        Course course = getById(id);
        course.setActive(false);
        courseRepository.save(course);
    }

    /**
     * Assigns the course to all students matching the course's Program (Class) and
     * Section (Section).
     * 
     * @param courseId The ID of the course to assign.
     * @return count of students enrolled.
     */
    public int assignCourseToClass(Long courseId) {
        Course course = getById(courseId);
        String targetClass = course.getProgram(); // Mapped to 'program'
        String targetSection = course.getSection(); // Mapped to 'year' (DB col) -> 'section' (Code)

        if (targetClass == null || targetClass.isBlank()) {
            throw new IllegalArgumentException("Course does not have a Class (program) defined for auto-assignment.");
        }

        // Logic:
        // 1. Fetch ALL students (Role = STUDENT).
        // 2. Filter by program == targetClass.
        // 3. If targetSection is present, filter by section == targetSection.
        // 4. Enroll each.

        // FIX: Added null check for getRole() to prevent NPE
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "STUDENT".equals(u.getRole().name()))
                .filter(u -> targetClass.equalsIgnoreCase(u.getProgram()))
                .filter(u -> targetSection == null || targetSection.isBlank()
                        || targetSection.equalsIgnoreCase(u.getSection()))
                .toList();

        int count = 0;
        for (User student : students) {
            // FIX: Check if already enrolled to prevent IllegalStateException and
            // transaction rollback
            if (!enrollmentService.isEnrolled(student, course)) {
                try {
                    enrollmentService.enroll(student.getUserId(), course.getId());
                    count++;
                } catch (Exception e) {
                    // Ignore failures for individual students (e.g. race conditions)
                    // Since enroll() is REQUIRES_NEW, this won't rollback the main transaction
                    System.err.println("Failed to enroll student " + student.getUserId() + ": " + e.getMessage());
                }
            }
        }
        return count;
    }

    /**
     * Get all students enrolled in a course.
     */
    public List<User> getStudentsForCourse(Long courseId) {
        return enrollmentService.getStudentsByCourse(courseId);
    }
}
