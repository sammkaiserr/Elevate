import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import './StudentProfileSetup.css';

const interests = ['Product Design', 'Machine Learning', 'Entrepreneurship', 'Public Speaking', 'Fintech', 'Climate Tech'];

const StudentProfileSetup = () => {
  const [activeInterests, setActiveInterests] = useState(['Entrepreneurship']);

  const toggleInterest = (interest) => {
    setActiveInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  return (
    <div className="student-profile">
      <Header variant="minimal" />

      <main className="student-profile__main">
        {/* Left Sidebar */}
        <aside className="student-profile__sidebar">
          <div>
            <h1>Build your profile</h1>
            <p style={{ marginTop: '0.5rem' }}>Complete your student identity to unlock personalized mentorship and opportunities.</p>
          </div>

          <nav className="student-profile__progress-nav">
            <div className="student-profile__progress-item active">
              <span className="step-num">01</span>
              <span className="step-label">Personal Details</span>
            </div>
            <div className="student-profile__progress-item">
              <span className="step-num">02</span>
              <span className="step-label">Academic Path</span>
            </div>
            <div className="student-profile__progress-item">
              <span className="step-num">03</span>
              <span className="step-label">Interests & Goals</span>
            </div>
          </nav>

          <div className="student-profile__tip">
            <span className="material-symbols-outlined">verified_user</span>
            <p className="student-profile__tip-label">Pro Tip</p>
            <p>Profiles with detailed interests receive 4x more community engagement.</p>
          </div>
        </aside>

        {/* Main Form */}
        <div className="student-profile__form-wrapper">
          <section className="student-profile__form-card">
            <form className="student-profile__form" onSubmit={e => e.preventDefault()}>
              {/* Personal Identity */}
              <div>
                <div className="student-profile__section-header">
                  <h2>Personal Identity</h2>
                  <p>How you'll appear to your peers and mentors.</p>
                </div>
                <div className="student-profile__grid" style={{ marginTop: '1.5rem' }}>
                  <div className="student-profile__field">
                    <label>Full Name</label>
                    <input type="text" placeholder="e.g. Alex Rivera" />
                  </div>
                  <div className="student-profile__field">
                    <label>Date of Birth</label>
                    <div className="field-icon">
                      <input type="date" />
                      <span className="material-symbols-outlined">calendar_today</span>
                    </div>
                  </div>
                  <div className="student-profile__field">
                    <label>Current Location</label>
                    <div className="field-icon">
                      <input type="text" placeholder="City, Country" />
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Background */}
              <div>
                <div className="student-profile__section-header">
                  <h2>Academic Background</h2>
                  <p>Tell us about your current studies.</p>
                </div>
                <div className="student-profile__grid" style={{ marginTop: '1.5rem' }}>
                  <div className="student-profile__field full-width">
                    <label>University / College</label>
                    <input type="text" placeholder="e.g. Stanford University" />
                  </div>
                  <div className="student-profile__field">
                    <label>Course / Major</label>
                    <input type="text" placeholder="e.g. Computer Science" />
                  </div>
                  <div className="student-profile__field">
                    <label>Year of Graduation</label>
                    <select defaultValue="2026">
                      <option>2024</option>
                      <option>2025</option>
                      <option>2026</option>
                      <option>2027</option>
                      <option>2028+</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div>
                <div className="student-profile__section-header">
                  <h2>Interests & Expertise</h2>
                  <p>Select topics that resonate with your career path.</p>
                </div>
                <div className="student-profile__interests" style={{ marginTop: '1.5rem' }}>
                  {interests.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      className={`student-profile__interest-tag ${
                        activeInterests.includes(interest)
                          ? 'student-profile__interest-tag--active'
                          : 'student-profile__interest-tag--default'
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                  <button type="button" className="student-profile__interest-tag--add">
                    <span className="material-symbols-outlined">add</span>
                    Add Custom
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="student-profile__actions">
                <div className="student-profile__actions-info">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>security</span>
                  <span>Your data is encrypted and secure</span>
                </div>
                <div className="student-profile__actions-buttons">
                  <button type="button" className="student-profile__draft-btn">Save Draft</button>
                  <Link to="/home">
                    <button type="button" className="btn-gradient student-profile__submit-btn">Complete Profile</button>
                  </Link>
                </div>
              </div>
            </form>
          </section>

          {/* Info Cards */}
          <div className="student-profile__info-cards">
            <div className="student-profile__info-card">
              <span className="material-symbols-outlined">school</span>
              <h4>Student Benefits</h4>
              <p>Access exclusive student-only internships and grants from our corporate partners.</p>
            </div>
            <div className="student-profile__info-card">
              <span className="material-symbols-outlined">groups</span>
              <h4>Peer Network</h4>
              <p>Connect with 50,000+ students from top universities around the globe.</p>
            </div>
            <div className="student-profile__info-card">
              <span className="material-symbols-outlined">rocket_launch</span>
              <h4>Career Growth</h4>
              <p>Personalized roadmap based on your major and chosen interests.</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default StudentProfileSetup;
