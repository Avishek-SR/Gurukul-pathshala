package com.lms.controller;

import com.lms.dto.TimetableDTO;
import com.lms.model.User;
import com.lms.service.TimetableService;
import com.lms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("")
public class TimetableController {

    @Autowired
    private TimetableService timetableService;

    @Autowired
    private UserService userService;

    // Admin endpoints
    @PostMapping("/admin/timetable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTimetableEntry(@RequestBody TimetableDTO dto) {
        try {
            TimetableDTO created = timetableService.createTimetableEntry(dto);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/admin/timetable/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTimetableEntry(@PathVariable Long id) {
        timetableService.deleteTimetableEntry(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/timetable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TimetableDTO>> getTimetableByClass(
            @RequestParam String program,
            @RequestParam("section") String section,
            @RequestParam(required = false, defaultValue = "Morning") String shift) {
        System.out.println(
                "GET /admin/timetable hit with: program=" + program + ", section=" + section + ", shift=" + shift);
        List<TimetableDTO> timetable = timetableService.getTimetableByProgramAndSection(program, section, shift);
        return ResponseEntity.ok(timetable);
    }

    @DeleteMapping("/admin/clear-timetable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllTimetables(
            @RequestParam String program,
            @RequestParam String section) {
        timetableService.deleteAllTimetables(program, section);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/timetable/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generateTimetable(
            @RequestParam String program,
            @RequestParam String section,
            @RequestParam(required = false, defaultValue = "Morning") String shift,
            @RequestParam(required = false) List<String> constraints) {
        timetableService.generateTimetable(program, section, shift, constraints);
        return ResponseEntity.ok().build();
    }

    // Faculty endpoints
    @GetMapping("/faculty/timetable")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<TimetableDTO>> getMyTimetable() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<TimetableDTO> timetable = timetableService.getTimetableForFaculty(user.getId());
        return ResponseEntity.ok(timetable);
    }

    @GetMapping("/student/timetable")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<TimetableDTO>> getStudentTimetable() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProgram() == null || user.getSection() == null) {
            return ResponseEntity.badRequest().build();
        }

        List<TimetableDTO> timetable = timetableService.getTimetableByProgramAndSection(user.getProgram(),
                user.getSection(),
                null);
        return ResponseEntity.ok(timetable);
    }
}
