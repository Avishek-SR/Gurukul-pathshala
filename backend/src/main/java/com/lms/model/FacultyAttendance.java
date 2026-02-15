package com.lms.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_attendance", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "date" }))
public class FacultyAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User faculty;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private boolean present;

    @CreationTimestamp
    @Column(name = "marked_at", updatable = false)
    private LocalDateTime markedAt;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getFaculty() {
        return faculty;
    }

    public void setFaculty(User faculty) {
        this.faculty = faculty;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }

    public LocalDateTime getMarkedAt() {
        return markedAt;
    }
}
