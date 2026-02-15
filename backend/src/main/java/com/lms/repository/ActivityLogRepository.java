package com.lms.repository;

import com.lms.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserIdOrderByTimestampDesc(String userId);

    // For dashboard stats - count logins today
    long countByActionAndTimestampAfter(String action, java.time.LocalDateTime timestamp);

    List<ActivityLog> findAllByOrderByTimestampDesc();
}
