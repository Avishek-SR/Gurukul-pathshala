package com.lms.repository;

import com.lms.model.Assignment;
import com.lms.model.Course;
import com.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    // All active assignments
    List<Assignment> findByActiveTrue();

    // All assignments for a course
    List<Assignment> findByCourseAndActiveTrue(Course course);

    // All assignments created by a faculty
    List<Assignment> findByFacultyAndActiveTrue(User faculty);

    // Count assignments for a course
    long countByCourseAndActiveTrue(Course course);

    // Count assignments by faculty
    long countByFacultyAndActiveTrue(User faculty);

    // All assignments for a list of courses
    List<Assignment> findByCourseInAndActiveTrue(List<Course> courses);
}
