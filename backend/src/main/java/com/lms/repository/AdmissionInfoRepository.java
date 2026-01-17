package com.lms.repository;

import com.lms.model.AdmissionInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdmissionInfoRepository extends JpaRepository<AdmissionInfo, Long> {

    // Public site should show only active admission info
    List<AdmissionInfo> findByActiveTrue();
}