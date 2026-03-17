import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../../services/api';
import './PublicPages.css';

const ContactPage = () => {
    const [contactInfo, setContactInfo] = useState({
        email: 'info@gurukul.com',
        phone: '+977-1234567890',
        address: 'Kathmandu, Nepal'
    });
    const [pageSubtitle, setPageSubtitle] = useState('Get in touch with us for admissions, inquiries, or support.');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsAPI.getPublic();
                setContactInfo({
                    email: data.contact_email || 'info@gurukul.com',
                    phone: data.contact_phone || '+977-1234567890',
                    address: data.contact_address || 'Kathmandu, Nepal'
                });
                if (data['contact_page_subtitle']) setPageSubtitle(data['contact_page_subtitle']);
            } catch (error) {
                console.error("Failed to load settings");
            }
        };
        fetchSettings();
    }, []);

    return (
        <>
            <div className="page-header-section">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>{pageSubtitle}</p>
                </div>
            </div>

            <div className="container content-section">
                <div className="contact-grid">
                    <div className="contact-info-card">
                        <h2>Get In Touch</h2>
                        <div className="info-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <div>
                                <h3>Address</h3>
                                <p>{contactInfo.address}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-phone"></i>
                            <div>
                                <h3>Phone</h3>
                                <p>{contactInfo.phone}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-envelope"></i>
                            <div>
                                <h3>Email</h3>
                                <p>{contactInfo.email}</p>
                            </div>
                        </div>

                        <div className="social-links-big">
                            <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>

                    <div className="contact-form-card">
                        <h2>Send us a Message</h2>
                        <form onSubmit={(e) => { e.preventDefault(); alert("Message sent functionality coming soon!"); }}>
                            <div className="form-group">
                                <label>Your Name</label>
                                <input type="text" className="form-control" placeholder="John Doe" required />
                            </div>
                            <div className="form-group">
                                <label>Your Email</label>
                                <input type="email" className="form-control" placeholder="john@example.com" required />
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input type="text" className="form-control" placeholder="Admissions Inquiry" required />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea className="form-control" rows="5" placeholder="How can we help you?" required></textarea>
                            </div>
                            <button type="submit" className="btn-primary">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactPage;
