package com.lms.repository;

import com.lms.model.FacultyAttendance;
import com.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyAttendanceRepository extends JpaRepository<FacultyAttendance, Long> {
    Optional<FacultyAttendance> findByFacultyAndDate(User faculty, LocalDate date);

    List<FacultyAttendance> findByDate(LocalDate date);

    List<FacultyAttendance> findByFaculty_Id(Long facultyId);
}
