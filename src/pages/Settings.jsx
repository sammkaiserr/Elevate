import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const email = clerkUser?.emailAddresses?.[0]?.emailAddress || profile?.email || 'Loading...';

  return (
    <MainLayout>
      <div className="settings-page">
        <header className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account preferences and security.</p>
        </header>

        <main className="settings-content">
          <section className="settings-section">
            <h2 className="settings-section__title">Appearance</h2>

            <div className="settings-card">
              <div className="settings-card__row">
                <div className="settings-card__info">
                  <h3>Dark Mode</h3>
                  <p>Switch between light and dark interface themes.</p>
                </div>
                <button
                  className={`settings-toggle ${isDark ? 'settings-toggle--on' : ''}`}
                  onClick={toggleDarkMode}
                  aria-label="Toggle dark mode"
                  role="switch"
                  aria-checked={isDark}
                >
                  <span className="settings-toggle__knob">
                    <span className="material-symbols-outlined">
                      {isDark ? 'dark_mode' : 'light_mode'}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h2 className="settings-section__title">Account</h2>

            <div className="settings-card">
              <div className="settings-card__row">
                <div className="settings-card__info">
                  <h3>Email Address</h3>
                  <p>{email}</p>
                </div>
              </div>

              <div className="settings-card__row">
                <div className="settings-card__info">
                  <h3>Sign Out</h3>
                  <p>Log out of your Elevate account on this device.</p>
                </div>
                <button className="settings-btn settings-btn--danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-placeholder">
              <span className="material-symbols-outlined">build</span>
              <h3>More settings coming soon</h3>
              <p>We are working on adding more account configuration options here.</p>
            </div>
          </section>
        </main>
      </div>
    </MainLayout>
  );
};

export default Settings;

