package com.lms.controller;

import com.lms.model.AdmissionInfo;
import com.lms.model.AdmissionApplication;
import com.lms.repository.AdmissionInfoRepository;
import com.lms.service.AdmissionApplicationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public/admissions")
public class PublicAdmissionController {

    private final AdmissionInfoRepository infoRepository;
    private final AdmissionApplicationService applicationService;

    public PublicAdmissionController(AdmissionInfoRepository infoRepository, AdmissionApplicationService applicationService) {
        this.infoRepository = infoRepository;
        this.applicationService = applicationService;
    }

    @GetMapping
    public List<AdmissionInfo> getActiveAdmissions() {
        return infoRepository.findByActiveTrue();
    }

    @PostMapping("/apply")
    public AdmissionApplication submitApplication(@RequestBody AdmissionApplication application) {
        return applicationService.submitApplication(application);
    }
}