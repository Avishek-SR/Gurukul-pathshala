package com.lms.service;

import com.lms.model.GalleryAlbum;
import com.lms.model.GalleryItem;
import com.lms.repository.GalleryAlbumRepository;
import com.lms.repository.GalleryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GalleryService {

    @Autowired
    private GalleryAlbumRepository albumRepository;

    @Autowired
    private GalleryItemRepository itemRepository;

    // --- Album operations ---

    public List<GalleryAlbum> getAllAlbumsForAdmin() {
        return albumRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<GalleryAlbum> getActiveAlbums() {
        return albumRepository.findAllByActiveTrueOrderByCreatedAtDesc();
    }

    public GalleryAlbum createAlbum(String name, String description) {
        GalleryAlbum album = new GalleryAlbum();
        album.setName(name);
        album.setDescription(description);
        album.setActive(true);
        return albumRepository.save(album);
    }

    public GalleryAlbum updateAlbum(Long id, String name, String description, Boolean active) {
        Optional<GalleryAlbum> opt = albumRepository.findById(id);
        if (opt.isEmpty()) throw new IllegalArgumentException("Album not found: " + id);
        GalleryAlbum album = opt.get();
        if (name != null) album.setName(name);
        if (description != null) album.setDescription(description);
        if (active != null) album.setActive(active);
        return albumRepository.save(album);
    }

    public void deleteAlbum(Long id) {
        // Also delete all items in this album
        GalleryAlbum album = albumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + id));
        List<GalleryItem> items = itemRepository.findAllByAlbumOrderBySortOrderAsc(album);
        itemRepository.deleteAll(items);
        albumRepository.deleteById(id);
    }

    // --- Item operations ---

    public List<GalleryItem> getItemsByAlbumId(Long albumId) {
        GalleryAlbum album = albumRepository.findById(albumId)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + albumId));
        return itemRepository.findAllByAlbumOrderBySortOrderAsc(album);
    }

    public List<GalleryItem> getActiveItemsByAlbumId(Long albumId) {
        GalleryAlbum album = albumRepository.findById(albumId)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + albumId));
        return itemRepository.findAllByAlbumAndActiveTrueOrderBySortOrderAsc(album);
    }

    public GalleryItem addItem(Long albumId, String fileUrl, String mediaType, String title, String description) {
        GalleryAlbum album = albumRepository.findById(albumId)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + albumId));
        GalleryItem item = new GalleryItem();
        item.setAlbum(album);
        item.setFileUrl(fileUrl);
        item.setMediaType(mediaType);
        item.setTitle(title);
        item.setDescription(description);
        // set cover image if album has none
        if (album.getCoverImageUrl() == null && "IMAGE".equals(mediaType)) {
            album.setCoverImageUrl(fileUrl);
            albumRepository.save(album);
        }
        return itemRepository.save(item);
    }

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }
}
