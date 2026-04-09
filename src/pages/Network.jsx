import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../config/api';
import MainLayout from '../components/layout/MainLayout';
import './Network.css';

const Network = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => location.state?.tab || 'suggestions');
  const [suggestions, setSuggestions] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState({});

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const allConnections = await apiFetch('/connections');
      const conns = allConnections || [];

      const accepted = [];
      const sentPending = [];
      const receivedPending = [];
      const connectedUserIds = new Set();

      conns.forEach((c) => {

        const reqId = c.requester_id?._id || c.requester_id;
        const addId = c.addressee_id?._id || c.addressee_id;
        
        const otherUserId = reqId === user.id ? addId : reqId;
        const otherProfile = reqId === user.id ? c.addressee_id : c.requester_id;
        
        connectedUserIds.add(otherUserId);
        

        const enriched = { ...c, profile: typeof otherProfile === 'object' ? otherProfile : null };

        if (c.status === 'accepted') {
          accepted.push(enriched);
        } else if (c.status === 'pending') {
          if (reqId === user.id) {
            sentPending.push(enriched);
          } else {
            receivedPending.push(enriched);
          }
        }
      });

      setConnections(accepted);
      setPendingSent(sentPending);
      setPendingReceived(receivedPending);

      try {
        const allProfiles = await apiFetch('/profiles');
        const suggestionsList = (allProfiles || []).filter(p => {
          const pid = p._id || p.id;
          return pid !== user.id && !connectedUserIds.has(pid);
        });
        setSuggestions(suggestionsList);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching network data:', err);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sendRequest = async (addresseeId) => {
    setActionLoading((prev) => ({ ...prev, [addresseeId]: true }));
    try {
      const conn = await apiFetch('/connections', {
        method: 'POST',
        body: JSON.stringify({ addressee_id: addresseeId, status: 'pending' })
      });

      const connId = conn._id || conn.id;
      setSentRequests((prev) => ({ ...prev, [addresseeId]: connId }));

      const sentProfile = suggestions.find(p => (p._id || p.id) === addresseeId);
      if (sentProfile) {
        setPendingSent(prev => [
          ...prev,
          {
            ...conn,
            id: connId,
            profile: sentProfile,
            requester_id: sentProfile,
            addressee_id: addresseeId,
            status: 'pending',
          }
        ]);
      }
    } catch (err) {
      console.error('Error sending request:', err);
    }
    setActionLoading((prev) => ({ ...prev, [addresseeId]: false }));
  };

  const withdrawFromSuggestions = async (addresseeId) => {
    const connectionId = sentRequests[addresseeId];
    if (!connectionId) return;
    setActionLoading((prev) => ({ ...prev, [addresseeId]: true }));
    try {
      await apiFetch(`/connections/${connectionId}`, { method: 'DELETE' });
      setSentRequests((prev) => {
        const copy = { ...prev };
        delete copy[addresseeId];
        return copy;
      });
      setPendingSent(prev => prev.filter(p => p.id !== connectionId));
    } catch (err) {
      console.error('Error withdrawing request:', err);
    }
    setActionLoading((prev) => ({ ...prev, [addresseeId]: false }));
  };

  const withdrawRequest = async (connectionId) => {
    setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
    try {
      await apiFetch(`/connections/${connectionId}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error('Error withdrawing request:', err);
    }
    setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
  };

  const acceptRequest = async (connectionId) => {
    setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
    try {
      await apiFetch(`/connections/${connectionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'accepted' })
      });
      await fetchData();
    } catch (err) {
      console.error('Error accepting request:', err);
    }
    setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
  };

  const rejectRequest = async (connectionId) => {
    setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
    try {
      await apiFetch(`/connections/${connectionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected' })
      });
      await fetchData();
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
    setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
  };

  const removeConnection = async (connectionId) => {
    setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
    try {
      await apiFetch(`/connections/${connectionId}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error('Error removing connection:', err);
    }
    setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredSuggestions = suggestions.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.role || '').toLowerCase().includes(q) ||
      (p.university || '').toLowerCase().includes(q) ||
      (p.company || '').toLowerCase().includes(q) ||
      (p.job_title || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = pendingReceived.length;
  const sentCount = pendingSent.length;

  const renderUserCard = (profile, actions) => (
    <div className="network__card" key={profile?._id || profile?.id || Math.random()}>
      <div className="network__card-avatar" onClick={() => navigate(`/profile/user/${profile?._id || profile?.id}`)} style={{ cursor: 'pointer' }}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name} />
        ) : (
          <div className="network__card-avatar-placeholder">
            {getInitials(profile?.full_name)}
          </div>
        )}
        <div className={`network__card-role-badge network__card-role-badge--${profile?.role || 'student'}`}>
          <span className="material-symbols-outlined">
            {profile?.role === 'professional' ? 'work' : 'school'}
          </span>
        </div>
      </div>
      <div className="network__card-info">
        <h3 className="network__card-name" onClick={() => navigate(`/profile/user/${profile?._id || profile?.id}`)} style={{ cursor: 'pointer' }}>{profile?.full_name || 'Unknown User'}</h3>
        <p className="network__card-detail">
          {profile?.role === 'professional'
            ? `${profile?.job_title || 'Professional'}${profile?.company ? ` at ${profile.company}` : ''}`
            : `${profile?.field_of_study || 'Student'}${profile?.university ? ` • ${profile.university}` : ''}`}
        </p>
        {profile?.bio && <p className="network__card-bio">{profile.bio}</p>}
        {profile?.skills && profile.skills.length > 0 && (
          <div className="network__card-skills">
            {profile.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="network__skill-tag">{skill}</span>
            ))}
            {profile.skills.length > 3 && (
              <span className="network__skill-more">+{profile.skills.length - 3}</span>
            )}
          </div>
        )}
      </div>
      <div className="network__card-actions">{actions}</div>
    </div>
  );

  const emptyStates = {
    suggestions: { icon: 'person_search', title: 'No suggestions available', text: 'Suggestions will appear here as more people join Elevate.' },
    pending: { icon: 'hourglass_empty', title: 'No pending requests', text: 'When someone sends you a connection request, it will appear here.' },
    connections: { icon: 'group_off', title: 'No connections yet', text: 'Start building your professional network by connecting with others on Elevate.' },
  };

  const renderEmpty = (type) => {
    const empty = emptyStates[type];
    return (
      <div className="network__empty">
        <div className="network__empty-icon">
          <span className="material-symbols-outlined">{empty.icon}</span>
        </div>
        <h3>{empty.title}</h3>
        <p>{empty.text}</p>
      </div>
    );
  };

  const renderSuggestions = () => {
    if (filteredSuggestions.length === 0) return renderEmpty('suggestions');
    return (
      <div className="network__grid">
        {filteredSuggestions.map((profile) => {
          const pid = profile._id || profile.id;
          const isSent = !!sentRequests[pid];
          return renderUserCard(
            profile,
            isSent ? (
              <button
                className="network__btn network__btn--withdraw"
                onClick={() => withdrawFromSuggestions(pid)}
                disabled={actionLoading[pid]}
              >
                <span className="material-symbols-outlined">schedule</span>
                {actionLoading[pid] ? 'Withdrawing...' : 'Requested'}
              </button>
            ) : (
              <button
                className="network__btn network__btn--connect"
                onClick={() => sendRequest(pid)}
                disabled={actionLoading[pid]}
              >
                <span className="material-symbols-outlined">person_add</span>
                {actionLoading[pid] ? 'Sending...' : 'Connect'}
              </button>
            )
          );
        })}
      </div>
    );
  };

  const renderPending = () => {
    const hasReceived = pendingReceived.length > 0;
    const hasSent = pendingSent.length > 0;
    if (!hasReceived && !hasSent) return renderEmpty('pending');

    return (
      <div className="network__pending-sections">
        {hasReceived && (
          <div className="network__section">
            <h2 className="network__section-title">
              <span className="material-symbols-outlined">inbox</span>
              Received ({pendingReceived.length})
            </h2>
            <div className="network__grid">
              {pendingReceived.map((conn) =>
                renderUserCard(
                  conn.profile,
                  <>
                    <button
                      className="network__btn network__btn--accept"
                      onClick={() => acceptRequest(conn.id)}
                      disabled={actionLoading[conn.id]}
                    >
                      <span className="material-symbols-outlined">check</span>
                      Accept
                    </button>
                    <button
                      className="network__btn network__btn--reject"
                      onClick={() => rejectRequest(conn.id)}
                      disabled={actionLoading[conn.id]}
                    >
                      <span className="material-symbols-outlined">close</span>
                      Decline
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        )}
        {hasSent && (
          <div className="network__section">
            <h2 className="network__section-title">
              <span className="material-symbols-outlined">outbox</span>
              Sent ({pendingSent.length})
            </h2>
            <div className="network__grid">
              {pendingSent.map((conn) =>
                renderUserCard(
                  conn.profile,
                  <button
                    className="network__btn network__btn--withdraw"
                    onClick={() => withdrawRequest(conn.id)}
                    disabled={actionLoading[conn.id]}
                  >
                    <span className="material-symbols-outlined">undo</span>
                    {actionLoading[conn.id] ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderConnections = () => {
    if (connections.length === 0) return renderEmpty('connections');
    return (
      <div className="network__grid">
        {connections.map((conn) =>
          renderUserCard(
            conn.profile,
            <button
              className="network__btn network__btn--remove"
              onClick={() => removeConnection(conn.id)}
              disabled={actionLoading[conn.id]}
            >
              <span className="material-symbols-outlined">person_remove</span>
              {actionLoading[conn.id] ? 'Removing...' : 'Remove'}
            </button>
          )
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="network">
        <div className="network__header">
          <h1 className="network__title">My Network</h1>
          <p className="network__subtitle">Discover, connect, and grow your professional network</p>
        </div>

        <div className="network__tabs">
          <button
            className={`network__tab ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            <span className="material-symbols-outlined">explore</span>
            Discover
          </button>
          <button
            className={`network__tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <span className="material-symbols-outlined">pending</span>
            Pending
            {pendingCount > 0 && <span className="network__tab-badge">{pendingCount}</span>}
          </button>
          <button
            className={`network__tab ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            <span className="material-symbols-outlined">group</span>
            Connections
            {connections.length > 0 && <span className="network__tab-count">{connections.length}</span>}
          </button>
        </div>

        {activeTab === 'suggestions' && (
          <div className="network__search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search by name, role, university, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {loading ? (
          <div className="network__loading">
            <div className="network__spinner"></div>
            <p>Loading your network...</p>
          </div>
        ) : (
          <>
            {activeTab === 'suggestions' && renderSuggestions()}
            {activeTab === 'pending' && renderPending()}
            {activeTab === 'connections' && renderConnections()}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Network;
