package com.lms.controller.admin;

import com.lms.model.AdmissionInfo;
import com.lms.repository.AdmissionInfoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/admissions")
public class AdminAdmissionController {

    private final AdmissionInfoRepository repository;

    public AdminAdmissionController(AdmissionInfoRepository repository) {
        this.repository = repository;
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
}