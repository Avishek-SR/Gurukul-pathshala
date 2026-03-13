package com.lms.repository;

import com.lms.model.AdmissionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AdmissionApplicationRepository extends JpaRepository<AdmissionApplication, Long> {
    Optional<AdmissionApplication> findTopByOrderByIdDesc();
    List<AdmissionApplication> findByStatus(String status);
}
