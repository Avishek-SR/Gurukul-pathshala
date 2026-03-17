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
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;
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

    // --- Notice Management ---

    @Autowired
    private com.lms.service.impl.NoticeServiceImpl noticeService;

    @Autowired
    private com.lms.service.impl.SystemSettingServiceImpl systemSettingService;

    @GetMapping("/notices")
    public ResponseEntity<List<com.lms.model.Notice>> getAllNotices() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    @PostMapping("/notices")
    public ResponseEntity<com.lms.model.Notice> createNotice(@RequestBody com.lms.model.Notice notice) {
        return ResponseEntity.ok(noticeService.saveNotice(notice));
    }

    @PutMapping("/notices/{id}")
    public ResponseEntity<com.lms.model.Notice> updateNotice(@PathVariable Long id,
            @RequestBody com.lms.model.Notice notice) {
        com.lms.model.Notice existing = noticeService.getNoticeById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        notice.setId(id);
        return ResponseEntity.ok(noticeService.saveNotice(notice));
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.noContent().build();
    }

    // --- System Settings Management ---

    @Autowired
    private com.lms.service.FileStorageService fileStorageService;

    @GetMapping("/settings")
    public ResponseEntity<List<com.lms.model.SystemSetting>> getAllSettings() {
        return ResponseEntity.ok(systemSettingService.getAllSettingsForAdmin());
    }

    @PostMapping("/settings")
    public ResponseEntity<com.lms.model.SystemSetting> updateSetting(@RequestBody Map<String, String> payload) {
        String key = payload.get("key");
        String value = payload.get("value");
        String description = payload.get("description");
        String group = payload.get("group");
        return ResponseEntity.ok(systemSettingService.updateSetting(key, value, description, group));
    }

    @PostMapping("/settings/upload-image")
    public ResponseEntity<com.lms.model.SystemSetting> uploadSettingImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("key") String key) {
        String filePath = fileStorageService.storeFile(file);
        // Default group to "Landing Page" if not set, or we could pass it.
        // For simplicity, we'll assume these are landing page images.
        return ResponseEntity
                .ok(systemSettingService.updateSetting(key, filePath, "Landing Page Slide Image", "landing_page"));
    }

    @DeleteMapping("/settings/{key}")
    public ResponseEntity<Void> deleteSetting(@PathVariable String key) {
        systemSettingService.deleteSetting(key);
        return ResponseEntity.noContent().build();
    }

    // --- Landing Page Slide Management ---

    @Autowired
    private com.lms.service.LandingPageSlideService landingPageSlideService;

    @GetMapping("/landing-slides")
    public ResponseEntity<List<com.lms.model.LandingPageSlide>> getAllLandingSlides() {
        return ResponseEntity.ok(landingPageSlideService.getAllSlidesForAdmin());
    }

    @PostMapping("/landing-slides")
    public ResponseEntity<com.lms.model.LandingPageSlide> addLandingSlide(
            @RequestParam("file") MultipartFile file) {
        String filePath = fileStorageService.storeFile(file);

        // Determine type based on extension or mime type
        String fileType = "IMAGE";
        String contentType = file.getContentType();
        if (contentType != null && contentType.startsWith("video")) {
            fileType = "VIDEO";
        } else if (filePath.endsWith(".mp4") || filePath.endsWith(".webm")) { // Fallback check
            fileType = "VIDEO";
        }

        return ResponseEntity.ok(landingPageSlideService.addSlide(filePath, fileType));
    }

    @DeleteMapping("/landing-slides/{id}")
    public ResponseEntity<Void> deleteLandingSlide(@PathVariable Long id) {
        landingPageSlideService.deleteSlide(id);
        return ResponseEntity.noContent().build();
    }

    // --- Gallery Album & Item Management ---

    @Autowired
    private com.lms.service.GalleryService galleryService;

    @GetMapping("/gallery/albums")
    public ResponseEntity<java.util.List<com.lms.model.GalleryAlbum>> getAllGalleryAlbums() {
        return ResponseEntity.ok(galleryService.getAllAlbumsForAdmin());
    }

    @PostMapping("/gallery/albums")
    public ResponseEntity<com.lms.model.GalleryAlbum> createGalleryAlbum(
            @RequestBody Map<String, String> payload) {
        String name = payload.getOrDefault("name", "Untitled Album");
        String description = payload.get("description");
        return ResponseEntity.ok(galleryService.createAlbum(name, description));
    }

    @PutMapping("/gallery/albums/{id}")
    public ResponseEntity<com.lms.model.GalleryAlbum> updateGalleryAlbum(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");
        Boolean active = payload.get("active") != null ? (Boolean) payload.get("active") : null;
        return ResponseEntity.ok(galleryService.updateAlbum(id, name, description, active));
    }

    @DeleteMapping("/gallery/albums/{id}")
    public ResponseEntity<Void> deleteGalleryAlbum(@PathVariable Long id) {
        galleryService.deleteAlbum(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/gallery/albums/{albumId}/items")
    public ResponseEntity<java.util.List<com.lms.model.GalleryItem>> getGalleryItemsByAlbum(
            @PathVariable Long albumId) {
        return ResponseEntity.ok(galleryService.getItemsByAlbumId(albumId));
    }

    @PostMapping("/gallery/albums/{albumId}/items")
    public ResponseEntity<com.lms.model.GalleryItem> addGalleryItem(
            @PathVariable Long albumId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description) {
        String filePath = fileStorageService.storeFile(file);
        String mediaType = "IMAGE";
        String contentType = file.getContentType();
        if (contentType != null && contentType.startsWith("video")) {
            mediaType = "VIDEO";
        } else if (filePath.endsWith(".mp4") || filePath.endsWith(".webm")) {
            mediaType = "VIDEO";
        }
        return ResponseEntity.ok(galleryService.addItem(albumId, filePath, mediaType, title, description));
    }

    @DeleteMapping("/gallery/items/{id}")
    public ResponseEntity<Void> deleteGalleryItem(@PathVariable Long id) {
        galleryService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}