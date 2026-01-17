package com.lms.service;

import com.lms.dto.StaffDashboardDTO;
import com.lms.model.User;
import com.lms.repository.NotificationRepository;
import com.lms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class StaffService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public StaffService(UserRepository userRepository,
                        NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    /**
     * Production-grade dashboard:
     * - Uses the currently authenticated staff user
     * - No hard-coded userIds
     * - No fake/demo numbers
     * - Returns only data that is truly backed by the system today
     */
    public StaffDashboardDTO getDashboard() {
        StaffDashboardDTO dto = new StaffDashboardDTO();

        // Get logged-in userId from Spring Security context
        String staffUserId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // Resolve real user
        User staff = userRepository.findByUserId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Authenticated staff not found"));

        dto.setWelcomeMessage("Welcome " + staff.getName());

        // Real data from DB
        long unread = notificationRepository.countByUserAndReadFalse(staff);
        dto.setNotifications((int) unread);

        /*
         * These modules do not exist yet in the system:
         * - Tasks
         * - Approvals
         *
         * In a real LMS, these must remain ZERO until
         * their entities and repositories are implemented.
         */
        dto.setTotalTasks(0);
        dto.setPendingApprovals(0);
        dto.setCompletedToday(0);

        return dto;
    }
}
