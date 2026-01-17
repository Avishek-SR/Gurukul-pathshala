package com.lms.controller;

import com.lms.model.AdmissionInfo;
import com.lms.repository.AdmissionInfoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public/admissions")
public class PublicAdmissionController {

    private final AdmissionInfoRepository repository;

    public PublicAdmissionController(AdmissionInfoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<AdmissionInfo> getActiveAdmissions() {
        return repository.findByActiveTrue();
    }
}