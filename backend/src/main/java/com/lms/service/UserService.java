package com.lms.service;

import com.lms.model.User;
import com.lms.model.Role;
import com.lms.repository.UserRepository;
import com.lms.dto.CreateUserRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private String generateUniqueUserId(String name, LocalDate dob) {
        String firstName = name.split(" ")[0].toLowerCase().replaceAll("[^a-z]", "");
        String datePart = dob.format(DateTimeFormatter.ofPattern("ddMMyy"));
        String base = firstName + datePart;

        String candidate = base;
        int counter = 1;

        while (userRepository.findByUserId(candidate).isPresent()) {
            candidate = base + counter;
            counter++;
        }

        return candidate;
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get users by role - accept String parameter
    public List<User> getUsersByRole(String role) {
        try {
            Role r = Role.valueOf(role.toUpperCase());
            return userRepository.findByRole(r.name());
        } catch (Exception e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

    // Find user by ID
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // Find user by email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Find user by user ID
    public Optional<User> findByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

    // Create new user
    public User createUser(User user) {

        // If userId is not provided, generate it from Name + DOB
        if (user.getUserId() == null || user.getUserId().isBlank()) {
            if (user.getDob() == null) {
                throw new RuntimeException("DOB is required to generate User ID");
            }

            String generatedId = generateUniqueUserId(user.getName(), user.getDob());
            user.setUserId(generatedId);

            // Auto-generate official email
            user.setEmail(generatedId + "@school.com");

            // Generate default password: FirstName@ddMM
            String firstName = user.getName().split(" ")[0];
            String rawPassword = firstName + "@" +
                    user.getDob().format(DateTimeFormatter.ofPattern("ddMM"));
            user.setPassword(rawPassword);
        }

        // Check if user ID already exists (for manually provided IDs)
        if (userRepository.findByUserId(user.getUserId()).isPresent()) {
            throw new RuntimeException("User ID already exists: " + user.getUserId());
        }

        // Check if email already exists
        if (user.getEmail() != null && userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set default values if not provided
        if (user.getRole() == null) {
            user.setRole(Role.STUDENT);
        }

        user.setActive(true);
        user.setFailedAttempts(0);
        user.setLocked(false);

        return userRepository.save(user);
    }

    public User createUserFromAdmin(CreateUserRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Name is required");
        }

        if (request.getDob() == null) {
            throw new RuntimeException("Date of birth is required");
        }

        if (request.getRole() == null || request.getRole().isBlank()) {
            throw new RuntimeException("Role is required");
        }

        // Generate unique userId from Name + DOB
        String userId = generateUniqueUserId(request.getName(), request.getDob());

        // Auto-generate email
        String email = userId + "@school.com";

        // Generate default password: FirstName@ddMM
        String firstName = request.getName().trim().split("\\s+")[0];
        String rawPassword = firstName + "@" +
                request.getDob().format(DateTimeFormatter.ofPattern("ddMM"));

        User user = new User();
        user.setUserId(userId);
        user.setName(request.getName().trim());
        user.setDob(request.getDob());
        user.setEmail(email);
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        user.setPassword(passwordEncoder.encode(rawPassword));

        // Defaults
        user.setActive(true);
        user.setLocked(false);
        user.setFailedAttempts(0);

        return userRepository.save(user);
    }

    // Update user status
    public User updateUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setActive(active);
        return userRepository.save(user);
    }

    // Delete user
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        userRepository.delete(user);
    }

    // Save user
    public User save(User user) {
        return userRepository.save(user);
    }
}