package com.lms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Async
    public void sendStudentCredentials(String toEmail, String studentName, String userId, String studentEmail,
            String password) {
        sendCredentials(toEmail, studentName, userId, studentEmail, password, "Student");
    }

    @Async
    public void sendCredentials(String toEmail, String name, String userId, String officialEmail, String password,
            String role) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            System.out.println("EmailService: No email provided for " + role + ": " + name);
            return;
        }

        String subject = "Welcome to Gurukul Pathshala - " + role + " Credentials";
        String recipientType = role.equalsIgnoreCase("Student") ? "Parent" : role;

        String body = "Dear " + recipientType + ",\n\n" +
                "A new account has been created for " + name + ".\n\n" +
                "Here are the login credentials:\n" +
                "User ID: " + userId + "\n" +
                "Official Email: " + officialEmail + "\n" +
                "Password: " + password + "\n\n" +
                "Please change the password after the first login.\n\n" +
                "Best Regards,\n" +
                "Gurukul Admin Team";

        sendEmail(toEmail, subject, body);
    }

    /**
     * Sends an entrance examination notice to the parent's email
     * when an admission application is accepted by the admin.
     */
    @Async
    public void sendEntranceExamInfo(String toEmail, String studentName, String applicationId,
            String parentName, String examDate, String examVenue, String examNotes) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            System.out.println("EmailService: No parent email for application " + applicationId);
            return;
        }

        String subject = "Entrance Examination Notice - Gurukul Pathshala";

        String body = "Dear " + (parentName != null ? parentName : "Parent/Guardian") + ",\n\n" +
                "We are pleased to inform you that the admission application for " + studentName +
                " (Application ID: " + applicationId + ") has been reviewed and accepted " +
                "for the entrance examination.\n\n" +
                "-------------------------------\n" +
                "ENTRANCE EXAMINATION DETAILS\n" +
                "-------------------------------\n" +
                "Date & Time  : " + (examDate != null ? examDate : "To be announced") + "\n" +
                "Venue        : " + (examVenue != null ? examVenue : "School premises") + "\n" +
                (examNotes != null && !examNotes.trim().isEmpty() ? "Additional Info: " + examNotes + "\n" : "") +
                "-------------------------------\n\n" +
                "Please ensure the student is present on time with the following:\n" +
                "  - This notice email (printed or on phone)\n" +
                "  - Applicant's recent passport-size photo\n" +
                "  - Previous school report card (if applicable)\n\n" +
                "For any queries, please contact the school office.\n\n" +
                "Best Regards,\n" +
                "Gurukul Pathshala - Admissions Office";

        sendEmail(toEmail, subject, body);
    }

    /**
     * Sends a rejection notification email to the parent.
     */
    @Async
    public void sendRejectionNotice(String toEmail, String studentName, String applicationId, String parentName) {
        if (toEmail == null || toEmail.trim().isEmpty()) return;

        String subject = "Admission Application Update - Gurukul Pathshala";
        String body = "Dear " + (parentName != null ? parentName : "Parent/Guardian") + ",\n\n" +
                "Thank you for applying to Gurukul Pathshala.\n\n" +
                "After careful review, we regret to inform you that the admission application " +
                "for " + studentName + " (Application ID: " + applicationId + ") has not been " +
                "selected for the current academic term.\n\n" +
                "We encourage you to apply again in the next admission cycle.\n\n" +
                "For any questions, please contact the admissions office.\n\n" +
                "Best Regards,\n" +
                "Gurukul Pathshala - Admissions Office";

        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            javaMailSender.send(message);
            System.out.println("Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            // Log error but don't rethrow to interrupt the main workflow
        }
    }
}
