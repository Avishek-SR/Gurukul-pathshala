package com.lms.repository;

import com.lms.model.Course;
import com.lms.model.Enrollment;
import com.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // All enrollments for a student
    List<Enrollment> findByStudent(User student);

    // All enrollments for a course
    List<Enrollment> findByCourse(Course course);

    // Check if a student is already enrolled in a course
    Optional<Enrollment> findByStudentAndCourse(User student, Course course);

    // Count enrolled courses for a student
    long countByStudent(User student);

    // Count students in a course
    long countByCourse(Course course);

    // Drop all enrollments for a specific student
    void deleteByStudent(User student);
}
