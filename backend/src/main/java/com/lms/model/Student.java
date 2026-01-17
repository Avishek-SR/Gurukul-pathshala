package com.lms.model;

import jakarta.persistence.*;

@Entity
public class Student {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String studentId;
  private String name;
  private String program;
  private String year;
  private double gpa;
  private int attendance;

  @OneToOne
  @JoinColumn(name = "user_id")
  private User user;

  // getters & setters
}
