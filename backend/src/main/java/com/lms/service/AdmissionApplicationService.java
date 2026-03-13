package com.lms.service;

import com.lms.model.AdmissionApplication;
import com.lms.model.User;
import com.lms.model.Role;
import com.lms.repository.AdmissionApplicationRepository;
import com.lms.dto.CreateUserRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

@Service
@Transactional
public class AdmissionApplicationService {

    private final AdmissionApplicationRepository repository;
    private final UserService userService;

    public AdmissionApplicationService(AdmissionApplicationRepository repository, UserService userService) {
        this.repository = repository;
        this.userService = userService;
    }

    public List<AdmissionApplication> getAllApplications() {
        return repository.findAll();
    }

    public AdmissionApplication submitApplication(AdmissionApplication application) {
        application.setApplicationId(generateApplicationId());
        application.setStatus("PENDING");
        return repository.save(application);
    }

    public AdmissionApplication approveApplication(Long id) {
        AdmissionApplication app = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        if (!"PENDING".equals(app.getStatus())) {
            throw new IllegalStateException("Only PENDING applications can be approved");
        }

        // 1. Convert Application to a CreateUserRequest
        CreateUserRequest req = new CreateUserRequest();
        req.setName(app.getStudentName());
        req.setDob(app.getDob());
        req.setGender(app.getGender());
        req.setParentName(app.getParentName());
        req.setParentEmail(app.getParentEmail());
        req.setParentPhoneNumber(app.getMobileNumber());
        req.setMobileNumber(app.getMobileNumber());
        req.setProgram(app.getClassApplying());
        req.setRole(Role.STUDENT.name());
        
        // 2. Delegate the actual creation (ID gen, Password gen, Email send, course enrollment)
        User generatedStudent = userService.createUserFromAdmin(req);

        // 3. Update the application status
        app.setStatus("APPROVED");
        app.setGeneratedStudentId(generatedStudent.getUserId());
        return repository.save(app);
    }

    public AdmissionApplication rejectApplication(Long id) {
        AdmissionApplication app = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        if (!"PENDING".equals(app.getStatus())) {
            throw new IllegalStateException("Only PENDING applications can be rejected");
        }

        app.setStatus("REJECTED");
        return repository.save(app);
    }

    public void deleteApplication(Long id) {
        AdmissionApplication app = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        repository.delete(app);
    }

    private String generateApplicationId() {
        String currentYear = String.valueOf(Year.now().getValue());
        String prefix = "ADM-" + currentYear + "-";

        return repository.findTopByOrderByIdDesc()
                .map(lastApp -> {
                    String lastId = lastApp.getApplicationId();
                    if (lastId != null && lastId.startsWith(prefix)) {
                        try {
                            int sequence = Integer.parseInt(lastId.substring(prefix.length()));
                            return prefix + String.format("%04d", sequence + 1);
                        } catch (NumberFormatException ignored) {}
                    }
                    return prefix + "0001";
                })
                .orElse(prefix + "0001");
    }
}
