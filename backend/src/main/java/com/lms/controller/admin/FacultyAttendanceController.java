package com.lms.controller.admin;

import com.lms.model.FacultyAttendance;
import com.lms.service.FacultyAttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/faculty-attendance")
public class FacultyAttendanceController {

    private final FacultyAttendanceService facultyAttendanceService;

    public FacultyAttendanceController(FacultyAttendanceService facultyAttendanceService) {
        this.facultyAttendanceService = facultyAttendanceService;
    }

    @PostMapping
    public ResponseEntity<Void> markAttendance(
            @RequestParam Long facultyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam boolean present) {
        facultyAttendanceService.markAttendance(facultyId, date, present);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<FacultyAttendance>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(facultyAttendanceService.getAttendanceByDate(date));
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<FacultyAttendance>> getByFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(facultyAttendanceService.getAttendanceByFaculty(facultyId));
    }
}
