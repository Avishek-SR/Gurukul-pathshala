package com.lms.service;

import com.lms.dto.FacultyDashboardDTO;
import com.lms.model.Course;
import com.lms.model.User;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FacultyService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public FacultyService(UserRepository userRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    private User getCurrentFaculty() {
        String facultyUserId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUserId(facultyUserId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
    }

    public FacultyDashboardDTO getDashboard() {
        User faculty = getCurrentFaculty();
        FacultyDashboardDTO dto = new FacultyDashboardDTO();

        dto.setWelcomeMessage("Welcome " + faculty.getName());

        // Real data calculation
        List<Course> myCourses = courseRepository.findByFaculty(faculty);
        long activeCoursesCount = myCourses.stream().filter(Course::isActive).count();

        // Calculate total unique students across all my courses
        // This is a simplified version; for exact unique students we might need a
        // custom query
        long totalEnrollments = myCourses.stream()
                .mapToLong(enrollmentRepository::countByCourse)
                .sum();

        dto.setTotalStudents((int) totalEnrollments);
        dto.setTotalSubjects((int) activeCoursesCount); // Using courses as subjects for now

        // Placeholder for assignments until Assignment module is fully integrated
        dto.setPendingAssignments(0);

        return dto;
    }

    @Transactional(readOnly = true)
    public User getProfile() {
        return getCurrentFaculty();
    }

    @Transactional
    public User updateProfile(User updatedData) {
        User faculty = getCurrentFaculty();

        // Only allow updating specific fields
        if (updatedData.getMobileNumber() != null) {
            faculty.setMobileNumber(updatedData.getMobileNumber());
        }
        if (updatedData.getAddress() != null) {
            faculty.setAddress(updatedData.getAddress());
        }
        if (updatedData.getBio() != null) {
            faculty.setBio(updatedData.getBio());
        }
        // Add other allowed fields here

        return userRepository.save(faculty);
    }

    @Transactional(readOnly = true)
    public List<Course> getMyCourses() {
        User faculty = getCurrentFaculty();
        return courseRepository.findByFaculty(faculty);
    }
}