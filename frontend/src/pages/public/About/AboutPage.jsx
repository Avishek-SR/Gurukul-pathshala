import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../../services/api';
import './PublicPages.css';

const AboutPage = () => {
  const [schoolName, setSchoolName] = useState('Gurukul Pathshala');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsAPI.getPublic();
        if (data.site_name) setSchoolName(data.site_name);
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
          <p>Discover the legacy and vision of {schoolName}.</p>
        </div>
      </div>

      <div className="container content-section">
        <div className="about-content">
          <div className="about-text">
            <h2>Our History</h2>
            <p>
              Founded with a vision to provide holistic education, {schoolName} has been a beacon of knowledge and character building for over 40 years.
              From humble beginnings, we have grown into a premier institution known for academic excellence and co-curricular achievements.
            </p>

            <h2>Our Mission</h2>
            <p>
              To empower students with knowledge, skills, and values that enable them to become responsible citizens and global leaders.
              We believe in nurturing every child's potential through a balanced curriculum and a supportive environment.
            </p>

            <h2>Our Vision</h2>
            <p>
              To be a center of excellence in education, fostering innovation, critical thinking, and ethical leadership in a rapidly changing world.
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