package com.lms.controller;

import com.lms.model.Notice;
import com.lms.model.LandingPageSlide;
import com.lms.service.impl.NoticeServiceImpl;
import com.lms.service.impl.SystemSettingServiceImpl;
import com.lms.service.LandingPageSlideService;
import com.lms.service.UserService;
import com.lms.dto.UserDTO;
import com.lms.model.User;
import com.lms.model.Role;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PublicController {

    @Autowired
    private NoticeServiceImpl noticeService;

    @Autowired
    private SystemSettingServiceImpl systemSettingService;

    @Autowired
    private LandingPageSlideService landingPageSlideService;

    @Autowired
    private UserService userService;

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello from School Management System!";
    }

    @GetMapping("/notices")
    public ResponseEntity<List<Notice>> getActiveNotices() {
        return ResponseEntity.ok(noticeService.getActiveNotices());
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        return ResponseEntity.ok(systemSettingService.getAllPublicSettings());
    }

    @GetMapping("/landing-slides")
    public ResponseEntity<List<LandingPageSlide>> getLandingSlides() {
        return ResponseEntity.ok(landingPageSlideService.getAllActiveSlides());
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<UserDTO>> getActiveFaculty() {
        List<User> facultyList = userService.getUsersByRole(Role.FACULTY);

        List<UserDTO> dtoList = facultyList.stream()
                .filter(User::isActive) // Return only active faculty on public page
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        if (user.getRole() != null)
            dto.setRole(user.getRole().name());
        dto.setDepartment(user.getDepartment());
        dto.setDesignation(user.getDesignation());
        dto.setActive(user.isActive());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setMobileNumber(user.getMobileNumber());
        dto.setBio(user.getBio());
        return dto;
    }
}
