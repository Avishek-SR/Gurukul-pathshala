import React, { useState, useEffect } from "react";
import { settingsAPI } from "../../../services/api";
import "./AcademicPage.css";

export default function AcademicPage() {
  const [activeSection, setActiveSection] = useState("curriculum");
  const [pageContent, setPageContent] = useState({
    academics_hero_title: 'Academic Excellence at Gurukul Pathshala',
    academics_hero_subtitle: 'Nurturing minds, shaping futures through a holistic and innovative curriculum',
    academics_stat_board: '98%',
    academics_stat_faculty: '50+',
    academics_stat_years: '15+',
    academics_stat_alumni: '1000+',
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const settings = await settingsAPI.getPublic();
        if (settings) {
          setPageContent({
            academics_hero_title: settings['academics_hero_title'] || 'Academic Excellence at Gurukul Pathshala',
            academics_hero_subtitle: settings['academics_hero_subtitle'] || 'Nurturing minds, shaping futures through a holistic and innovative curriculum',
            academics_stat_board: settings['academics_stat_board'] || '98%',
            academics_stat_faculty: settings['academics_stat_faculty'] || '50+',
            academics_stat_years: settings['academics_stat_years'] || '15+',
            academics_stat_alumni: settings['academics_stat_alumni'] || '1000+',
          });
        }
      } catch (err) {
        console.error('Failed to fetch academic page settings', err);
      }
    };
    fetchContent();
  }, []);

  const sections = [
    { id: "curriculum", label: "Curriculum", icon: "📚" },
    { id: "programs", label: "Programs", icon: "🎓" },
    { id: "faculty", label: "Faculty", icon: "👨‍🏫" },
    { id: "achievements", label: "Achievements", icon: "🏆" }
  ];

  return (
    <div className="academic-page">
      {/* Hero Section */}
      <section className="academic-hero">
        <div className="hero-content">
          <h1>{pageContent.academics_hero_title}</h1>
          <p className="hero-subtitle">
            {pageContent.academics_hero_subtitle}
          </p>
          <div className="academic-stats">
            <div className="stat-item">
              <div className="stat-number">{pageContent.academics_stat_board}</div>
              <div className="stat-label">Board Results</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{pageContent.academics_stat_faculty}</div>
              <div className="stat-label">Expert Faculty</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{pageContent.academics_stat_years}</div>
              <div className="stat-label">Years Excellence</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{pageContent.academics_stat_alumni}</div>
              <div className="stat-label">Successful Alumni</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="academic-navigation">
        <div className="nav-container">
          <div className="academic-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="academic-content">
        {/* Curriculum Section */}
        <section className={`academic-section ${activeSection === 'curriculum' ? 'active' : ''}`}>
          <div className="section-header">
            <h2>Our Comprehensive Curriculum</h2>
            <p>Designed to meet CBSE standards while fostering holistic development</p>
          </div>

          <div className="curriculum-overview">
            {curriculumOverview.map((item, index) => (
              <div key={index} className="card overview-card">
                <div className="card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>

          {/* Add your curriculum content here */}
        </section>

        {/* Programs Section */}
        <section className={`academic-section ${activeSection === 'programs' ? 'active' : ''}`}>
          <div className="section-header">
            <h2>Academic Programs</h2>
            <p>Specialized learning pathways for every stage of development</p>
          </div>

          <div className="cards-grid">
            {academicPrograms.map((program, index) => (
              <div key={index} className="card">
                <div className="card-icon">{program.icon}</div>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <ul className="feature-list">
                  {program.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Faculty Section */}
        <section className={`academic-section ${activeSection === 'faculty' ? 'active' : ''}`}>
          <div className="section-header">
            <h2>Our Distinguished Faculty</h2>
            <p>Experienced educators dedicated to student success</p>
          </div>

          <div className="cards-grid">
            {facultyMembers.map((faculty, index) => (
              <div key={index} className="card faculty-card">
                <div className="faculty-avatar">
                  {faculty.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3>{faculty.name}</h3>
                <p>{faculty.qualification}</p>
                <div className="faculty-details">
                  <div className="detail-item">
                    <span className="detail-label">Subject:</span>
                    <span className="detail-value">{faculty.subject}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Experience:</span>
                    <span className="detail-value">{faculty.experience}</span>
                  </div>
                </div>
                <p className="faculty-bio">Passionate educator with expertise in innovative teaching methodologies</p>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section className={`academic-section ${activeSection === 'achievements' ? 'active' : ''}`}>
          <div className="section-header">
            <h2>Academic Achievements & Recognition</h2>
            <p>Celebrating excellence in education and student accomplishments</p>
          </div>

          <div className="timeline">
            {achievements.map((achievement, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-year">{achievement.year}</div>
                <div className="timeline-content">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section className="academic-cta">
        <div className="cta-content">
          <h2>Want to Learn More About Our Academic Programs?</h2>
          <p>Schedule a campus visit or consultation with our academic advisors</p>
          <div className="cta-buttons">
            <button className="cta-btn primary">📞 Contact Academic Office</button>
            <button className="cta-btn secondary">📋 Download Prospectus</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Sample data arrays
const curriculumOverview = [
  { icon: "🎯", title: "CBSE Aligned", description: "Following the latest CBSE guidelines and syllabus updates" },
  { icon: "🧠", title: "Holistic Approach", description: "Balancing academics with co-curricular activities" },
  { icon: "💡", title: "Innovative Methods", description: "Blended learning with technology integration" },
  { icon: "🌟", title: "Value-Based", description: "Integrating ethics and life skills in education" }
];

const academicPrograms = [
  {
    icon: "🎨",
    title: "Pre-Primary",
    description: "Foundational learning through play and exploration",
    features: ["Montessori-inspired learning", "Language development", "Creative arts"]
  },
  {
    icon: "📚",
    title: "Primary School",
    description: "Building strong academic foundations",
    features: ["Integrated curriculum", "Focus on core subjects", "Computer literacy"]
  },
  {
    icon: "🔬",
    title: "Middle School",
    description: "Developing critical thinking skills",
    features: ["Subject specialization", "Science & Math focus", "Project-based learning"]
  }
];

const facultyMembers = [
  { name: "Dr. Anil Sharma", qualification: "Ph.D. in Physics", subject: "Science", experience: "15+ years" },
  { name: "Mrs. Priya Mehta", qualification: "M.Sc., B.Ed.", subject: "Mathematics", experience: "12+ years" },
  { name: "Mr. Rajesh Kumar", qualification: "M.A. English, NET", subject: "English", experience: "10+ years" }
];

const achievements = [
  { year: "2023", title: "100% Board Results", description: "All students passed with distinction" },
  { year: "2022", title: "CBSE Excellence Award", description: "Top performing school in district" },
  { year: "2021", title: "Science Olympiad", description: "3 Gold medals at National level" }
];