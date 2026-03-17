package com.lms.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "gallery_items")
@Data
public class GalleryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Use EAGER + @JsonIgnoreProperties to avoid LazyInitializationException during serialization
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "album_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private GalleryAlbum album;

    @Column(nullable = false)
    private String fileUrl;

    @Column(nullable = false)
    private String mediaType; // "IMAGE" or "VIDEO"

    private String title;

    private String description;

    private Integer sortOrder = 0;

    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
