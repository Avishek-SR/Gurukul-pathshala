
package com.lms.repository;

import com.lms.model.Course;
import com.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByCode(String code);

    List<Course> findByActiveTrue();

    List<Course> findByFaculty(User faculty);

    boolean existsByCode(String code);

    long countByActiveTrue();

    List<Course> findByProgram(String program);
}