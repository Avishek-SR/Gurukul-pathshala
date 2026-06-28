package com.lms.controller.admin;

import com.lms.model.AdmissionInfo;
import com.lms.model.AdmissionApplication;
import com.lms.repository.AdmissionInfoRepository;
import com.lms.service.AdmissionApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/admissions")
public class AdminAdmissionController {

    private final AdmissionInfoRepository repository;
    private final AdmissionApplicationService applicationService;

    public AdminAdmissionController(AdmissionInfoRepository repository,
                                    AdmissionApplicationService applicationService) {
        this.repository = repository;
        this.applicationService = applicationService;
    }

    // ── Admission Info (open/close dates, etc.) ──────────────────────────

    @GetMapping
    public List<AdmissionInfo> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public AdmissionInfo create(@RequestBody AdmissionInfo info) {
        return repository.save(info);
    }

    @PutMapping("/{id}")
    public AdmissionInfo update(@PathVariable Long id, @RequestBody AdmissionInfo updated) {
        AdmissionInfo existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission not found"));

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setEligibility(updated.getEligibility());
        existing.setFeeStructure(updated.getFeeStructure());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setActive(updated.isActive());

        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    // ── Application Pipeline Endpoints ──────────────────────────────────

    @GetMapping("/applications")
    public List<AdmissionApplication> getAllApplications() {
        return applicationService.getAllApplications();
    }

    /**
     * STEP 1 — Accept: review passed, send entrance exam email.
     * Body: { "examDate": "...", "examVenue": "...", "examNotes": "..." }
     */
    @PutMapping("/applications/{id}/accept")
    public ResponseEntity<AdmissionApplication> acceptApplication(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(applicationService.acceptApplication(id, payload));
    }

    /**
     * STEP 2 — Mark Exam Done: student appeared for entrance exam.
     */
    @PutMapping("/applications/{id}/mark-exam-done")
    public ResponseEntity<AdmissionApplication> markExamDone(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.markExamScheduled(id));
    }

    /**
     * STEP 3 — Admit: evaluation passed, create student account and send credentials.
     */
    @PutMapping("/applications/{id}/admit")
    public ResponseEntity<AdmissionApplication> admitApplication(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.admitApplication(id));
    }

    /**
     * Reject at any active stage (PENDING, ACCEPTED, EXAM_SCHEDULED).
     * Sends rejection email to parent.
     */
    @PutMapping("/applications/{id}/reject")
    public ResponseEntity<AdmissionApplication> rejectApplication(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.rejectApplication(id));
    }

    /**
     * Legacy approve endpoint — kept for backward compatibility, maps to admit.
     */
    @PutMapping("/applications/{id}/approve")
    public ResponseEntity<AdmissionApplication> approveApplication(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.admitApplication(id));
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}