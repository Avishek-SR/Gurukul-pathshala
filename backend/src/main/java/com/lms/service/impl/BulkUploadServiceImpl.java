package com.lms.service.impl;

import com.lms.model.User;
import com.lms.service.BulkUploadService;
import com.lms.service.UserService;
import com.lms.dto.CreateUserRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import java.util.ArrayList;
import java.util.List;

@Service
public class BulkUploadServiceImpl implements BulkUploadService {

    private final UserService userService;

    public BulkUploadServiceImpl(UserService userService) {
        this.userService = userService;
    }

    @Override
    @Transactional
    public List<User> uploadUsers(MultipartFile file, String roleName) {
        List<User> createdUsers = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            reader.readLine(); // Skip header line
            String line;

            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty())
                    continue;

                String[] data = line.split(",");
                // Basic CSV parsing - assume columns: Name, DOB (yyyy-MM-dd), Email (optional),
                // Program, Year, Dept, Mobile
                // Adjust based on Role

                // Safe parsing helper
                String name = safeGet(data, 0);
                String dobStr = safeGet(data, 1);

                if (name == null || dobStr == null)
                    continue; // Skip invalid rows

                CreateUserRequest request = new CreateUserRequest();
                request.setName(name.trim());
                try {
                    request.setDob(LocalDate.parse(dobStr.trim()));
                } catch (Exception e) {
                    continue;
                }
                request.setRole(roleName);

                if ("STUDENT".equalsIgnoreCase(roleName)) {
                    // Columns: Name, DOB, ParentEmail, Program, Year
                    String parentEmail = safeGet(data, 2);
                    String program = safeGet(data, 3);
                    String year = safeGet(data, 4);

                    request.setParentEmail(parentEmail);
                    request.setProgram(program);
                    request.setSection(year);

                } else if ("FACULTY".equalsIgnoreCase(roleName)) {
                    // Columns: Name, DOB, Department, Designation
                    String department = safeGet(data, 2);
                    String designation = safeGet(data, 3);

                    request.setDepartment(department);
                    request.setDesignation(designation);

                } else if ("ADMIN".equalsIgnoreCase(roleName)) {
                    // Columns: Name, DOB
                    // Minimal fields, other details can be updated later
                }

                // Optional fields could be added here

                try {
                    User user = userService.createUserFromAdmin(request);
                    createdUsers.add(user);
                } catch (Exception e) {
                    // Log error and continue with other users? or throw?
                    // For now, we print stack trace and continue
                    System.err.println("Failed to create user from row: " + line);
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process bulk upload file: " + e.getMessage(), e);
        }

        return createdUsers;
    }

    private String safeGet(String[] data, int index) {
        if (index >= 0 && index < data.length) {
            String val = data[index].trim();
            return val.isEmpty() ? null : val;
        }
        return null;
    }
}
