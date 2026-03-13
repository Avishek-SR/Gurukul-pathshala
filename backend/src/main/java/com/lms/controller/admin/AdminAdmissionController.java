package com.lms.controller.admin;

import com.lms.model.AdmissionInfo;
import com.lms.model.AdmissionApplication;
import com.lms.repository.AdmissionInfoRepository;
import com.lms.service.AdmissionApplicationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/admissions")
public class AdminAdmissionController {

    private final AdmissionInfoRepository repository;
    private final AdmissionApplicationService applicationService;

    public AdminAdmissionController(AdmissionInfoRepository repository, AdmissionApplicationService applicationService) {
        this.repository = repository;
        this.applicationService = applicationService;
    }

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

    // --- Application Endpoints ---

    @GetMapping("/applications")
    public List<AdmissionApplication> getAllApplications() {
        return applicationService.getAllApplications();
    }

    @PutMapping("/applications/{id}/approve")
    public AdmissionApplication approveApplication(@PathVariable Long id) {
        return applicationService.approveApplication(id);
    }

    @PutMapping("/applications/{id}/reject")
    public AdmissionApplication rejectApplication(@PathVariable Long id) {
        return applicationService.rejectApplication(id);
    }

    @DeleteMapping("/applications/{id}")
    public void deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
    }
}