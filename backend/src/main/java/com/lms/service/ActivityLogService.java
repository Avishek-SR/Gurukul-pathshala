package com.lms.service;

import com.lms.model.ActivityLog;

import java.util.List;

public interface ActivityLogService {
    void logActivity(String userId, String action, String description);

    List<ActivityLog> getUserLogs(String userId);

    long getTodayLoginCount();

    List<ActivityLog> getAllLogs();
}
