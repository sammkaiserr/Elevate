import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import './MainLayout.css';

const MainLayout = ({ children, showRightSidebar = false }) => {
  return (
    <>
      <Header />
      <div className="main-layout">
        <Sidebar />
        <main className={`main-layout__content ${showRightSidebar ? 'has-right-sidebar' : ''}`}>
          {children}
        </main>
      </div>
      <BottomNav />
    </>
  );
};

export default MainLayout;