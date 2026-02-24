package com.lms.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "landing_page_slides")
@Data
public class LandingPageSlide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileUrl;

    @Column(nullable = false)
    private String fileType; // "IMAGE" or "VIDEO"

    private Integer sortOrder;

    private Boolean active = true;
}
