package com.lms.service;

import com.lms.dto.StatsDTO;
import com.lms.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class StatsService {

    private final UserRepository userRepository;

    public StatsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public StatsDTO getSystemStats() {
        StatsDTO stats = new StatsDTO();
        
        long totalUsers = userRepository.count();
        stats.setTotalUsers(totalUsers);
        
        // Count active users
        long activeUsers = userRepository.findAll().stream()
            .filter(user -> user.isActive())
            .count();
        stats.setActiveUsers(activeUsers);
        
        // Simple counts
        stats.setFacultyCount(0L);
        stats.setStudentCount(0L);
        stats.setNewRegistrations(0L);
        
        // Count users by role
        Map<String, Long> usersByRole = new HashMap<>();
        userRepository.findAll().forEach(user -> {
            String role = user.getRole().name();
            usersByRole.put(role, usersByRole.getOrDefault(role, 0L) + 1);
        });
        stats.setUsersByRole(usersByRole);
        
        return stats;
    }
}