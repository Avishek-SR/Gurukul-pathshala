package com.lms.service;

import com.lms.model.User;
import com.lms.model.Role;
import com.lms.repository.UserRepository;
import com.lms.dto.CreateUserRequest;
import com.lms.dto.UpdateUserRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;

@Service
@Transactional
public class UserService { // REMOVE "implements UserDetailsService"

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @jakarta.annotation.PostConstruct
    public void initSuperAdmin() {
        // 1. Specific By ID (primary target)
        Optional<User> superAdminUser = userRepository.findByUserId("avishek070504");
        if (superAdminUser.isPresent()) {
            User user = superAdminUser.get();
            boolean needsUpdate = false;

            if (!user.isSuperAdmin()) {
                user.setSuperAdmin(true);
                needsUpdate = true;
            }
            if (user.getRole() != Role.ADMIN) {
                user.setRole(Role.ADMIN);
                needsUpdate = true;
            }
            if (user.getPermissions() == null || user.getPermissions().isEmpty()) {
                user.setPermissions(new java.util.HashSet<>(java.util.Arrays.asList(
                        "MANAGE_STUDENTS", "MANAGE_FACULTY", "MANAGE_ADMINS", "BULK_UPLOAD", "DELETE_USERS")));
                needsUpdate = true;
            }

            if (needsUpdate) {
                userRepository.save(user);
                System.out.println("SUPER ADMIN FORCED BY ID: " + user.getUserId());
            }
        } else {
            // DATABASE IS EMPTY OR MISSING SUPER ADMIN - CREATE IT
            System.out.println("SUPER ADMIN NOT FOUND - CREATING INITIAL SUPER ADMIN...");
            User initialAdmin = new User();
            initialAdmin.setUserId("avishek070504");
            initialAdmin.setName("Avishek Yadav");
            initialAdmin.setEmail("avishek@gurukul.com");
            initialAdmin.setPassword(passwordEncoder.encode("Avishek@0705")); // Default password
            initialAdmin.setRole(Role.ADMIN);
            initialAdmin.setSuperAdmin(true);
            initialAdmin.setActive(true);
            initialAdmin.setDob(java.time.LocalDate.of(2004, 5, 7)); // Required field
            initialAdmin.setPermissions(new java.util.HashSet<>(java.util.Arrays.asList(
                    "MANAGE_STUDENTS", "MANAGE_FACULTY", "MANAGE_ADMINS", "BULK_UPLOAD", "DELETE_USERS")));

            userRepository.save(initialAdmin);
            System.out.println("INITIAL SUPER ADMIN CREATED SUCCESSFULLY!");
        }

        // 2. Legacy check by Name for existing admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            if ("Abishek yadav".equalsIgnoreCase(admin.getName())) {
                boolean needsSave = false;
                if (!admin.isSuperAdmin()) {
                    admin.setSuperAdmin(true);
                    needsSave = true;
                }
                if (admin.getPermissions() == null || admin.getPermissions().isEmpty()) {
                    admin.setPermissions(new java.util.HashSet<>(java.util.Arrays.asList(
                            "MANAGE_STUDENTS", "MANAGE_FACULTY", "MANAGE_ADMINS", "BULK_UPLOAD", "DELETE_USERS")));
                    needsSave = true;
                }
                if (needsSave) {
                    userRepository.save(admin);
                    System.out.println("SUPER ADMIN ENSURED BY NAME: " + admin.getName());
                }
            }
        }
    }

    private String generateYearBasedUserId() {
        String currentYear = String.valueOf(Year.now().getValue());

        // Find the last user ID starting with the current year
        Optional<User> lastUser = userRepository.findTopByUserIdStartingWithOrderByUserIdDesc(currentYear);

        if (lastUser.isPresent()) {
            String lastId = lastUser.get().getUserId();
            // Validate if the ID follows the expected format (10 digits) to avoid parsing
            // errors
            if (lastId.length() >= 10 && lastId.startsWith(currentYear)) {
                try {
                    String sequenceStr = lastId.substring(4); // Digits after year
                    long sequence = Long.parseLong(sequenceStr);
                    long nextSequence = sequence + 1;
                    return currentYear + String.format("%06d", nextSequence);
                } catch (NumberFormatException e) {
                    // Fallback if parsing fails
                    System.err.println("Error parsing user ID sequence: " + lastId);
                }
            }
        }

        // Default start for the year
        return currentYear + "000001";
    }

    private String generateAdminId() {
        Optional<User> lastAdmin = userRepository.findTopByRoleOrderByUserIdDesc(Role.ADMIN);
        if (lastAdmin.isPresent()) {
            String lastId = lastAdmin.get().getUserId();
            // Validate admin ID format (4 digits)
            if (lastId.matches("^\\d{4}$")) {
                try {
                    long sequence = Long.parseLong(lastId);
                    return String.valueOf(sequence + 1);
                } catch (NumberFormatException e) {
                    System.err.println("Error parsing admin ID: " + lastId);
                }
            }
        }
        return "1111"; // Start from 1111
    }

    private String generateFacultyId() {
        Optional<User> lastFaculty = userRepository.findTopByRoleOrderByUserIdDesc(Role.FACULTY);
        long nextIdVal = 111111;

        if (lastFaculty.isPresent()) {
            String lastId = lastFaculty.get().getUserId();
            // Validate faculty ID format (6 digits)
            if (lastId.matches("^\\d{6}$")) {
                try {
                    nextIdVal = Long.parseLong(lastId) + 1;
                } catch (NumberFormatException e) {
                    System.err.println("Error parsing faculty ID: " + lastId);
                }
            }
        }

        // Collision check: Ensure strict uniqueness across ALL users
        while (userRepository.findByUserId(String.valueOf(nextIdVal)).isPresent()) {
            nextIdVal++;
        }

        return String.valueOf(nextIdVal);
    }

    private String generateProfessionalEmail(String name, LocalDate dob) {
        String cleanName = name.trim().toLowerCase().replaceAll("[^a-z\\s]", "");
        String[] parts = cleanName.split("\\s+");

        String firstName = parts[0];
        String lastInitial = "";

        if (parts.length > 1) {
            String lastName = parts[parts.length - 1];
            if (!lastName.isEmpty()) {
                lastInitial = String.valueOf(lastName.charAt(0));
            }
        }

        String dayOfDob = (dob != null) ? String.format("%02d", dob.getDayOfMonth()) : "01";

        String baseEmail = firstName + lastInitial + dayOfDob;

        String candidate = baseEmail + "@school.com";
        int counter = 1;

        while (userRepository.findByEmail(candidate).isPresent()) {
            candidate = baseEmail + counter + "@school.com";
            counter++;
        }

        return candidate;
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get users by Role enum (type-safe version)
    public List<User> getUsersByRole(@NonNull Role role) {
        return userRepository.findByRole(role);
    }

    // Get users by role string
    public List<User> getUsersByRole(@NonNull String role) {
        try {
            String normalizedRole = role.trim().toUpperCase();
            if (normalizedRole.isEmpty()) {
                throw new IllegalArgumentException("Role cannot be empty");
            }

            Role r = Role.valueOf(normalizedRole);
            return userRepository.findByRole(r);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: '" + role + "'. Valid roles are: " +
                    Arrays.toString(Role.values()), e);
        }
    }

    // Find user by ID
    public Optional<User> findById(@NonNull Long id) {
        return userRepository.findById(id);
    }

    // Find user by email
    public Optional<User> findByEmail(@Nullable String email) {
        if (email == null || email.trim().isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByEmail(email.trim());
    }

    // Find user by user ID
    public Optional<User> findByUserId(@Nullable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByUserId(userId.trim());
    }

    // Create new user
    public User createUser(@NonNull User user) {
        // Validate required fields
        if (user.getName() == null || user.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (user.getDob() == null) {
            throw new IllegalArgumentException("Date of birth is required");
        }

        String rawPassword = user.getPassword();

        // If userId is not provided, generate it
        if (user.getUserId() == null || user.getUserId().isBlank()) {
            String generatedId;
            if (user.getRole() == Role.ADMIN) {
                generatedId = generateAdminId();
            } else if (user.getRole() == Role.FACULTY) {
                generatedId = generateFacultyId();
            } else {
                generatedId = generateYearBasedUserId();
            }
            user.setUserId(generatedId);

            // Auto-generate official email (Professional Name-based)
            user.setEmail(generateProfessionalEmail(user.getName(), user.getDob()));

            // Generate default password if not provided
            if (rawPassword == null || rawPassword.isBlank()) {
                String firstName = user.getName().split(" ")[0];
                rawPassword = firstName + "@" +
                        user.getDob().format(DateTimeFormatter.ofPattern("ddMM"));
                user.setPassword(rawPassword);
            }
        }

        // Check if user ID already exists
        if (userRepository.findByUserId(user.getUserId()).isPresent()) {
            throw new IllegalArgumentException("User ID already exists: " + user.getUserId());
        }

        // Check if email already exists
        if (user.getEmail() != null && userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }

        // Encode password
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            throw new IllegalArgumentException("Password is required");
        }

        // Set default values if not provided
        if (user.getRole() == null) {
            user.setRole(Role.STUDENT);
        }

        // AUTO-ASSIGN SUPER ADMIN
        boolean isSuperAdminTarget = "Abishek yadav".equalsIgnoreCase(user.getName()) ||
                "avishek070504".equalsIgnoreCase(user.getUserId());

        if (isSuperAdminTarget) {
            user.setSuperAdmin(true);
            user.setRole(Role.ADMIN);
            // Grant all permissions
            user.setPermissions(new java.util.HashSet<>(java.util.Arrays.asList(
                    "MANAGE_STUDENTS", "MANAGE_FACULTY", "MANAGE_ADMINS", "BULK_UPLOAD", "DELETE_USERS")));
        } else {
            user.setSuperAdmin(false);
        }

        user.setActive(true);
        user.setFailedAttempts(0);
        user.setLocked(false);

        User savedUser = userRepository.save(user);

        // Send credentials via email
        String emailRecipient = null;
        if (savedUser.getRole() == Role.STUDENT && savedUser.getParentEmail() != null) {
            emailRecipient = savedUser.getParentEmail();
        } else if ((savedUser.getRole() == Role.ADMIN || savedUser.getRole() == Role.FACULTY)
                && savedUser.getPersonalEmail() != null) {
            emailRecipient = savedUser.getPersonalEmail();
        }

        if (emailRecipient != null && !emailRecipient.isEmpty()) {
            emailService.sendCredentials(emailRecipient, savedUser.getName(), savedUser.getUserId(),
                    savedUser.getEmail(), rawPassword, savedUser.getRole().toString());
        }

        return savedUser;
    }

    // Create user from admin request
    public User createUserFromAdmin(@NonNull CreateUserRequest request) {
        // Validate request
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (request.getDob() == null) {
            throw new IllegalArgumentException("Date of birth is required");
        }

        if (request.getRole() == null || request.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }

        // Generate user ID based on role
        String userId;
        Role roleEnum = Role.valueOf(request.getRole().trim().toUpperCase());

        switch (roleEnum) {
            case ADMIN:
                userId = generateAdminId();
                break;
            case FACULTY:
                userId = generateFacultyId();
                break;
            default: // STUDENT
                userId = generateYearBasedUserId();
                break;
        }

        // Auto-generate official email (Professional Name-based)
        String email = generateProfessionalEmail(request.getName(), request.getDob());

        // Generate default password: FirstName@ddMM
        String firstName = request.getName().trim().split("\\s+")[0];
        String rawPassword = firstName + "@" +
                request.getDob().format(DateTimeFormatter.ofPattern("ddMM"));

        User user = new User();
        user.setUserId(userId);
        user.setName(request.getName().trim());
        user.setDob(request.getDob());
        user.setEmail(email);

        try {
            user.setRole(Role.valueOf(request.getRole().trim().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole(), e);
        }

        user.setPassword(passwordEncoder.encode(rawPassword));

        // Set defaults
        user.setActive(true);
        user.setLocked(false);
        user.setFailedAttempts(0);

        // Map school fields
        user.setProgram(request.getProgram());
        user.setSection(request.getSection()); // DTO still calls it 'year', mapping to 'section'
        user.setParentEmail(request.getParentEmail());
        user.setParentPhoneNumber(request.getParentPhoneNumber());
        user.setDepartment(request.getDepartment());
        user.setDesignation(request.getDesignation());

        // Map new fields
        user.setMobileNumber(request.getMobileNumber());
        user.setCitizenship(request.getCitizenship());
        user.setCitizenship(request.getCitizenship());
        user.setGender(request.getGender());
        user.setPersonalEmail(request.getPersonalEmail());

        User savedUser = userRepository.save(user);

        // Send credentials via email
        String emailRecipient = null;
        if (savedUser.getRole() == Role.STUDENT && savedUser.getParentEmail() != null) {
            emailRecipient = savedUser.getParentEmail();
        } else if ((savedUser.getRole() == Role.ADMIN || savedUser.getRole() == Role.FACULTY)
                && savedUser.getPersonalEmail() != null) {
            emailRecipient = savedUser.getPersonalEmail();
        }

        if (emailRecipient != null && !emailRecipient.isEmpty()) {
            emailService.sendCredentials(emailRecipient, savedUser.getName(), savedUser.getUserId(),
                    savedUser.getEmail(), rawPassword, savedUser.getRole().toString());
        }

        return savedUser;
    }

    // Update user status
    public User updateUserStatus(@NonNull Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setActive(active);
        return userRepository.save(user);
    }

    // Update user details
    public User updateUser(@NonNull Long id, @NonNull UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }

        // Allow updating program/year/parent details
        if (request.getProgram() != null)
            user.setProgram(request.getProgram());
        if (request.getSection() != null)
            user.setSection(request.getSection());
        if (request.getParentEmail() != null)
            user.setParentEmail(request.getParentEmail());
        if (request.getParentPhoneNumber() != null)
            user.setParentPhoneNumber(request.getParentPhoneNumber());

        // Update new fields
        if (request.getMobileNumber() != null)
            user.setMobileNumber(request.getMobileNumber());
        if (request.getCitizenship() != null)
            user.setCitizenship(request.getCitizenship());
        if (request.getGender() != null)
            user.setGender(request.getGender());
        if (request.getProfilePictureUrl() != null)
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        if (request.getPersonalEmail() != null)
            user.setPersonalEmail(request.getPersonalEmail());

        // Faculty / Extended fields
        if (request.getEmail() != null && !request.getEmail().isBlank())
            user.setEmail(request.getEmail().trim());
        if (request.getDepartment() != null)
            user.setDepartment(request.getDepartment());
        if (request.getDesignation() != null)
            user.setDesignation(request.getDesignation());
        if (request.getBio() != null)
            user.setBio(request.getBio());

        // Update active status if needed, though usually handled by separate endpoint
        // user.setActive(request.isActive());

        return userRepository.save(user);
    }

    // Delete user
    public void deleteUser(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        userRepository.delete(user);
    }

    // Reset Password
    public User resetPassword(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // Generate default password: FirstName@ddMM
        String firstName = user.getName().trim().split("\\s+")[0];
        String rawPassword;

        if (user.getDob() != null) {
            rawPassword = firstName + "@" +
                    user.getDob().format(DateTimeFormatter.ofPattern("ddMM"));
        } else {
            // Fallback if DOB is missing (shouldn't happen for valid users but good for
            // safety)
            rawPassword = firstName + "@1234";
        }

        user.setPassword(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    // Save user
    public User save(@NonNull User user) {
        return userRepository.save(user);
    }

    // Update permissions
    public User updatePermissions(@NonNull Long id, java.util.Set<String> permissions) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setPermissions(permissions);
        return userRepository.save(user);
    }
}