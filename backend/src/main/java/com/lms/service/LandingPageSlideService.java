package com.lms.service;

import com.lms.model.LandingPageSlide;
import com.lms.repository.LandingPageSlideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LandingPageSlideService {

    @Autowired
    private LandingPageSlideRepository repository;

    public List<LandingPageSlide> getAllActiveSlides() {
        return repository.findAllByActiveTrueOrderBySortOrderAsc();
    }

    public List<LandingPageSlide> getAllSlidesForAdmin() {
        return repository.findAllByOrderBySortOrderAsc();
    }

    public LandingPageSlide addSlide(String fileUrl, String fileType) {
        LandingPageSlide slide = new LandingPageSlide();
        slide.setFileUrl(fileUrl);
        slide.setFileType(fileType);
        slide.setActive(true);
        // Set sort order to be last
        long count = repository.count();
        slide.setSortOrder((int) count + 1);
        return repository.save(slide);
    }

    public void deleteSlide(Long id) {
        repository.deleteById(id);
    }

    // Potential for reordering later
}
