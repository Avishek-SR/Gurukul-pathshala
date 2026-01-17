package com.lms.repository;

import com.lms.model.Notification;
import com.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // All notifications for a user
    List<Notification> findByUser(User user);

    // Unread notifications for a user
    List<Notification> findByUserAndReadFalse(User user);

    // Count unread notifications for a user
    long countByUserAndReadFalse(User user);
}
