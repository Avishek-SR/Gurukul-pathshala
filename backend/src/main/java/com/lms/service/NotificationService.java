package com.lms.service;

import com.lms.model.Notification;
import com.lms.model.User;
import com.lms.repository.NotificationRepository;
import com.lms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a notification for a specific user.
     * Used by Admin/Faculty/Staff services.
     */
    public Notification createForUser(String userId, String title, String message) {

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Notification title is required");
        }
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Notification message is required");
        }

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setRead(false);

        return notificationRepository.save(n);
    }

    /**
     * Get all notifications for the logged-in user.
     */
    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications() {
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        return notificationRepository.findByUser(user);
    }

    /**
     * Mark a notification as read for the logged-in user.
     */
    public void markAsRead(Long notificationId) {
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));

        // Ensure users can modify only their own notifications
        if (!n.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        n.setRead(true);
        notificationRepository.save(n);
    }

    /**
     * Count unread notifications for the logged-in user.
     */
    @Transactional(readOnly = true)
    public long countUnread() {
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        return notificationRepository.countByUserAndReadFalse(user);
    }
}
