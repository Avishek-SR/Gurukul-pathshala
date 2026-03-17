import React, { useState, useEffect } from 'react';
import { galleryAPI, settingsAPI } from '../../../services/api';
import './GalleryPage.css';

const GalleryPage = () => {
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingItems, setLoadingItems] = useState(false);
    const [lightboxItem, setLightboxItem] = useState(null);
    const [pageContent, setPageContent] = useState({
        gallery_page_title: 'School Gallery',
        gallery_page_subtitle: 'Discover the vibrant life, events, and facilities at our campus',
    });

    useEffect(() => {
        // Load settings for page title/subtitle
        settingsAPI.getPublic().then(settings => {
            if (settings) {
                setPageContent({
                    gallery_page_title: settings['gallery_page_title'] || 'School Gallery',
                    gallery_page_subtitle: settings['gallery_page_subtitle'] || 'Discover the vibrant life, events, and facilities at our campus',
                });
            }
        }).catch(() => {});

        // Load albums
        const fetchAlbums = async () => {
            try {
                const data = await galleryAPI.getPublicAlbums();
                setAlbums(data);
                // Auto-select first album
                if (data.length > 0) {
                    setSelectedAlbum(data[0]);
                    const items = await galleryAPI.getPublicItems(data[0].id);
                    setMediaItems(items);
                }
            } catch (error) {
                console.error('Error fetching gallery albums:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlbums();
    }, []);

    const handleSelectAlbum = async (album) => {
        setSelectedAlbum(album);
        setLoadingItems(true);
        try {
            const items = await galleryAPI.getPublicItems(album.id);
            setMediaItems(items);
        } catch (e) {
            console.error('Error loading album items', e);
        } finally {
            setLoadingItems(false);
        }
    };

    return (
        <div className="gallery-page">
            <div className="page-header-section gallery-header">
                <div className="container">
                    <h1 className="gallery-title">{pageContent.gallery_page_title}</h1>
                    <p className="gallery-subtitle">{pageContent.gallery_page_subtitle}</p>
                </div>
            </div>

            <div className="container content-section">
                {loading ? (
                    <div className="gallery-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading beautiful moments...</p>
                    </div>
                ) : albums.length === 0 ? (
                    <div className="gallery-empty-state">
                        <i className="fas fa-images gallery-empty-icon"></i>
                        <h2>No albums in the gallery yet</h2>
                        <p>Check back soon for new updates and photos of our campus activities.</p>
                    </div>
                ) : (
                    <>
                        {/* Album Tabs */}
                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: '10px',
                            marginBottom: '28px', borderBottom: '2px solid #e0e0e0', paddingBottom: '14px'
                        }}>
                            {albums.map(album => (
                                <button
                                    key={album.id}
                                    onClick={() => handleSelectAlbum(album)}
                                    style={{
                                        padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                        background: selectedAlbum?.id === album.id ? '#20b2aa' : '#f0f0f0',
                                        color: selectedAlbum?.id === album.id ? '#fff' : '#333',
                                        fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s'
                                    }}
                                >
                                    📁 {album.name}
                                </button>
                            ))}
                        </div>

                        {/* Album Header */}
                        {selectedAlbum && (
                            <div style={{ marginBottom: '20px' }}>
                                <h2 style={{ color: '#20b2aa', fontSize: '1.4rem', marginBottom: '4px' }}>
                                    {selectedAlbum.name}
                                </h2>
                                {selectedAlbum.description && (
                                    <p style={{ color: '#666', fontSize: '0.95rem' }}>{selectedAlbum.description}</p>
                                )}
                            </div>
                        )}

                        {/* Media Grid */}
                        {loadingItems ? (
                            <div className="gallery-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading photos...</p>
                            </div>
                        ) : (
                            <div className="gallery-masonry">
                                {mediaItems.length === 0 ? (
                                    <div className="gallery-empty-state" style={{ gridColumn: '1/-1' }}>
                                        <p>No photos in this album yet.</p>
                                    </div>
                                ) : mediaItems.map((item, index) => (
                                    <div
                                        key={item.id || index}
                                        className="gallery-item"
                                        onClick={() => setLightboxItem(item)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="gallery-img-wrapper">
                                            {item.mediaType === 'VIDEO' ? (
                                                <video
                                                    src={item.fileUrl}
                                                    className="gallery-media"
                                                    muted
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={item.fileUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2671&auto=format&fit=crop'}
                                                    alt={item.title || `Gallery Image ${index + 1}`}
                                                    className="gallery-media"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop';
                                                    }}
                                                />
                                            )}
                                            <div className="gallery-overlay">
                                                <h3 className="gallery-overlay-title">{item.title || 'Campus Life'}</h3>
                                                <p className="gallery-overlay-desc">{item.description || ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Lightbox */}
            {lightboxItem && (
                <div
                    onClick={() => setLightboxItem(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, padding: '20px'
                    }}
                >
                    <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
                        <button
                            onClick={() => setLightboxItem(null)}
                            style={{
                                position: 'absolute', top: '-14px', right: '-14px',
                                background: '#fff', border: 'none', borderRadius: '50%',
                                width: '32px', height: '32px', cursor: 'pointer',
                                fontSize: '1.1rem', color: '#333', zIndex: 1
                            }}
                        >✕</button>
                        {lightboxItem.mediaType === 'VIDEO' ? (
                            <video src={lightboxItem.fileUrl} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '8px' }} />
                        ) : (
                            <img src={lightboxItem.fileUrl} alt={lightboxItem.title} style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '8px', display: 'block' }} />
                        )}
                        {(lightboxItem.title || lightboxItem.description) && (
                            <div style={{ color: '#fff', textAlign: 'center', marginTop: '12px' }}>
                                {lightboxItem.title && <strong style={{ fontSize: '1.1rem' }}>{lightboxItem.title}</strong>}
                                {lightboxItem.description && <p style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '4px' }}>{lightboxItem.description}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;
