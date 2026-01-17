package com.lms.repository;

import com.lms.model.Student;
import com.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Find student by domain studentId
    Optional<Student> findByStudentId(String studentId);

    // Find student by linked User
    Optional<Student> findByUser(User user);

    // All students in a program/year
    List<Student> findByProgram(String program);
    List<Student> findByYear(String year);

    // Basic counts for analytics
    long countByProgram(String program);
    long countByYear(String year);
}
