import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import './Home.css';

const Home = () => {
  return (
    <MainLayout showRightSidebar>
      <div className="home__feed">
        {/* Composer */}
        <div className="home__composer">
          <div className="home__composer-avatar">AR</div>
          <Link to="/create" className="home__composer-input">
            Share a professional update or insight...
          </Link>
          <div className="home__composer-actions">
            <span className="material-symbols-outlined">image</span>
            <span className="material-symbols-outlined">article</span>
          </div>
        </div>

        {/* Empty Feed */}
        <div className="home__posts">
          <div className="home__feed-empty">
            <div className="home__feed-empty-icon">
              <span className="material-symbols-outlined">dynamic_feed</span>
            </div>
            <h3>No posts yet</h3>
            <p>Be the first to share a professional insight with the community.</p>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="home__right-sidebar">
        <div className="home__right-sidebar-sections">
          {/* Footer */}
          <div className="home__right-footer">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Ad Choices</a>
            <a href="#">Elevate © 2024</a>
          </div>
        </div>
      </aside>
    </MainLayout>
  );
};

export default Home;