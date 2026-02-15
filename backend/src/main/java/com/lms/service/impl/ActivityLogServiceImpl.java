package com.lms.service.impl;

import com.lms.model.ActivityLog;
import com.lms.repository.ActivityLogRepository;
import com.lms.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Override
    public void logActivity(String userId, String action, String description) {
        ActivityLog log = new ActivityLog(userId, action, description);
        activityLogRepository.save(log);
    }

    @Override
    public List<ActivityLog> getUserLogs(String userId) {
        return activityLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    @Override
    public long getTodayLoginCount() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return activityLogRepository.countByActionAndTimestampAfter("LOGIN", startOfDay);
    }

    @Override
    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }
}
