package com.lms.repository;

import com.lms.model.Role;
import com.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<User, Long> {

    // All faculty users
    List<User> findByRole(Role role);

    // Active faculty only
    List<User> findByRoleAndActiveTrue(Role role);

    // Find faculty by userId
    Optional<User> findByUserIdAndRole(String userId, Role role);

    // Count active faculty
    long countByRoleAndActiveTrue(Role role);
}
