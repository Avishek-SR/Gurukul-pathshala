package com.lms.repository;

import com.lms.model.ClassroomActivity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomActivityRepository extends JpaRepository<ClassroomActivity, Long> {

    // Find all parent activities for a course
    @Query("SELECT ca FROM ClassroomActivity ca LEFT JOIN FETCH ca.course LEFT JOIN FETCH ca.createdBy WHERE ca.course.id = :courseId ORDER BY ca.createdAt DESC")
    List<ClassroomActivity> findByCourseIdOrderByCreatedAtDesc(@Param("courseId") Long courseId);
}
