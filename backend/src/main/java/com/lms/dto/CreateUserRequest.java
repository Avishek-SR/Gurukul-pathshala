package com.lms.dto;

import java.time.LocalDate;

public class CreateUserRequest {

    private String name;
    private LocalDate dob;
    private String role;

    public CreateUserRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
