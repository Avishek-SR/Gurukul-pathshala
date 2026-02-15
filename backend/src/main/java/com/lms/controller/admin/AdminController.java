package com.lms.controller.admin;

import com.lms.model.User;
import com.lms.dto.UserDTO;

import com.lms.dto.CreateUserRequest;
import com.lms.dto.UpdateUserRequest;
import com.lms.model.ActivityLog;
import com.lms.service.ActivityLogService;
import com.lms.service.UserService;
import com.lms.service.BulkUploadService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final UserService userService;
    private final BulkUploadService bulkUploadService;
    private final ActivityLogService activityLogService;

    public AdminController(UserService userService, BulkUploadService bulkUploadService,
            ActivityLogService activityLogService) {
        this.userService = userService;
        this.bulkUploadService = bulkUploadService;
        this.activityLogService = activityLogService;
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
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable @org.springframework.lang.NonNull String role) {
        List<User> users = userService.getUsersByRole(role);
        List<UserDTO> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @PostMapping("/users")
    public ResponseEntity<UserDTO> createUser(
            @RequestBody @org.springframework.lang.NonNull CreateUserRequest request) {
        User createdUser = userService.createUserFromAdmin(request);
        return ResponseEntity.ok(convertToDTO(createdUser));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable @org.springframework.lang.NonNull Long id,
            @RequestBody @org.springframework.lang.NonNull UpdateUserRequest request) {
        User updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(convertToDTO(updatedUser));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserDTO> updateUserStatus(@PathVariable @org.springframework.lang.NonNull Long id,
            @RequestParam boolean active) {
        User updatedUser = userService.updateUserStatus(id, active);
        return ResponseEntity.ok(convertToDTO(updatedUser));
    }

    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<UserDTO> resetPassword(@PathVariable @org.springframework.lang.NonNull Long id) {
        User updatedUser = userService.resetPassword(id);
        return ResponseEntity.ok(convertToDTO(updatedUser));
    }

    @PostMapping("/users/bulk-upload")
    public ResponseEntity<List<UserDTO>> bulkUploadUsers(
            @RequestParam("file") MultipartFile file,
            @RequestParam("role") String role) {

        List<User> createdUsers = bulkUploadService.uploadUsers(file, role);
        List<UserDTO> userDTOs = createdUsers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable @org.springframework.lang.NonNull Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{id}/activity")
    public ResponseEntity<List<ActivityLog>> getUserActivity(@PathVariable Long id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return ResponseEntity.ok(activityLogService.getUserLogs(user.getUserId()));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<List<ActivityLog>> getAllActivityLogs() {
        return ResponseEntity.ok(activityLogService.getAllLogs());
    }

    @PutMapping("/users/{id}/permissions")
    public ResponseEntity<UserDTO> updatePermissions(@PathVariable @org.springframework.lang.NonNull Long id,
            @RequestBody Set<String> permissions) {
        User updatedUser = userService.updatePermissions(id, permissions);
        return ResponseEntity.ok(convertToDTO(updatedUser));
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setProgram(user.getProgram());
        dto.setSection(user.getSection());
        dto.setDepartment(user.getDepartment());
        dto.setDesignation(user.getDesignation());
        dto.setActive(user.isActive());
        dto.setParentEmail(user.getParentEmail());
        dto.setParentPhoneNumber(user.getParentPhoneNumber());
        dto.setDob(user.getDob());
        dto.setParentPhoneNumber(user.getParentPhoneNumber());
        dto.setDob(user.getDob());
        dto.setMobileNumber(user.getMobileNumber());
        dto.setCitizenship(user.getCitizenship());
        dto.setGender(user.getGender());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setSuperAdmin(user.isSuperAdmin());
        dto.setPersonalEmail(user.getPersonalEmail());
        dto.setPermissions(user.getPermissions());
        dto.setFaceDescriptor(user.getFaceDescriptor());
        return dto;
    }
}