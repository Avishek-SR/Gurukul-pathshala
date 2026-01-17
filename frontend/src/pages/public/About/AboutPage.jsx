import "./AboutPage.css";

export default function AboutPage() {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1>About Gurukul Pathshala</h1>
            <p>Excellence in Education Since 1980</p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision-section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mission-card">
              <div className="card-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h2>Our Mission</h2>
              <p>
                To provide quality education that nurtures intellectual curiosity, 
                critical thinking, and ethical values in every student, preparing them 
                to become responsible global citizens.
              </p>
            </div>
            
            <div className="vision-card">
              <div className="card-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h2>Our Vision</h2>
              <p>
                To be a center of excellence in education that empowers students 
                to achieve their full potential and contribute positively to society 
                through innovation and leadership.
              </p>
            </div>
            
            <div className="values-card">
              <div className="card-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h2>Our Values</h2>
              <p>
                Integrity, Excellence, Innovation, Respect, and Social Responsibility 
                form the core of our educational philosophy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="history-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Journey</h2>
            <p>From humble beginnings to educational excellence</p>
          </div>
          
          <div className="history-timeline">
            <div className="timeline-item">
              <div className="timeline-year">1980</div>
              <div className="timeline-content">
                <h3>Foundation</h3>
                <p>
                  Gurukul Pathshala was founded with a vision to provide quality 
                  education to the children of Lahan. Started with just 2 classrooms 
                  and 50 students.
                </p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-year">1995</div>
              <div className="timeline-content">
                <h3>Expansion</h3>
                <p>
                  Added science laboratories and computer center. Recognized as 
                  one of the leading educational institutions in the region.
                </p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-year">2010</div>
              <div className="timeline-content">
                <h3>Modernization</h3>
                <p>
                  Introduced smart classrooms and digital learning resources. 
                  Established the school library with over 10,000 books.
                </p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-year">2020</div>
              <div className="timeline-content">
                <h3>Excellence</h3>
                <p>
                  Achieved 100% board results for 5 consecutive years. 
                  Recognized with "Best School Award" at district level.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="infrastructure-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Infrastructure</h2>
            <p>State-of-the-art facilities for holistic development</p>
          </div>
          
          <div className="facilities-grid">
            <div className="facility-card">
              <div className="facility-icon">
                <i className="fas fa-flask"></i>
              </div>
              <h3>Science Labs</h3>
              <p>Well-equipped physics, chemistry, and biology laboratories</p>
            </div>
            
            <div className="facility-card">
              <div className="facility-icon">
                <i className="fas fa-laptop"></i>
              </div>
              <h3>Computer Lab</h3>
              <p>Modern computer lab with high-speed internet and latest software</p>
            </div>
            
            <div className="facility-card">
              <div className="facility-icon">
                <i className="fas fa-book"></i>
              </div>
              <h3>Library</h3>
              <p>Extensive collection of books, journals, and digital resources</p>
            </div>
            
            <div className="facility-card">
              <div className="facility-icon">
                <i className="fas fa-futbol"></i>
              </div>
              <h3>Sports Complex</h3>
              <p>Basketball court, football field, and indoor games facility</p>
            </div>
            
            <div className="facility-card">
              <div className="facility-icon">
                <i className="fas fa-music"></i>
              </div>
              <h3>Arts & Music</h3>
              <p>Dedicated rooms for music, dance, and arts activities</p>
            </div>
            
            <div className="facility-card">
              <div className="facility-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3>Health Center</h3>
              <p>Fully equipped medical room with trained staff</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="leadership-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Leadership</h2>
            <p>Dedicated educators guiding our journey</p>
          </div>
          
          <div className="leadership-grid">
            <div className="leader-card">
              <div className="leader-image">
                <i className="fas fa-user-tie"></i>
              </div>
              <h3>Dr. Rajesh Sharma</h3>
              <p className="leader-role">Principal</p>
              <p className="leader-qualification">PhD in Education, 25+ years experience</p>
            </div>
            
            <div className="leader-card">
              <div className="leader-image">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h3>Ms. Anita Koirala</h3>
              <p className="leader-role">Vice Principal</p>
              <p className="leader-qualification">M.Ed, Specialization in Curriculum Development</p>
            </div>
            
            <div className="leader-card">
              <div className="leader-image">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3>Mr. Sunil Thapa</h3>
              <p className="leader-role">Academic Director</p>
              <p className="leader-qualification">M.Sc, B.Ed, 20+ years teaching experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="achievements-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Achievements</h2>
            <p>Celebrating excellence and success</p>
          </div>
          
          <div className="achievements-grid">
            <div className="achievement-card">
              <div className="achievement-number">40+</div>
              <h3>Years of Excellence</h3>
              <p>Four decades of educational leadership</p>
            </div>
            
            <div className="achievement-card">
              <div className="achievement-number">5000+</div>
              <h3>Successful Alumni</h3>
              <p>Making a difference worldwide</p>
            </div>
            
            <div className="achievement-card">
              <div className="achievement-number">100%</div>
              <h3>Board Results</h3>
              <p>Consistent 100% pass rate</p>
            </div>
            
            <div className="achievement-card">
              <div className="achievement-number">50+</div>
              <h3>National Awards</h3>
              <p>Recognition for academic excellence</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}