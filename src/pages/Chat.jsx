import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import './Chat.css';

const Chat = () => {
  const [activeTab, setActiveTab] = useState('direct');

  return (
    <div className="chat">
      <Header hideSearch />

      <main className="chat__main">
        {/* Left Panel: Conversation List */}
        <aside className="chat__sidebar">
          <div className="chat__sidebar-header">
            <div className="chat__sidebar-header-top">
              <h2 className="chat__sidebar-title">Messages</h2>
              <div className="chat__sidebar-actions">
                <button className="chat__sidebar-action-btn">
                  <span className="material-symbols-outlined">tune</span>
                </button>
                <button className="chat__sidebar-action-btn chat__sidebar-action-btn--compose">
                  <span className="material-symbols-outlined">edit_square</span>
                </button>
              </div>
            </div>

            <div className="chat__search">
              <span className="material-symbols-outlined chat__search-icon">search</span>
              <input
                type="text"
                className="chat__search-input"
                placeholder="Search people or communities..."
              />
            </div>

            <div className="chat__tabs">
              <button
                className={`chat__tab ${activeTab === 'direct' ? 'active' : ''}`}
                onClick={() => setActiveTab('direct')}
              >
                Direct
              </button>
              <button
                className={`chat__tab ${activeTab === 'groups' ? 'active' : ''}`}
                onClick={() => setActiveTab('groups')}
              >
                Groups
              </button>
            </div>
          </div>

          <div className="chat__conv-list">
            <div className="chat__conv-empty">
              <span className="material-symbols-outlined">
                {activeTab === 'direct' ? 'forum' : 'groups'}
              </span>
              <p>{activeTab === 'direct' ? 'No conversations yet' : 'No groups yet'}</p>
            </div>
          </div>
        </aside>

        {/* Right Panel: Empty State */}
        <section className="chat__area">
          <div className="chat__area-empty">
            <div className="chat__area-empty-icon">
              <span className="material-symbols-outlined">chat_bubble_outline</span>
            </div>
            <h3>Start a conversation</h3>
            <p>Send a message to connect with professionals in your network.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Chat;
