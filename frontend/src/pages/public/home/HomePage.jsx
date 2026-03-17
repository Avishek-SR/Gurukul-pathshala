import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { noticeAPI, settingsAPI, landingSlidesAPI } from "../../../services/api";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [admissionsOpen, setAdmissionsOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [pageContent, setPageContent] = useState({
    hero_title: 'Welcome to Gurukul Pathshala',
    hero_subtitle: '"We believe in excellence in education, Quality Education is our Motto."',
    stat_years: '40+',
    stat_alumni: '5000+',
    stat_faculty: '50+',
    stat_satisfaction: '100%',
    know_gurukul_desc: 'Founded in 1980, stands at the intersection of discipline, innovation, and holistic education. We shape future-ready citizens through values, skills, and knowledge.',
    know_gurukul_mission: 'Our mission is to provide quality education that nurtures intellectual curiosity, critical thinking, and ethical values in every student.',
    site_name: 'Gurukul Pathshala'
  });

  // Slides State
  const [schoolImages, setSchoolImages] = useState([]);

  // Load notices and slides
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Global Settings
        const settings = await settingsAPI.getPublic();
        if (settings) {
          if (settings['admissions_open'] === 'false') setAdmissionsOpen(false);
          setPageContent({
            hero_title: settings['hero_title'] || 'Welcome to Gurukul Pathshala',
            hero_subtitle: settings['hero_subtitle'] || '"We believe in excellence in education, Quality Education is our Motto."',
            stat_years: settings['stat_years'] || '40+',
            stat_alumni: settings['stat_alumni'] || '5000+',
            stat_faculty: settings['stat_faculty'] || '50+',
            stat_satisfaction: settings['stat_satisfaction'] || '100%',
            know_gurukul_desc: settings['know_gurukul_desc'] || `Founded in 1980, ${settings['site_name'] || 'Gurukul Pathshala'} stands at the intersection of discipline, innovation, and holistic education. We shape future-ready citizens through values, skills, and knowledge.`,
            know_gurukul_mission: settings['know_gurukul_mission'] || 'Our mission is to provide quality education that nurtures intellectual curiosity, critical thinking, and ethical values in every student.',
            site_name: settings['site_name'] || 'Gurukul Pathshala'
          });
        }

        // Fetch Slides
        const slides = await landingSlidesAPI.getPublic();
        if (slides && slides.length > 0) {
          setSchoolImages(slides.map(s => {
            let url = s.fileUrl;
            if (url && url.startsWith('/api/uploads')) {
              const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
              const baseUrl = API_BASE_URL.replace(/\/api$/, '');
              url = `${baseUrl}${url}`;
            }
            return {
              url: url,
              type: s.fileType
            };
          }));
        } else {
          // Fallback to defaults if no slides found
          setSchoolImages([
            { url: "/images/Avishek.JPG", type: "IMAGE" },
            { url: "/images/Home.jpg", type: "IMAGE" },
            { url: "/images/know-gurukul.jpg", type: "IMAGE" }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        // Fallback defaults
        setSchoolImages([
          { url: "/images/Avishek.JPG", type: "IMAGE" },
          { url: "/images/Home.jpg", type: "IMAGE" },
          { url: "/images/know-gurukul.jpg", type: "IMAGE" }
        ]);
      }
    };
    fetchData();
  }, []);

  // Auto scroll through images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % schoolImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [schoolImages.length]);

  // Navigation functions
  const goToSlide = (index) => setCurrentSlide(index);
  const goToPrevSlide = () => setCurrentSlide((prev) => (prev === 0 ? schoolImages.length - 1 : prev - 1));
  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % schoolImages.length);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        {schoolImages.length > 0 ? (
          <div className="slider-container">
            <div
              className="slider-track"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
                transition: 'transform 1s ease-in-out'
              }}
            >
              {schoolImages.map((slide, index) => (
                <div key={index} className="slide">
                  {slide.type === 'VIDEO' ? (
                    <video
                      src={slide.url}
                      className="slide-image object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={slide.url}
                      alt={`Slide ${index + 1}`}
                      className="slide-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/1600x800/20b2aa/ffffff?text=GURUKUL+Image+${index + 1}`;
                      }}
                    />
                  )}
                  <div className="slide-overlay"></div>
                </div>
              ))}
            </div>

            <button className="slider-nav prev" onClick={goToPrevSlide}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="slider-nav next" onClick={goToNextSlide}>
              <i className="fas fa-chevron-right"></i>
            </button>

            <div className="slider-dots">
              {schoolImages.map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center bg-gray-200">
            <p>No slides available</p>
          </div>
        )}

        <div className="hero-content">
          <h1>{pageContent.hero_title}</h1>
          <p>{pageContent.hero_subtitle}</p>
          <div className="hero-buttons">
            <a
              href="#admissions"
              className="btn-primary"
              onClick={(e) => {
                e.preventDefault();
                navigate('/admissions');
              }}
            >
              {admissionsOpen ? 'Admissions Open' : 'Admissions Closed'}
            </a>
            <a
              href="#know-gurukul"
              className="btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('.know-gurukul-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Admissions Section */}
      <section id="admissions" className="highlights-section">
        <div className="container">
          <div className="section-header">
            <h2>Admissions & Programs</h2>
            <p>Join our vibrant learning community</p>
          </div>
          <div className="highlights-grid">
            <div className="highlight-card">
              <div className="highlight-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h2>{admissionsOpen ? 'Admissions Open' : 'Admissions Closed'}</h2>
              <p>
                {admissionsOpen
                  ? 'Join our vibrant learning community today! Limited seats available.'
                  : 'We are currently not accepting new admission applications.'}
              </p>
              <button
                className="btn-small"
                onClick={() => navigate('/admissions')}
                style={!admissionsOpen ? { background: '#94a3b8', cursor: 'not-allowed' } : {}}
              >
                {admissionsOpen ? 'Apply Now' : 'Check Status'}
              </button>
            </div>

            <div className="highlight-card">
              <div className="highlight-icon">
                <i className="fas fa-laptop-house"></i>
              </div>
              <h2>Modern Classrooms</h2>
              <p>Smart technology-enabled education environment with digital learning tools.</p>
              <button className="btn-small">Virtual Tour</button>
            </div>

            <div className="highlight-card">
              <div className="highlight-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h2>Experienced Faculty</h2>
              <p>Dedicated educators with a passion for teaching and student success.</p>
              <button className="btn-small">Meet Faculty</button>
            </div>
          </div>
        </div>
      </section>

      {/* Know Gurukul Section */}
      <section id="know-gurukul" className="know-gurukul-section">
        <div className="container">
          <div className="know-gurukul-grid">
            <div className="know-gurukul-content">
              <h2>Know {pageContent.site_name}</h2>
              <p>
                {pageContent.know_gurukul_desc}
              </p>
              <p>
                {pageContent.know_gurukul_mission}
              </p>
              <a
                href="#about"
                className="btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  alert('About section coming soon!');
                }}
              >
                Discover More
              </a>
            </div>

            <div className="know-gurukul-image">
              <div className="image-placeholder">
                <i className="fas fa-university"></i>
                <span>{pageContent.site_name.toUpperCase()} Campus View</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>{pageContent.stat_years}</h3>
              <p>Years of Excellence</p>
            </div>
            <div className="stat-item">
              <h3>{pageContent.stat_alumni}</h3>
              <p>Successful Alumni</p>
            </div>
            <div className="stat-item">
              <h3>{pageContent.stat_faculty}</h3>
              <p>Expert Faculty</p>
            </div>
            <div className="stat-item">
              <h3>{pageContent.stat_satisfaction}</h3>
              <p>Student Satisfaction</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}