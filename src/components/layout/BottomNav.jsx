import React from 'react';
import { Link } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <div className="bottom-fab-container">
      <Link to="/create" className="bottom-fab" aria-label="Create Post">
        <span className="material-symbols-outlined">add</span>
      </Link>
    </div>
  );
};

export default BottomNav;
