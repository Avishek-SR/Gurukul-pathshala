package com.lms.controller.admin;

import com.lms.model.Role;
import com.lms.model.User;
import com.lms.service.ExcelExportService;
import com.lms.service.UserService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/admin/export")
public class AdminExportController {

    private final UserService userService;
    private final ExcelExportService excelExportService;

    public AdminExportController(UserService userService, ExcelExportService excelExportService) {
        this.userService = userService;
        this.excelExportService = excelExportService;
    }

    @GetMapping("/users")
    public ResponseEntity<InputStreamResource> exportUsers(@RequestParam(required = false) String role) {
        List<User> users;

        if (role != null && !role.isEmpty()) {
            try {
                users = userService.getUsersByRole(role);
            } catch (Exception e) {
                // If invalid role, fallback to empty or handle error. For now, empty list safe.
                users = java.util.Collections.emptyList();
            }
        } else {
            users = userService.getAllUsers();
        }

        Role roleEnum = null;
        if (role != null && !role.isEmpty()) {
            try {
                roleEnum = Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore, treat as null (all users/generic)
            }
        }

        ByteArrayInputStream in = excelExportService.usersToExcel(users, roleEnum);

        String filename = (role != null ? role.toLowerCase() : "all") + "_users.xlsx";

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}
