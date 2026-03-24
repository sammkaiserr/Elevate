import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './RoleSelection.css';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="role-selection">
      {/* Simple header */}
      <header className="role-selection__header">
        <div className="role-selection__header-inner">
          <span className="role-selection__brand">Elevate</span>
        </div>
      </header>

      <main className="role-selection__main">
        <div className="role-selection__content">
          {/* Hero */}
          <div className="role-selection__hero">
            <h1>Who are you?</h1>
            <p>Choose the path that best describes your current journey to personalize your Elevate experience.</p>
          </div>

          {/* Role Cards */}
          <div className="role-selection__cards">
            {/* Student Card */}
            <button
              className={`role-selection__card ${selectedRole === 'student' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('student')}
              style={selectedRole === 'student' ? { borderColor: 'var(--primary-container)' } : {}}
            >
              <div className="role-selection__card-icon role-selection__card-icon--student">
                <span className="material-symbols-outlined">school</span>
              </div>
              <h2>Student</h2>
              <p>Focused on academic growth, skill-building, and creating a strong foundation through campus networking.</p>
              <div className="role-selection__card-action">
                SELECT STUDENT
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
              <div className="role-selection__card-decor">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
            </button>

            {/* Professional Card */}
            <button
              className={`role-selection__card ${selectedRole === 'professional' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('professional')}
              style={selectedRole === 'professional' ? { borderColor: 'var(--primary-container)' } : {}}
            >
              <div className="role-selection__card-icon role-selection__card-icon--professional">
                <span className="material-symbols-outlined">work</span>
              </div>
              <h2>Working Professional</h2>
              <p>Looking for career advancement, industry leadership, and meaningful mentorship opportunities.</p>
              <div className="role-selection__card-action">
                SELECT PROFESSIONAL
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
              <div className="role-selection__card-decor">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="role-selection__footer">
            <Link to={selectedRole === 'professional' ? '/profile/professional' : '/profile/student'}>
              <button className="btn-gradient role-selection__next-btn">
                Next
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </Link>
            <div className="role-selection__login-link">
              <span>Already have an account?</span>
              <Link to="/">Log in</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Background decorations */}
      <div className="role-selection__bg-low"></div>
      <div className="role-selection__bg-orb role-selection__bg-orb--1"></div>
      <div className="role-selection__bg-orb role-selection__bg-orb--2"></div>
    </div>
  );
};

export default RoleSelection;
