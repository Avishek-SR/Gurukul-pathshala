package com.lms.controller.admin;

import com.lms.dto.AttendanceDTO;
import com.lms.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/attendance")
public class AdminAttendanceController {

    private final AttendanceService attendanceService;

    public AdminAttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * Get all attendance records (admin view)
     * GET /api/admin/attendance
     */
    @PostMapping("/batch")
    public ResponseEntity<Void> markBatchAttendance(@RequestBody com.lms.dto.BatchAttendanceDTO batchDTO) {
        attendanceService.markBatchAttendance(batchDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<AttendanceDTO>> getAllAttendance(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String date) {

        java.time.LocalDate parsedDate = (date != null && !date.isBlank())
                ? java.time.LocalDate.parse(date)
                : null;

        return ResponseEntity.ok(attendanceService.getAllAttendance(courseId, studentId, program, section, parsedDate));
    }

    /**
     * Get attendance for a specific student
     * GET /api/admin/attendance/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendance(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceForStudent(studentId));
    }

    /**
     * Get attendance for a specific course
     * GET /api/admin/attendance/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AttendanceDTO>> getCourseAttendance(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(attendanceService.getAttendanceForCourse(courseId));
    }

    /**
     * Mark or update attendance
     * POST /api/admin/attendance
     */
    @PostMapping
    public ResponseEntity<Void> saveAttendance(@RequestBody AttendanceDTO dto) {
        attendanceService.markAttendance(dto.getStudentId(), dto.getCourseId(), dto.isPresent());
        return ResponseEntity.ok().build();
    }
}
