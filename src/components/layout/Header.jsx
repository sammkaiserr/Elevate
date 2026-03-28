import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // profile only — auth state is via Clerk
import './Header.css';

const Header = ({ variant = 'default', activeNav = '', hideSearch = false }) => {
  const showSearch = variant === 'default' && !hideSearch;
  const showNav = variant === 'chat';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const notifRef = useRef(null);
  const location = useLocation();
  const path = location.pathname;
  const { profile } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const initials = profile?.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <div className="header__left">
            <button
              className="header__menu-btn"
              onClick={() => setShowDrawer(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link to="/home" className="header__brand">Elevate</Link>
          </div>

          {showNav && (
            <nav className="header__nav">
              <Link to="/home" className={activeNav === 'feed' ? 'active' : ''}>Feed</Link>
              <Link to="/home" className={activeNav === 'network' ? 'active' : ''}>Network</Link>
              <Link to="/chat" className={activeNav === 'messages' ? 'active' : ''}>Messages</Link>
            </nav>
          )}

          {showSearch && (
            <div className="header__search">
              <div className="header__search-wrapper">
                <span className="material-symbols-outlined header__search-icon">search</span>
                <input
                  type="text"
                  className="header__search-input"
                  placeholder="Search insights..."
                />
              </div>
            </div>
          )}

          <div className="header__actions">
            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle Dark Mode"
            >
              <span className="material-symbols-outlined theme-toggle-icon sun">light_mode</span>
              <span className="material-symbols-outlined theme-toggle-icon moon">dark_mode</span>
            </button>

            {/* Notification Bell + Dropdown */}
            <div className="header__notif-wrapper hide-mobile" ref={notifRef}>
              <button
                className={`header__icon-btn ${showNotifications ? 'header__icon-btn--active' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>

              {showNotifications && (
                <div className="header__notif-dropdown">
                  <div className="header__notif-header">
                    <h3 className="header__notif-title">Notifications</h3>
                    <button
                      className="header__notif-close"
                      onClick={() => setShowNotifications(false)}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div className="header__notif-tabs">
                    <button className="header__notif-tab active">All</button>
                  </div>

                  <div className="header__notif-empty">
                    <div className="header__notif-empty-icon">
                      <span className="material-symbols-outlined">notifications_none</span>
                    </div>
                    <h4>No notifications yet</h4>
                    <p>When you get notifications, they'll show up here. Start engaging with the community to stay connected.</p>
                  </div>
                </div>
              )}
            </div>

            <Link to="/profile/student" className="header__avatar">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" className="header__avatar-img" />
                : <span className="header__avatar-fallback">{initials}</span>
              }
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      {showDrawer && (
        <div className="header__drawer-overlay" onClick={() => setShowDrawer(false)}>
          <nav className="header__drawer" onClick={(e) => e.stopPropagation()}>
            <div className="header__drawer-header">
              <Link to="/home" className="header__drawer-brand" onClick={() => setShowDrawer(false)}>
                Elevate
              </Link>
              <button className="header__drawer-close" onClick={() => setShowDrawer(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="header__drawer-links">
              <Link
                to="/home"
                className={`header__drawer-link ${path === '/home' ? 'active' : ''}`}
                onClick={() => setShowDrawer(false)}
              >
                <span className="material-symbols-outlined">dynamic_feed</span>
                <span>Feed</span>
              </Link>
              <Link
                to="/network"
                className={`header__drawer-link ${path === '/network' ? 'active' : ''}`}
                onClick={() => setShowDrawer(false)}
              >
                <span className="material-symbols-outlined">group</span>
                <span>Network</span>
              </Link>
              <Link
                to="/chat"
                className={`header__drawer-link ${path === '/chat' ? 'active' : ''}`}
                onClick={() => setShowDrawer(false)}
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                <span>Messages</span>
              </Link>
              <Link
                to="/settings"
                className={`header__drawer-link ${path === '/settings' ? 'active' : ''}`}
                onClick={() => setShowDrawer(false)}
              >
                <span className="material-symbols-outlined">settings</span>
                <span>Settings</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
