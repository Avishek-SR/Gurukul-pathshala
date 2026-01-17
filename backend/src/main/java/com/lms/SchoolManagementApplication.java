package com.lms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.lms") 
public class SchoolManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(SchoolManagementApplication.class, args);
    }
}