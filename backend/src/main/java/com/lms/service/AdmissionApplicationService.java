package com.lms.service;

import com.lms.model.AdmissionApplication;
import com.lms.model.User;
import com.lms.model.Role;
import com.lms.repository.AdmissionApplicationRepository;
import com.lms.dto.CreateUserRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdmissionApplicationService {

    private final AdmissionApplicationRepository repository;
    private final UserService userService;
    private final EmailService emailService;

    public AdmissionApplicationService(AdmissionApplicationRepository repository,
                                       UserService userService,
                                       EmailService emailService) {
        this.repository = repository;
        this.userService = userService;
        this.emailService = emailService;
    }

    public List<AdmissionApplication> getAllApplications() {
        return repository.findAll();
    }

    /**
     * STEP 0: Student submits online form → status = PENDING
     */
    public AdmissionApplication submitApplication(AdmissionApplication application) {
        application.setApplicationId(generateApplicationId());
        application.setStatus("PENDING");
        return repository.save(application);
    }

    /**
     * STEP 1: Admin reviews and accepts → status = ACCEPTED
     * Automatically sends entrance exam info email to parent.
     *
     * @param payload Map with keys: examDate, examVenue, examNotes
     */
    public AdmissionApplication acceptApplication(Long id, Map<String, String> payload) {
        AdmissionApplication app = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));

        if (!"PENDING".equals(app.getStatus())) {
            throw new IllegalStateException("Only PENDING applications can be accepted. Current status: " + app.getStatus());
        }

        // Store exam details
        String examDate  = payload.getOrDefault("examDate", "");
        String examVenue = payload.getOrDefault("examVenue", "");
        String examNotes = payload.getOrDefault("examNotes", "");

        app.setEntranceExamDate(examDate);
        app.setEntranceExamVenue(examVenue);
        app.setExamNotes(examNotes);
        app.setStatus("ACCEPTED");
        app.setReviewDate(LocalDateTime.now());
        repository.save(app);

        // Send entrance exam email asynchronously — won't block the response
        emailService.sendEntranceExamInfo(
                app.getParentEmail(),
                app.getStudentName(),
                app.getApplicationId(),
                app.getParentName(),
                examDate,
                examVenue,
                examNotes
        );

        return app;
    }

    /**
     * STEP 2: Admin marks exam as scheduled/done → status = EXAM_SCHEDULED
     */
    public AdmissionApplication markExamScheduled(Long id) {
        AdmissionApplication app = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));

        if (!"ACCEPTED".equals(app.getStatus())) {
            throw new IllegalStateException("Application must be in ACCEPTED state to mark exam. Current: " + app.getStatus());
        }

        app.setStatus("EXAM_SCHEDULED");
        return repository.save(app);
    }

    /**
     * STEP 3: Admin finalizes admission after evaluating exam → status = ADMITTED
     * Creates the student user account and sends credentials email.
     */
    public AdmissionApplication admitApplication(Long id) {
        AdmissionApplication app = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));

        if (!"EXAM_SCHEDULED".equals(app.getStatus())) {
            throw new IllegalStateException("Application must be in EXAM_SCHEDULED state to admit. Current: " + app.getStatus());
        }

        // Create the student user account
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

        User generatedStudent = userService.createUserFromAdmin(req);

        app.setStatus("ADMITTED");
        app.setGeneratedStudentId(generatedStudent.getUserId());
        app.setReviewDate(LocalDateTime.now());
        return repository.save(app);
    }

    /**
     * Can be called at PENDING or ACCEPTED stage.
     * Sends a rejection notification email to parent.
     */
    public AdmissionApplication rejectApplication(Long id) {
        AdmissionApplication app = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));

        String currentStatus = app.getStatus();
        if (!"PENDING".equals(currentStatus) && !"ACCEPTED".equals(currentStatus) && !"EXAM_SCHEDULED".equals(currentStatus)) {
            throw new IllegalStateException("Cannot reject an application in status: " + currentStatus);
        }

        app.setStatus("REJECTED");
        app.setReviewDate(LocalDateTime.now());
        repository.save(app);

        // Send rejection email asynchronously
        emailService.sendRejectionNotice(
                app.getParentEmail(),
                app.getStudentName(),
                app.getApplicationId(),
                app.getParentName()
        );

        return app;
    }

    public void deleteApplication(Long id) {
        AdmissionApplication app = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));
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
