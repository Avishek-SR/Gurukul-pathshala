package com.lms.service;

import com.lms.dto.AdminDashboardDTO;
import com.lms.model.Role;
import com.lms.model.User;
import com.lms.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AdminDashboardDTO getDashboard() {
        AdminDashboardDTO dto = new AdminDashboardDTO();

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();

        long studentCount = userRepository.countByRoleAndActiveTrue(Role.STUDENT.name());
        long facultyCount = userRepository.countByRoleAndActiveTrue(Role.FACULTY.name());
        long staffCount = userRepository.countByRoleAndActiveTrue(Role.STAFF.name());
        long adminCount = userRepository.countByRoleAndActiveTrue(Role.ADMIN.name());

        // Real "today" calculation using createdAt
        LocalDate today = LocalDate.now();
        long newToday = userRepository.findAll().stream()
                .map(User::getCreatedAt)
                .filter(t -> t != null && t.toLocalDate().isEqual(today))
                .count();

        dto.setTotalUsers(totalUsers);
        dto.setActiveUsers(activeUsers);
        dto.setStudentCount(studentCount);
        dto.setFacultyCount(facultyCount);
        dto.setStaffCount(staffCount);
        dto.setAdminCount(adminCount);
        dto.setNewRegistrationsToday(newToday);

        // System state derived at runtime
        dto.setSystemStatus("RUNNING");
        dto.setServerTime(LocalDateTime.now().toString());

        return dto;
    }
}