import React, { useState, useEffect } from "react";
import { apiGet, settingsAPI, getImageUrl } from "../../../services/api";
import "./AcademicPage.css";

export default function AcademicPage() {
  const [activeSection, setActiveSection] = useState("curriculum");
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  
  // Dynamic Lists State
  const [curriculumList, setCurriculumList] = useState(curriculumOverview);
  const [programsList, setProgramsList] = useState(academicPrograms);
  const [achievementsList, setAchievementsList] = useState(achievements);

  const [pageContent, setPageContent] = useState({
    academics_hero_title: 'Academic Excellence at Gurukul Pathshala',
    academics_hero_subtitle: 'Providing quality education from Nursery to Class 10 — shaping the minds of tomorrow',
    academics_stat_board: '98%',
    academics_stat_faculty: '50+',
    academics_stat_years: '15+',
    academics_stat_alumni: '1000+',
  });

  // Fetch page content settings
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const settings = await settingsAPI.getPublic();
        if (settings) {
          setPageContent({
            academics_hero_title: settings['academics_hero_title'] || 'Academic Excellence at Gurukul Pathshala',
            academics_hero_subtitle: settings['academics_hero_subtitle'] || 'Providing quality education from Nursery to Class 10 — shaping the minds of tomorrow',
            academics_stat_board: settings['academics_stat_board'] || '98%',
            academics_stat_faculty: settings['academics_stat_faculty'] || '50+',
            academics_stat_years: settings['academics_stat_years'] || '15+',
            academics_stat_alumni: settings['academics_stat_alumni'] || '1000+',
          });

          if (settings['academics_curriculum']) {
            try { setCurriculumList(JSON.parse(settings['academics_curriculum'])); } catch (e) { console.error('Failed to parse curriculum', e); }
          }
          if (settings['academics_programs']) {
            try { setProgramsList(JSON.parse(settings['academics_programs'])); } catch (e) { console.error('Failed to parse programs', e); }
          }
          if (settings['academics_achievements']) {
            try { setAchievementsList(JSON.parse(settings['academics_achievements'])); } catch (e) { console.error('Failed to parse achievements', e); }
          }
        }
      } catch (err) {
        console.error('Failed to fetch academic page settings', err);
      }
    };
    fetchContent();
  }, []);

  // Fetch faculty from backend API
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const data = await apiGet('/public/faculty');
        setFacultyMembers(data);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
      } finally {
        setFacultyLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const sections = [
    { id: "curriculum", label: "Curriculum", icon: "📚" },
    { id: "programs", label: "Classes", icon: "🎓" },
    { id: "faculty", label: "Faculty", icon: "👨‍🏫" },
    { id: "achievements", label: "Achievements", icon: "🏆" }
  ];

  return (
    <div className="academic-page">
      {/* Hero Section */}
      <section className="academic-hero">
        <div className="hero-content">
          {/* School Registration Badge */}
          <div className="neb-affiliation-badge">
            <span className="neb-flag">🇳🇵</span>
            Nursery to Class 10 — Registered School, Nepal
          </div>
          <h1>{pageContent.academics_hero_title}</h1>
          <p className="hero-subtitle">
            {pageContent.academics_hero_subtitle}
          </p>
          <div className="academic-stats">
            <div className="stat-item">
              <div className="stat-number">{pageContent.academics_stat_board}</div>
              <div className="stat-label">Pass Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{pageContent.academics_stat_faculty}</div>
              <div className="stat-label">Expert Faculty</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{pageContent.academics_stat_years}</div>
              <div className="stat-label">Years of Excellence</div>
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
            <p>Structured learning from Nursery through Class 10 following the Nepal Government's national curriculum</p>
          </div>

          <div className="curriculum-overview">
            {curriculumList.map((item, index) => (
              <div key={index} className="card overview-card">
                <div className="card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>

          {/* School Level Structure */}
          <div className="section-header" style={{ marginTop: '3rem' }}>
            <h2>School Levels</h2>
            <p>A nurturing academic journey from early childhood to Secondary Education Examination (SEE)</p>
          </div>
          <div className="neb-grade-structure">
            <div className="neb-grade-card">
              <div className="neb-grade-title">🌱 Early Childhood</div>
              <div className="neb-grade-subtitle">Nursery · LKG · UKG</div>
              <ul className="neb-grade-list">
                <li>Play-based learning environment</li>
                <li>Language &amp; communication skills</li>
                <li>Basic numeracy &amp; literacy</li>
                <li>Creative arts &amp; physical activity</li>
              </ul>
            </div>
            <div className="neb-grade-card">
              <div className="neb-grade-title">📗 Primary Level</div>
              <div className="neb-grade-subtitle">Class 1 to Class 5</div>
              <ul className="neb-grade-list">
                <li>Nepali, English, Mathematics</li>
                <li>Science &amp; Social Studies</li>
                <li>Moral Education &amp; Health</li>
                <li>Co-curricular &amp; sports activities</li>
              </ul>
            </div>
            <div className="neb-grade-card">
              <div className="neb-grade-title">📘 Lower Secondary</div>
              <div className="neb-grade-subtitle">Class 6 to Class 8</div>
              <ul className="neb-grade-list">
                <li>Core subjects + Optional subjects</li>
                <li>Science &amp; Mathematics in depth</li>
                <li>Computer &amp; ICT education</li>
                <li>Project-based &amp; practical work</li>
              </ul>
            </div>
            <div className="neb-grade-card neb-grade-card--accent">
              <div className="neb-grade-title">📙 Secondary Level</div>
              <div className="neb-grade-subtitle">Class 9 to Class 10 (SEE)</div>
              <ul className="neb-grade-list">
                <li>SEE (Secondary Education Exam) prep</li>
                <li>Compulsory &amp; Optional subjects</li>
                <li>Model exams &amp; revision classes</li>
                <li>Career guidance &amp; counselling</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Classes / Programs Section */}
        <section className={`academic-section ${activeSection === 'programs' ? 'active' : ''}`}>
          <div className="section-header">
            <h2>Academic Classes Offered</h2>
            <p>From Nursery to Class 10 — every stage designed for holistic growth and learning</p>
          </div>

          <div className="cards-grid">
            {programsList.map((program, index) => (
              <div key={index} className="card">
                <div className="card-icon">{program.icon}</div>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <ul className="feature-list">
                  {typeof program.features === 'string' 
                    ? program.features.split('\n').filter(f => f.trim() !== '').map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))
                    : Array.isArray(program.features) ? program.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      )) : null}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Faculty Section — loaded from API */}
        <section className={`academic-section ${activeSection === 'faculty' ? 'active' : ''}`}>
          <div className="section-header">
            <h2>Our Distinguished Faculty</h2>
            <p>Experienced educators dedicated to nurturing every student from Nursery to Class 10</p>
          </div>

          {facultyLoading ? (
            <div className="faculty-loading">
              <div className="faculty-loading-spinner"></div>
              <p>Loading faculty...</p>
            </div>
          ) : facultyMembers.length === 0 ? (
            <div className="faculty-empty">
              <span>👨‍🏫</span>
              <p>Faculty details will be available soon.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {facultyMembers.map((faculty) => (
                <div key={faculty.id} className="card faculty-card">
                  <div className="faculty-avatar-img">
                    <img
                      src={
                        getImageUrl(faculty.profilePictureUrl) ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=1a73e8&color=ffffff&size=200`
                      }
                      alt={faculty.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=1a73e8&color=ffffff&size=200`;
                      }}
                    />
                  </div>
                  <h3>{faculty.name}</h3>
                  <p className="faculty-designation">{faculty.designation || faculty.role}</p>
                  <div className="faculty-details">
                    {faculty.department && (
                      <div className="detail-item">
                        <span className="detail-label">Department:</span>
                        <span className="detail-value">{faculty.department}</span>
                      </div>
                    )}
                  </div>
                  {faculty.bio && <p className="faculty-bio">{faculty.bio}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Achievements Section */}
        <section className={`academic-section ${activeSection === 'achievements' ? 'active' : ''}`}>
          <div className="section-header">
            <h2>Academic Achievements &amp; Recognition</h2>
            <p>Celebrating our school's excellence from Nursery to Class 10 over the years</p>
          </div>

          <div className="timeline-wrapper">
            <div className="timeline">
              {achievementsList.map((achievement, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-year-badge">{achievement.year}</div>
                  <div className="timeline-content">
                    <div className="timeline-content-icon">{achievement.icon}</div>
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section className="academic-cta">
        <div className="cta-content">
          <h2>Want to Learn More About Our Academic Programs?</h2>
          <p>Schedule a campus visit or speak with our academic advisors about admissions from Nursery to Class 10</p>
          <div className="cta-buttons">
            <button className="cta-btn primary">📞 Contact Academic Office</button>
            <button className="cta-btn secondary">📋 Download School Prospectus</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Data Arrays (Nursery to Class 10) ───────────────────────────────────────

const curriculumOverview = [
  {
    icon: "🇳🇵",
    title: "Nepal Govt. Curriculum",
    description: "Following the national curriculum set by the Government of Nepal for all levels from Nursery to Class 10"
  },
  {
    icon: "🧠",
    title: "Holistic Development",
    description: "Balancing academics with sports, arts, moral education & life skills for all-round growth"
  },
  {
    icon: "💡",
    title: "Modern Teaching Methods",
    description: "Interactive, activity-based and ICT-integrated learning for every level of schooling"
  },
  {
    icon: "🌟",
    title: "SEE Preparation",
    description: "Focused preparation for Secondary Education Examination (SEE) for Class 9 & 10 students"
  }
];

const academicPrograms = [
  {
    icon: "🌱",
    title: "Early Childhood (Nursery–UKG)",
    description: "Foundational learning through play, exploration and creativity",
    features: [
      "Play-based Montessori approach",
      "Early literacy & numeracy",
      "Creative arts & storytelling",
      "Social skills & hygiene habits"
    ]
  },
  {
    icon: "📗",
    title: "Primary Level (Class 1–5)",
    description: "Building strong academic foundations in core subjects",
    features: [
      "Nepali, English, Mathematics",
      "Science & Social Studies",
      "Moral Education & Health",
      "Computer basics & drawing"
    ]
  },
  {
    icon: "📘",
    title: "Lower Secondary (Class 6–8)",
    description: "Developing critical thinking and subject specialisation",
    features: [
      "Core + Optional subjects",
      "Science, Mathematics in depth",
      "Computer & ICT education",
      "Project work & practicals"
    ]
  },
  {
    icon: "📙",
    title: "Secondary Level (Class 9–10)",
    description: "Preparing students for the SEE and future education",
    features: [
      "Compulsory & optional subjects as per curriculum",
      "SEE model exams & revision",
      "Career guidance sessions",
      "Extra classes & doubt clearance"
    ]
  }
];

// Faculty is fetched from API — no hardcoded data

const achievements = [
  {
    icon: "🏆",
    year: "2081 BS",
    title: "100% SEE Pass Rate",
    description: "All Class 10 students successfully cleared the SEE examination with excellent grades"
  },
  {
    icon: "🥇",
    year: "2080 BS",
    title: "District Topper in SEE",
    description: "Our student ranked 1st in the district in the Secondary Education Examination"
  },
  {
    icon: "🔬",
    year: "2080 BS",
    title: "National Science Exhibition",
    description: "Students from Class 8 & 9 won the Gold medal at the National Science Exhibition"
  },
  {
    icon: "🎨",
    year: "2079 BS",
    title: "Inter-School Art Competition",
    description: "First prize in the zonal inter-school drawing and painting competition"
  },
  {
    icon: "⚽",
    year: "2079 BS",
    title: "District Sports Championship",
    description: "School football team won the district-level championship for two consecutive years"
  },
  {
    icon: "📖",
    year: "2078 BS",
    title: "Best School Award",
    description: "Recognized by the district education office as the best performing school in the region"
  }
];