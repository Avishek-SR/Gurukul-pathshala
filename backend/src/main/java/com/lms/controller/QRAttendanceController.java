package com.lms.controller;

import com.lms.model.User;
import com.lms.repository.UserRepository;
import com.lms.service.AttendanceService;
import com.lms.service.QRCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/attendance/qr")
public class QRAttendanceController {

    private final QRCodeService qrCodeService;
    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    public QRAttendanceController(QRCodeService qrCodeService, AttendanceService attendanceService,
            UserRepository userRepository) {
        this.qrCodeService = qrCodeService;
        this.attendanceService = attendanceService;
        this.userRepository = userRepository;
    }

    // Faculty Generates QR Token
    @GetMapping("/generate")
    public ResponseEntity<Map<String, String>> generateQRToken(@RequestParam Long courseId) {
        System.out.println("DEBUG: generateQRToken called with courseId: " + courseId);
        String facultyId = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("DEBUG: Authenticated faculty: " + facultyId);

        // TODO: Verify if faculty teaches this course (using CourseService or similar)

        String token = qrCodeService.generateToken(courseId, facultyId);
        return ResponseEntity.ok(Map.of("token", token));
    }

    // Student Scans QR Token
    @PostMapping("/scan")
    public ResponseEntity<String> scanQRToken(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String studentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            Long courseId = qrCodeService.validateToken(token);
            User student = userRepository.findByUserId(studentUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentUserId));

            attendanceService.markAttendance(student.getId(), courseId, true);
            return ResponseEntity.ok("Attendance marked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid or expired QR code");
        }
    }
}
