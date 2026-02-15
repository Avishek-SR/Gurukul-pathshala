package com.lms.service;

import com.lms.model.FacultyAttendance;
import com.lms.model.User;
import com.lms.repository.FacultyAttendanceRepository;
import com.lms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class FacultyAttendanceService {

    private final FacultyAttendanceRepository facultyAttendanceRepository;
    private final UserRepository userRepository;

    public FacultyAttendanceService(FacultyAttendanceRepository facultyAttendanceRepository,
            UserRepository userRepository) {
        this.facultyAttendanceRepository = facultyAttendanceRepository;
        this.userRepository = userRepository;
    }

    public void markAttendance(Long facultyId, LocalDate date, boolean present) {
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new IllegalArgumentException("Faculty not found"));

        FacultyAttendance attendance = facultyAttendanceRepository.findByFacultyAndDate(faculty, date)
                .orElse(new FacultyAttendance());

        attendance.setFaculty(faculty);
        attendance.setDate(date);
        attendance.setPresent(present);

        facultyAttendanceRepository.save(attendance);
    }

    @Transactional(readOnly = true)
    public List<FacultyAttendance> getAttendanceByDate(LocalDate date) {
        return facultyAttendanceRepository.findByDate(date);
    }

    @Transactional(readOnly = true)
    public List<FacultyAttendance> getAttendanceByFaculty(Long facultyId) {
        return facultyAttendanceRepository.findByFaculty_Id(facultyId);
    }
}
