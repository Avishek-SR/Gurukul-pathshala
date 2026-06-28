import React, { useState, useEffect } from "react";
import "./Admissionspage.css";
import { publicAdmission, settingsAPI } from '../../../services/api';

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    studentName: "",
    dob: "",
    gender: "",
    parentName: "",
    parentEmail: "",
    classApplying: "",
    mobileNumber: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admissionsOpen, setAdmissionsOpen] = useState(true); // Default to true while loading
  const [pageContent, setPageContent] = useState({
    admissions_hero_title: 'Admissions Open for 2081',
    admissions_hero_subtitle: 'Join Gurukul Pathshala and shape a brighter future for your child',
    admissions_open_date: '1st Falgun 2080',
    admissions_last_date: '30th Chaitra 2080',
    admissions_session_date: '1st Week of Baisakh 2081',
    admissions_year_begins: '15th Baisakh 2081',
    contact_phone: '+977-9819782671',
    contact_email: 'gurukulpathshala76@gmail.com',
    contact_address: 'Lahan-8, Nepal',
  });

  useEffect(() => {
    const checkAdmissionsStatus = async () => {
      try {
        const settings = await settingsAPI.getPublic();
        if (settings) {
          if (settings['admissions_open'] === 'false') setAdmissionsOpen(false);
          setPageContent({
            admissions_hero_title: settings['admissions_hero_title'] || 'Admissions Open for 2081',
            admissions_hero_subtitle: settings['admissions_hero_subtitle'] || 'Join Gurukul Pathshala and shape a brighter future for your child',
            admissions_open_date: settings['admissions_open_date'] || '1st Falgun 2080',
            admissions_last_date: settings['admissions_last_date'] || '30th Chaitra 2080',
            admissions_session_date: settings['admissions_session_date'] || '1st Week of Baisakh 2081',
            admissions_year_begins: settings['admissions_year_begins'] || '15th Baisakh 2081',
            contact_phone: settings['contact_phone'] || '+977-9819782671',
            contact_email: settings['contact_email'] || 'gurukulpathshala76@gmail.com',
            contact_address: settings['contact_address'] || 'Lahan-8, Nepal',
          });
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    checkAdmissionsStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await publicAdmission.submitApplication(formData);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
      setFormData({
        studentName: "",
        dob: "",
        gender: "",
        parentName: "",
        parentEmail: "",
        classApplying: "",
        mobileNumber: "",
        message: "",
      });
    } catch (err) {
      console.error("Admission submission error:", err);
      setError(err.response?.data?.message || "Failed to submit application. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admissions-page">
      {/* Hero Section */}
      <section className="admissions-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>{admissionsOpen ? pageContent.admissions_hero_title : pageContent.admissions_hero_title.replace('Open', 'Closed')}</h1>
            <p className="hero-subtitle">
              {pageContent.admissions_hero_subtitle}
            </p>
            <div className="hero-highlights">
              <div className="highlight-item">
                <span className="highlight-icon">🎓</span>
                <span>Quality Education</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">👨‍🏫</span>
                <span>Expert Faculty</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🏆</span>
                <span>Proven Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="admissions-content">
        <div className="content-intro">
          <h2>Begin Your Child's Educational Journey</h2>
          <p>
            At Gurukul Pathshala, we nurture young minds through a balanced
            approach of academic excellence, character building, and holistic
            development.
          </p>
        </div>

        <div className="info-cards-container">
          {/* Why Choose Us Card */}
          <div className="info-card">
            <div className="card-icon">⭐</div>
            <h2>Why Choose Gurukul Pathshala?</h2>
            <ul>
              <li>
                <strong>Experienced & Caring Faculty:</strong> Our teachers are
                both qualified and passionate about student development.
              </li>
              <li>
                <strong>Modern Infrastructure:</strong> Well-equipped
                classrooms, science labs, computer labs, and libraries.
              </li>
              <li>
                <strong>Holistic Education:</strong> Focus on academics, sports,
                arts, and life skills.
              </li>
              <li>
                <strong>Consistent Academic Excellence:</strong> Outstanding
                board results year after year.
              </li>
              <li>
                <strong>Safe & Nurturing Environment:</strong> Campus designed
                for safety and positive learning.
              </li>
            </ul>
          </div>

          {/* Admission Process Card */}
          <div className="info-card process-card">
            <div className="card-icon">📋</div>
            <h2>Admission Process</h2>
            <ol className="process-steps">
              <li className="process-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Admission Enquiry</h4>
                  <p>Submit the enquiry form below or visit our campus</p>
                </div>
              </li>
              <li className="process-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Document Verification</h4>
                  <p>Submit required documents for verification</p>
                </div>
              </li>
              <li className="process-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Interaction Session</h4>
                  <p>Informal interaction with faculty and principal</p>
                </div>
              </li>
              <li className="process-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Confirmation & Enrollment</h4>
                  <p>Fee payment and completion of admission formalities</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Important Dates Card */}
          <div className="info-card dates-card">
            <div className="card-icon">📅</div>
            <h2>Important Dates</h2>
            <div className="dates-list">
              <div className="date-item">
                <div className="date-title">Admissions Open</div>
                <div className="date-value">{pageContent.admissions_open_date}</div>
              </div>
              <div className="date-item">
                <div className="date-title">Last Date for Submission</div>
                <div className="date-value">{pageContent.admissions_last_date}</div>
              </div>
              <div className="date-item">
                <div className="date-title">Interaction Sessions</div>
                <div className="date-value">{pageContent.admissions_session_date}</div>
              </div>
              <div className="date-item">
                <div className="date-title">Academic Year Begins</div>
                <div className="date-value">{pageContent.admissions_year_begins}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-header">
            <h2>Admission Enquiry Form</h2>
            <p>
              Fill in your details below and our admissions team will contact
              you within 24 hours.
            </p>
          </div>

          <div className="form-card">
            {isSubmitted && (
              <div className="success-message">
                Thank you! Your application has been submitted successfully.
              </div>
            )}
            
            {!admissionsOpen ? (
              <div className="admissions-closed-notice" style={{
                textAlign: 'center', padding: '40px 20px', background: '#fff1f2',
                border: '1px solid #fda4af', borderRadius: '12px', marginTop: '20px'
              }}>
                <i className="fas fa-info-circle" style={{fontSize: '3rem', color: '#e11d48', marginBottom: '15px'}}></i>
                <h3 style={{color: '#9f1239', fontSize: '1.5rem', marginBottom: '10px'}}>Admissions are Currently Closed</h3>
                <p style={{color: '#be123c', lineHeight: '1.6'}}>
                  Thank you for your interest in Gurukul Pathshala. We are not accepting new admission applications at this moment. 
                  Please check back later for the next academic session announcements.
                </p>
              </div>
            ) : (
            <form className="admissions-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentName">Student Name *</label>
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    placeholder="Enter student's full name"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dob">Date of Birth *</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                 <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="parentName">Parent/Guardian Name *</label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    placeholder="Enter parent/guardian name"
                    value={formData.parentName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="parentEmail">Parent Email *</label>
                  <input
                    type="email"
                    id="parentEmail"
                    name="parentEmail"
                    placeholder="Enter parent's email address"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="classApplying">Class Applying For *</label>
                  <select
                    id="classApplying"
                    name="classApplying"
                    value={formData.classApplying}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Class</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number *</label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="message">Additional Information</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  placeholder="Any specific queries or information you'd like to share..."
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="form-footer">
                <p className="form-note">
                  * Required fields. We respect your privacy and will not share
                  your information.
                </p>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                </button>
              </div>
              {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
            </form>
            )}
          </div>

          <div className="contact-info">
            <h3>Prefer to Contact Directly?</h3>
            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>Phone</h4>
                  <p>{pageContent.contact_phone}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div>
                  <h4>Email</h4>
                  <p>{pageContent.contact_email}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">🏫</div>
                <div>
                  <h4>Visit Campus</h4>
                  <p>{pageContent.contact_address}<br/>9:00 AM - 4:00 PM, Monday to Saturday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}