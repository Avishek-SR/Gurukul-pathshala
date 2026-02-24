package com.lms.repository;

import com.lms.model.LandingPageSlide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandingPageSlideRepository extends JpaRepository<LandingPageSlide, Long> {
    List<LandingPageSlide> findAllByActiveTrueOrderBySortOrderAsc();

    List<LandingPageSlide> findAllByOrderBySortOrderAsc();
}
