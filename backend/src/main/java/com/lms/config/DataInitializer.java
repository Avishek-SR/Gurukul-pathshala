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

        // Check if faculty exists
        if (userRepository.findByUserId("faculty001").isEmpty()) {
            User faculty = new User();
            faculty.setUserId("faculty001");
            faculty.setName("John Doe");
            faculty.setEmail("faculty@school.com");
            faculty.setPassword(passwordEncoder.encode("faculty123"));
            faculty.setRole(Role.FACULTY);
            faculty.setActive(true);
            faculty.setDepartment("Computer Science");
            faculty.setDesignation("Professor");
            
            userRepository.save(faculty);
            System.out.println("Faculty user created: faculty001");
        }

        // Check if student exists
        if (userRepository.findByUserId("student001").isEmpty()) {
            User student = new User();
            student.setUserId("student001");
            student.setName("Jane Smith");
            student.setEmail("student@school.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setRole(Role.STUDENT);
            student.setActive(true);
            student.setProgram("B.Tech");
            student.setYear("Third Year");
            
            userRepository.save(student);
            System.out.println("Student user created: student001");
        }
    }
}