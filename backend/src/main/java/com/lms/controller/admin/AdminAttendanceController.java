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
    @GetMapping
    public ResponseEntity<List<AttendanceDTO>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    /**
     * Get attendance for a specific student
     * GET /api/admin/attendance/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendance(
            @PathVariable Long studentId
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceForStudent(studentId));
    }

    /**
     * Get attendance for a specific course
     * GET /api/admin/attendance/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AttendanceDTO>> getCourseAttendance(
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceForCourse(courseId));
    }

    /**
     * Mark or update attendance
     * POST /api/admin/attendance
     */
    @PostMapping
    public ResponseEntity<Void> saveAttendance(@RequestBody AttendanceDTO dto) {
        attendanceService.saveAttendance(dto);
        return ResponseEntity.ok().build();
    }
}
