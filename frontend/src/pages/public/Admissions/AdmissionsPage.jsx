import React, { useState } from "react";
import "./AdmissionsPage.css";

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    classApplying: "",
    mobileNumber: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to a server
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormData({
      studentName: "",
      parentName: "",
      classApplying: "",
      mobileNumber: "",
      message: "",
    });
  };

  return (
    <div className="admissions-page">
      {/* Hero Section */}
      <section className="admissions-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Admissions Open for 2024-25</h1>
            <p className="hero-subtitle">
              Join Gurukul Pathshala and shape a brighter future for your child
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
                <div className="date-value">1st December 2023</div>
              </div>
              <div className="date-item">
                <div className="date-title">Last Date for Submission</div>
                <div className="date-value">31st March 2024</div>
              </div>
              <div className="date-item">
                <div className="date-title">Interaction Sessions</div>
                <div className="date-value">April 2024</div>
              </div>
              <div className="date-item">
                <div className="date-title">Academic Year Begins</div>
                <div className="date-value">1st June 2024</div>
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
                <span>✓</span>
                <p>Thank you! Your enquiry has been submitted successfully.</p>
              </div>
            )}

            <form className="admission-form" onSubmit={handleSubmit}>
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
                    <option value="1-5">Class 1 - 5</option>
                    <option value="6-8">Class 6 - 8</option>
                    <option value="9-10">Class 9 - 10</option>
                    <option value="11-12">Class 11 - 12</option>
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
                <button type="submit" className="submit-btn">
                  Submit Enquiry
                </button>
              </div>
            </form>
          </div>

          <div className="contact-info">
            <h3>Prefer to Contact Directly?</h3>
            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>Phone</h4>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div>
                  <h4>Email</h4>
                  <p>admissions@gurukulpathshala.edu</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">🏫</div>
                <div>
                  <h4>Visit Campus</h4>
                  <p>9:00 AM - 4:00 PM, Monday to Saturday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}