package com.lms.repository;

import com.lms.model.Attendance;
import com.lms.model.Course;
import com.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // All attendance records for a student
    List<Attendance> findByStudent(User student);

    // All attendance records for a student in a course
    List<Attendance> findByStudentAndCourse(User student, Course course);

    // Attendance for a student on a specific date in a course
    Optional<Attendance> findByStudentAndCourseAndDate(User student, Course course, LocalDate date);

    // Count total classes for a student in a course
    long countByStudentAndCourse(User student, Course course);

    // Count present days for a student in a course
    long countByStudentAndCourseAndPresentTrue(User student, Course course);

    // All attendance records for a course
    List<Attendance> findByCourse(Course course);
}
