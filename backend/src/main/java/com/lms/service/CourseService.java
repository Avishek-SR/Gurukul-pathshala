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

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
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
}
