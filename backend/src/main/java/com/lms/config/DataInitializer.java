package com.lms.config;

import com.lms.model.User;
import com.lms.model.Role;
import com.lms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if admin already exists
        if (userRepository.findByUserId("admin001").isEmpty()) {
            User admin = new User();
            admin.setUserId("admin001");
            admin.setName("Administrator");
            admin.setEmail("admin@school.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setActive(true);

            userRepository.save(admin);
            System.out.println("Admin user created: admin001");
        }
    }
}