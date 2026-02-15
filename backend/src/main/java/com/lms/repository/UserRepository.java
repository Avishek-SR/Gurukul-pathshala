package com.lms.repository;

import com.lms.model.User;
import com.lms.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Basic methods
    Optional<User> findByEmail(String email);

    Optional<User> findByUserId(String userId);

    // Role enum methods
    List<User> findByRole(Role role);

    List<User> findByRoleAndActiveTrue(Role role);

    long countByRoleAndActiveTrue(Role role);

    long countByRole(Role role);

    // ADD THESE STRING METHODS for backward compatibility
    List<User> findByRole(String role);

    List<User> findByRoleAndActiveTrue(String role);

    long countByRoleAndActiveTrue(String role);

    // Other methods
    List<User> findByActiveTrue();

    Optional<User> findByIdAndActiveTrue(Long id);

    Optional<User> findByEmailAndActiveTrue(String email);

    // Count methods
    long countByActiveTrue();

    // ID Generation support
    Optional<User> findTopByUserIdStartingWithOrderByUserIdDesc(String prefix);

    // Count users created after a certain date (for admission trends)
    long countByRoleAndCreatedAtAfter(Role role, java.time.LocalDateTime date);

    // Count by Role and Gender
    long countByRoleAndGender(Role role, String gender);

    // Find latest user by role (for ID generation)
    Optional<User> findTopByRoleOrderByUserIdDesc(Role role);

    // Count users who logged in after a specific time
    long countByLastLoginAtAfter(java.time.LocalDateTime timestamp);
}