import React, { useState, useEffect } from 'react';
import { apiGet } from '../../../services/api';
import './GalleryPage.css';

const GalleryPage = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                // Utilizing the existing /public/landing-slides API to fetch dynamic images
                // You can reuse this API as a quick dynamic gallery source, or create a new dedicated /gallery endpoint
                const data = await apiGet('/public/landing-slides');
                setMediaItems(data);
            } catch (error) {
                console.error("Error fetching gallery images:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    return (
        <div className="gallery-page">
            <div className="page-header-section gallery-header">
                <div className="container">
                    <h1 className="gallery-title">School Gallery</h1>
                    <p className="gallery-subtitle">Discover the vibrant life, events, and facilities at our campus</p>
                </div>
            </div>

            <div className="container content-section">
                {loading ? (
                    <div className="gallery-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading beautiful moments...</p>
                    </div>
                ) : (
                    <div className="gallery-masonry">
                        {mediaItems && mediaItems.length > 0 ? (
                            mediaItems.map((item, index) => (
                                <div key={item.id || index} className="gallery-item">
                                    <div className="gallery-img-wrapper">
                                        {item.mediaType === 'VIDEO' ? (
                                            <video
                                                src={item.mediaUrl}
                                                className="gallery-media"
                                                controls
                                                loop
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={item.mediaUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2671&auto=format&fit=crop"}
                                                alt={item.title || `Gallery Image ${index + 1}`}
                                                className="gallery-media"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop";
                                                }}
                                            />
                                        )}
                                        <div className="gallery-overlay">
                                            <h3 className="gallery-overlay-title">{item.title || "Campus Life"}</h3>
                                            <p className="gallery-overlay-desc">{item.description || ""}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="gallery-empty-state">
                                <i className="fas fa-images gallery-empty-icon"></i>
                                <h2>No images in the gallery yet</h2>
                                <p>Check back soon for new updates and photos of our campus activities.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryPage;
