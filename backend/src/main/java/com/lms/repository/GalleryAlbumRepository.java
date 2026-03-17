package com.lms.repository;

import com.lms.model.GalleryAlbum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryAlbumRepository extends JpaRepository<GalleryAlbum, Long> {
    List<GalleryAlbum> findAllByActiveTrueOrderByCreatedAtDesc();
    List<GalleryAlbum> findAllByOrderByCreatedAtDesc();
}
