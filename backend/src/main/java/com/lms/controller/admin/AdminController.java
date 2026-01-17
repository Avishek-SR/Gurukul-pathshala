package com.lms.controller.admin;

import com.lms.model.User;
import com.lms.dto.UserDTO;
import com.lms.dto.AdminDashboardDTO;
import com.lms.dto.CreateUserRequest;
import com.lms.service.UserService;
import com.lms.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final UserService userService;
    private final AdminService adminService;
    
    public AdminController(UserService userService, AdminService adminService) {
        this.userService = userService;
        this.adminService = adminService;
    }
    
    
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDTO> userDTOs = users.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }
    
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        List<User> users = userService.getUsersByRole(role);
        List<UserDTO> userDTOs = users.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }
    
    @PostMapping("/users")
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
        User createdUser = userService.createUserFromAdmin(request);
        return ResponseEntity.ok(convertToDTO(createdUser));
    }
    
    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserDTO> updateUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        User updatedUser = userService.updateUserStatus(id, active);
        return ResponseEntity.ok(convertToDTO(updatedUser));
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setProgram(user.getProgram());
        dto.setYear(user.getYear());
        dto.setDepartment(user.getDepartment());
        dto.setDesignation(user.getDesignation());
        dto.setActive(user.isActive());
        return dto;
    }
}