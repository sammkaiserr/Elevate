import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bottom-nav">
      <Link to="/home" className={`bottom-nav__item ${path === '/home' ? 'active' : ''}`}>
        <span className="material-symbols-outlined">dynamic_feed</span>
        <span>Feed</span>
      </Link>
      <Link to="/home" className="bottom-nav__item">
        <span className="material-symbols-outlined">group</span>
        <span>Network</span>
      </Link>
      <Link to="/create" className="bottom-nav__fab">
        <span className="material-symbols-outlined">add</span>
      </Link>
      <Link to="/home" className="bottom-nav__item">
        <span className="material-symbols-outlined">hub</span>
        <span>Groups</span>
      </Link>
      <Link to="/profile/student" className={`bottom-nav__item ${path.includes('/profile') ? 'active' : ''}`}>
        <span className="material-symbols-outlined">person</span>
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
