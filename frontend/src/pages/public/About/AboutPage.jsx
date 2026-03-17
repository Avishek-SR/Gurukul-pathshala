import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../../services/api';
import './PublicPages.css';

const AboutPage = () => {
  const [schoolName, setSchoolName] = useState('Gurukul Pathshala');
  const [pageContent, setPageContent] = useState({
    about_page_subtitle: 'Discover the legacy and vision of our school.',
    about_history: 'Founded with a vision to provide holistic education, Gurukul Pathshala has been a beacon of knowledge and character building for over 40 years. From humble beginnings, we have grown into a premier institution known for academic excellence and co-curricular achievements.',
    about_mission: 'To empower students with knowledge, skills, and values that enable them to become responsible citizens and global leaders. We believe in nurturing every child\'s potential through a balanced curriculum and a supportive environment.',
    about_vision: 'To be a center of excellence in education, fostering innovation, critical thinking, and ethical leadership in a rapidly changing world.',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsAPI.getPublic();
        if (data.site_name) setSchoolName(data.site_name);
        setPageContent({
          about_page_subtitle: data['about_page_subtitle'] || 'Discover the legacy and vision of our school.',
          about_history: data['about_history'] || 'Founded with a vision to provide holistic education, Gurukul Pathshala has been a beacon of knowledge and character building for over 40 years.',
          about_mission: data['about_mission'] || 'To empower students with knowledge, skills, and values that enable them to become responsible citizens and global leaders.',
          about_vision: data['about_vision'] || 'To be a center of excellence in education, fostering innovation, critical thinking, and ethical leadership in a rapidly changing world.',
        });
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
          <h1>About Us</h1>
        <p>Discover the legacy and vision of {schoolName}. {pageContent.about_page_subtitle}</p>
        </div>
      </div>

      <div className="container content-section">
        <div className="about-content">
          <div className="about-text">
            <h2>Our History</h2>
            <p>
              {pageContent.about_history}
            </p>

            <h2>Our Mission</h2>
            <p>
              {pageContent.about_mission}
            </p>

            <h2>Our Vision</h2>
            <p>
              {pageContent.about_vision}
            </p>
          </div>
          <div className="about-image">
            <img
              src="/images/about-school.jpg"
              alt="School Building"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x400/e0e0e0/888888?text=School+Image";
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;