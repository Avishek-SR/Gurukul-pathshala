package com.lms.repository;

import com.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Basic methods
    Optional<User> findByEmail(String email);
    Optional<User> findByUserId(String userId);
    List<User> findByRole(String role);
    
    // If you need these methods, add them:
    List<User> findByActiveTrue();
    Optional<User> findByIdAndActiveTrue(Long id);
    Optional<User> findByEmailAndActiveTrue(String email);
    List<User> findByRoleAndActiveTrue(String role);
    
    // Count methods (for StatsService)
    long countByActiveTrue();
    long countByRoleAndActiveTrue(String role);
}