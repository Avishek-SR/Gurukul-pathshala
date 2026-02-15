package com.lms.repository;

import com.lms.model.ActivityTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityTopicRepository extends JpaRepository<ActivityTopic, Long> {

        // Find all topics for a specific parent activity
        @Query("SELECT at FROM ActivityTopic at LEFT JOIN FETCH at.activity LEFT JOIN FETCH at.assignedStudent WHERE at.activity.id = :activityId ORDER BY at.createdAt DESC")
        List<ActivityTopic> findByActivityIdOrderByCreatedAtDesc(@Param("activityId") Long activityId);

        // Check if a specific student already has a topic assigned for this parent
        // activity
        @Query("SELECT at FROM ActivityTopic at WHERE at.activity.id = :activityId AND at.assignedStudent.id = :studentId")
        Optional<ActivityTopic> findByActivityIdAndAssignedStudentId(@Param("activityId") Long activityId,
                        @Param("studentId") Long studentId);
}
