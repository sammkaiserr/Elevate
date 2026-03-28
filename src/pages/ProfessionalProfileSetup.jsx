import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import './ProfessionalProfileSetup.css';

const ProfessionalProfileSetup = () => {
  const [skills, setSkills] = useState(['Product Strategy', 'Systems Thinking', 'Team Leadership']);

  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  return (
    <div className="pro-profile">
      <Header />

      <main className="pro-profile__main">
        {/* Sidebar */}
        <aside className="pro-profile__sidebar">
          <div className="pro-profile__identity">
            <div className="pro-profile__identity-header">
              <div className="pro-profile__avatar">
                <span className="pro-profile__avatar-fallback">AS</span>
                <div className="pro-profile__avatar-overlay">
                  <span className="material-symbols-outlined">photo_camera</span>
                </div>
              </div>
              <h2>Professional Profile</h2>
              <p>Build your identity in the Elevate ecosystem.</p>
            </div>

            <nav className="pro-profile__sidebar-nav">
              <a href="#" className="pro-profile__sidebar-link active">
                <span className="material-symbols-outlined">person</span>
                Basic Info
              </a>
              <a href="#" className="pro-profile__sidebar-link">
                <span className="material-symbols-outlined">work</span>
                Experience
              </a>
              <a href="#" className="pro-profile__sidebar-link">
                <span className="material-symbols-outlined">school</span>
                Education
              </a>
              <a href="#" className="pro-profile__sidebar-link">
                <span className="material-symbols-outlined">verified</span>
                Skills
              </a>
            </nav>
          </div>

          <div className="pro-profile__completion">
            <p className="pro-profile__completion-label">Completion</p>
            <div className="pro-profile__completion-value">
              <span>45%</span>
              <span>to Elite status</span>
            </div>
            <div className="pro-profile__completion-bar">
              <div className="pro-profile__completion-fill"></div>
            </div>
          </div>
        </aside>

        {/* Main Form */}
        <section className="pro-profile__form-section">
          <div className="pro-profile__heading">
            <h1>Setup your Professional Hub</h1>
            <p>Elevate uses these details to match you with high-growth communities and opportunities. Your professional DNA starts here.</p>
          </div>

          <form className="pro-profile__form" onSubmit={e => e.preventDefault()}>
            {/* Identity & Role */}
            <div>
              <div className="pro-profile__group-header">
                <span className="material-symbols-outlined">contact_page</span>
                <h3>Identity & Role</h3>
              </div>
              <div className="pro-profile__grid pro-profile__grid--2">
                <div className="pro-profile__field">
                  <label>Full Name</label>
                  <input type="text" style={{ color: '#000', fontWeight: '500' }} />
                </div>
                <div className="pro-profile__field">
                  <label>Current Job Role</label>
                  <input type="text" style={{ color: '#000', fontWeight: '500' }} />
                </div>
              </div>
            </div>

            {/* Experience & Background */}
            <div className="pro-profile__experience-group">
              <div className="pro-profile__group-header">
                <span className="material-symbols-outlined">history_edu</span>
                <h3>Experience & Background</h3>
              </div>
              <div className="pro-profile__grid pro-profile__grid--3">
                <div className="pro-profile__field">
                  <label>Years of Experience</label>
                  <select defaultValue="">
                    <option value="" disabled>Select range</option>
                    <option>0-2 years</option>
                    <option>3-5 years</option>
                    <option>6-10 years</option>
                    <option>10+ years</option>
                  </select>
                </div>
                <div className="pro-profile__field">
                  <label>Graduation Year</label>
                  <input type="number" style={{ color: '#000', fontWeight: '500' }} />
                </div>
                <div className="pro-profile__field">
                  <label>Current Company</label>
                  <input type="text" style={{ color: '#000', fontWeight: '500' }} />
                </div>
              </div>
            </div>

            {/* Network Context */}
            <div>
              <div className="pro-profile__group-header">
                <span className="material-symbols-outlined">explore</span>
                <h3>Network Context</h3>
              </div>
              <div className="pro-profile__grid">
                <div className="pro-profile__field">
                  <label>City / Base Location</label>
                  <div className="field-icon">
                    <span className="material-symbols-outlined">location_on</span>
                    <input type="text" style={{ color: '#000', fontWeight: '500' }} />
                  </div>
                </div>
                <div className="pro-profile__field">
                  <label>Core Competencies (Tags)</label>
                  <div className="pro-profile__skills-container">
                    {skills.map(skill => (
                      <span key={skill} className="pro-profile__skill-tag">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>close</span>
                        </button>
                      </span>
                    ))}
                    <button type="button" className="pro-profile__add-skill">
                      <span className="material-symbols-outlined">add</span>
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pro-profile__actions">
              <div className="pro-profile__actions-info">
                <div className="pro-profile__actions-info-dot"></div>
                <p>Changes are saved automatically to draft.</p>
              </div>
              <div className="pro-profile__actions-buttons">
                <button type="button" className="pro-profile__cancel-btn">Cancel</button>
                <Link to="/home">
                  <button type="button" className="btn-gradient pro-profile__complete-btn">Complete Profile</button>
                </Link>
              </div>
            </div>
          </form>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfessionalProfileSetup;
