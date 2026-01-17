package com.lms.service;

import com.lms.dto.FacultyDashboardDTO;
import com.lms.model.User;
import com.lms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class FacultyService {

    private final UserRepository userRepository;

    public FacultyService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Production-grade dashboard:
     * - Uses the currently authenticated faculty user
     * - No hard-coded userIds
     * - No fake/demo numbers
     * - Returns only data that is truly backed by the system today
     */
    public FacultyDashboardDTO getDashboard() {
        FacultyDashboardDTO dto = new FacultyDashboardDTO();

        // Get logged-in userId from Spring Security context
        String facultyUserId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // Resolve real user
        String name = userRepository.findByUserId(facultyUserId)
                .map(User::getName)
                .orElse("Faculty");

        dto.setWelcomeMessage("Welcome " + name);

        /*
         * Until Subject, Course, and Assignment modules exist,
         * these values must be ZERO in production.
         * Real systems never fabricate data.
         */
        dto.setTotalStudents(0);
        dto.setTotalSubjects(0);
        dto.setPendingAssignments(0);

        return dto;
    }
}