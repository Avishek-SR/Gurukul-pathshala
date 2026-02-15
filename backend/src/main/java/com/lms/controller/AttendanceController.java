package com.lms.controller;

import com.lms.dto.AttendanceDTO;
import com.lms.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // Get attendance for a specific course and date (for Faculty view)
    @GetMapping
    public ResponseEntity<List<AttendanceDTO>> getAttendance(
            @RequestParam Long courseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<AttendanceDTO> list = attendanceService.getAttendanceForCourse(courseId);

        if (date != null) {
            list = list.stream()
                    .filter(a -> a.getDate().isEqual(date))
                    .toList();
        }

        return ResponseEntity.ok(list);
    }

    // Bulk mark attendance (Faculty/Admin)
    @PostMapping("/bulk")
    public ResponseEntity<Void> markBulkAttendance(@RequestBody List<AttendanceDTO> records) {
        for (AttendanceDTO record : records) {
            attendanceService.markAttendance(
                    record.getStudentId(),
                    record.getCourseId(),
                    record.isPresent());
        }
        return ResponseEntity.ok().build();
    }
}
