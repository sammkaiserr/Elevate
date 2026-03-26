import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      <Link to="/home" className={`bottom-nav__item ${path === '/home' ? 'active' : ''}`}>
        <span className="material-symbols-outlined">dynamic_feed</span>
        <span>Feed</span>
      </Link>
      <Link to="/network" className={`bottom-nav__item ${path === '/network' ? 'active' : ''}`}>
        <span className="material-symbols-outlined">group</span>
        <span>Network</span>
      </Link>
      <Link to="/create" className="bottom-nav__fab">
        <span className="material-symbols-outlined">add</span>
      </Link>
      <Link to="/chat" className={`bottom-nav__item ${path === '/chat' ? 'active' : ''}`}>
        <span className="material-symbols-outlined">chat</span>
        <span>Chat</span>
      </Link>
      <Link to={user ? `/profile/user/${user.id}` : '/settings'} className={`bottom-nav__item ${path.includes('/profile/user') || path === '/settings' ? 'active' : ''}`}>
        <span className="material-symbols-outlined">person</span>
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
