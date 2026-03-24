import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import './Network.css';

const emptyStates = {
  connections: { icon: 'group_off', title: 'No connections yet', text: 'Start building your professional network by connecting with others on Elevate.' },
  pending: { icon: 'hourglass_empty', title: 'No pending requests', text: 'When someone sends you a connection request, it will appear here.' },
  suggestions: { icon: 'person_search', title: 'No suggestions available', text: 'Suggestions will appear here as you grow your profile and engage with the community.' },
};

const Network = () => {
  const [activeTab, setActiveTab] = useState('connections');
  const empty = emptyStates[activeTab];

  return (
    <MainLayout>
      <div className="network">
        <div className="network__header">
          <h1 className="network__title">My Network</h1>
          <p className="network__subtitle">Manage your professional connections</p>
        </div>

        <div className="network__tabs">
          {['connections', 'pending', 'suggestions'].map((tab) => (
            <button
              key={tab}
              className={`network__tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="network__empty">
          <div className="network__empty-icon">
            <span className="material-symbols-outlined">{empty.icon}</span>
          </div>
          <h3>{empty.title}</h3>
          <p>{empty.text}</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Network;
