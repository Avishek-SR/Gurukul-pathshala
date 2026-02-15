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
            // Log error but don't rethrow to interrupt user creation
        }
    }
}
