import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="sidebar">
      <div className="sidebar__inner">
      
        <nav className="sidebar__nav">
          <Link to="/home" className={`sidebar__link ${path === '/home' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">dynamic_feed</span>
            <span>Feed</span>
          </Link>
          <Link to="/network" className={`sidebar__link ${path === '/network' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">group</span>
            <span>Network</span>
          </Link>
          <Link to="/chat" className={`sidebar__link ${path === '/chat' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">chat_bubble</span>
            <span>Messages</span>
          </Link>
          <Link to="/resume" className={`sidebar__link ${path === '/resume' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">document_scanner</span>
            <span>Resume AI</span>
          </Link>
          <Link to="/settings" className={`sidebar__link sidebar__spacer ${path === '/settings' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar__cta">
          <Link to="/create">
            <button className="sidebar__cta-btn">Create Post</button>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;