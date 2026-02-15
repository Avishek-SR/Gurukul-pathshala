package com.lms.service;

import com.lms.model.User;
import com.lms.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Primary;  // ADD THIS IMPORT

import java.util.Collections;

@Service
@Primary  // THIS TELLS SPRING TO USE THIS AS THE PRIMARY UserDetailsService
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user;
        
        // Try to find by email first (since Spring Security uses email as username)
        if (username.contains("@")) {
            user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
        } else {
            // Try by userId
            user = userRepository.findByUserId(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with userId: " + username));
        }

        // Create Spring Security User object
        return new org.springframework.security.core.userdetails.User(
                user.getUserId(),  // Use userId to match JWT subject and login
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}