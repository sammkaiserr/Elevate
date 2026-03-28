import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null); // null | 'pending_sent' | 'pending_received' | 'accepted' | 'none'
  const [connectionId, setConnectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await apiFetch(`/profiles/${userId}`);
        setProfile(profileData);

        // Fetch posts by this user
        const allPosts = await apiFetch('/posts');
        const postsData = (allPosts || []).filter(p => p.user_id === userId || p.user_id?._id === userId);
        setPosts(postsData);

        // Fetch connection status if not own profile
        if (user && user.id !== userId) {
          const connections = await apiFetch('/connections');
          const conn = (connections || []).find(c => {
            const req = c.requester_id?._id || c.requester_id;
            const add = c.addressee_id?._id || c.addressee_id;
            return (req === user.id && add === userId) || (req === userId && add === user.id);
          });

          if (conn) {
            setConnectionId(conn.id);
            if (conn.status === 'accepted') {
              setConnectionStatus('accepted');
            } else if (conn.status === 'pending') {
              if ((conn.requester_id?._id || conn.requester_id) === user.id) {
                setConnectionStatus('pending_sent');
              } else {
                setConnectionStatus('pending_received');
              }
            }
          } else {
            setConnectionStatus('none');
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
      setLoading(false);
    };

    if (userId) fetchProfile();
  }, [userId, user]);

  const sendRequest = async () => {
    setActionLoading(true);
    try {
      const data = await apiFetch('/connections', {
        method: 'POST',
        body: JSON.stringify({ addressee_id: userId, status: 'pending' })
      });
      setConnectionStatus('pending_sent');
      setConnectionId(data.id || data._id);
    } catch (err) {
      console.error('Error sending request:', err);
    }
    setActionLoading(false);
  };

  const withdrawRequest = async () => {
    setActionLoading(true);
    try {
      console.warn("Delete connection not implemented in backend yet");
      setConnectionStatus('none');
      setConnectionId(null);
    } catch (err) {
      console.error('Error withdrawing request:', err);
    }
    setActionLoading(false);
  };

  const acceptRequest = async () => {
    setActionLoading(true);
    try {
      await apiFetch(`/connections/${connectionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'accepted' })
      });
      setConnectionStatus('accepted');
    } catch (err) {
      console.error('Error accepting request:', err);
    }
    setActionLoading(false);
  };

  const rejectRequest = async () => {
    setActionLoading(true);
    try {
      await apiFetch(`/connections/${connectionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected' })
      });
      setConnectionStatus('none');
      setConnectionId(null);
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
    setActionLoading(false);
  };

  const removeConnection = async () => {
    setActionLoading(true);
    try {
      console.warn("Delete connection not implemented in backend yet");
      setConnectionStatus('none');
      setConnectionId(null);
    } catch (err) {
      console.error('Error removing connection:', err);
    }
    setActionLoading(false);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="user-profile">
          <div className="user-profile__loading">
            <div className="user-profile__spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="user-profile">
          <div className="user-profile__not-found">
            <span className="material-symbols-outlined">person_off</span>
            <h2>Profile not found</h2>
            <p>This user doesn't exist or their profile is unavailable.</p>
            <button className="user-profile__back-btn" onClick={() => navigate(-1)}>
              <span className="material-symbols-outlined">arrow_back</span>
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="user-profile">
        {/* Back button */}
        <button className="user-profile__back" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>

        {/* Profile Header Card */}
        <div className="user-profile__hero">
          <div className="user-profile__hero-bg"></div>
          <div className="user-profile__hero-content">
            <div className="user-profile__avatar">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} />
              ) : (
                <div className="user-profile__avatar-placeholder">
                  {getInitials(profile.full_name)}
                </div>
              )}
              <div className={`user-profile__role-indicator user-profile__role-indicator--${profile.role || 'student'}`}>
                <span className="material-symbols-outlined">
                  {profile.role === 'professional' ? 'work' : 'school'}
                </span>
              </div>
            </div>

            <div className="user-profile__identity">
              <h1 className="user-profile__name">{profile.full_name}</h1>
              <p className="user-profile__headline">
                {profile.role === 'professional'
                  ? `${profile.job_title || 'Professional'}${profile.company ? ` at ${profile.company}` : ''}`
                  : `${profile.field_of_study || 'Student'}${profile.university ? ` at ${profile.university}` : ''}`}
              </p>
              {profile.location && (
                <p className="user-profile__location">
                  <span className="material-symbols-outlined">location_on</span>
                  {profile.location}
                </p>
              )}
            </div>

            {/* Connection Actions */}
            {!isOwnProfile && (
              <div className="user-profile__actions">
                {connectionStatus === 'none' && (
                  <button
                    className="user-profile__action-btn user-profile__action-btn--connect"
                    onClick={sendRequest}
                    disabled={actionLoading}
                  >
                    <span className="material-symbols-outlined">person_add</span>
                    {actionLoading ? 'Sending...' : 'Connect'}
                  </button>
                )}
                {connectionStatus === 'pending_sent' && (
                  <button
                    className="user-profile__action-btn user-profile__action-btn--withdraw"
                    onClick={withdrawRequest}
                    disabled={actionLoading}
                  >
                    <span className="material-symbols-outlined">undo</span>
                    {actionLoading ? 'Withdrawing...' : 'Withdraw Request'}
                  </button>
                )}
                {connectionStatus === 'pending_received' && (
                  <div className="user-profile__action-group">
                    <button
                      className="user-profile__action-btn user-profile__action-btn--accept"
                      onClick={acceptRequest}
                      disabled={actionLoading}
                    >
                      <span className="material-symbols-outlined">check</span>
                      Accept
                    </button>
                    <button
                      className="user-profile__action-btn user-profile__action-btn--decline"
                      onClick={rejectRequest}
                      disabled={actionLoading}
                    >
                      <span className="material-symbols-outlined">close</span>
                      Decline
                    </button>
                  </div>
                )}
                {connectionStatus === 'accepted' && (
                  <div className="user-profile__connected-badge">
                    <span className="material-symbols-outlined">check_circle</span>
                    Connected
                    <button
                      className="user-profile__action-btn user-profile__action-btn--remove-sm"
                      onClick={removeConnection}
                      disabled={actionLoading}
                    >
                      <span className="material-symbols-outlined">person_remove</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            {isOwnProfile && (
              <button
                className="user-profile__action-btn user-profile__action-btn--edit"
                onClick={() => navigate('/settings')}
              >
                <span className="material-symbols-outlined">edit</span>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="user-profile__sections">
          {/* About */}
          {profile.bio && (
            <div className="user-profile__card">
              <h2 className="user-profile__card-title">
                <span className="material-symbols-outlined">info</span>
                About
              </h2>
              <p className="user-profile__bio">{profile.bio}</p>
            </div>
          )}

          {/* Details */}
          <div className="user-profile__card">
            <h2 className="user-profile__card-title">
              <span className="material-symbols-outlined">badge</span>
              Details
            </h2>
            <div className="user-profile__details-grid">
              {profile.role && (
                <div className="user-profile__detail">
                  <span className="user-profile__detail-label">Role</span>
                  <span className="user-profile__detail-value">{profile.role === 'professional' ? 'Working Professional' : 'Student'}</span>
                </div>
              )}
              {profile.university && (
                <div className="user-profile__detail">
                  <span className="user-profile__detail-label">University</span>
                  <span className="user-profile__detail-value">{profile.university}</span>
                </div>
              )}
              {profile.field_of_study && (
                <div className="user-profile__detail">
                  <span className="user-profile__detail-label">Field of Study</span>
                  <span className="user-profile__detail-value">{profile.field_of_study}</span>
                </div>
              )}
              {profile.graduation_year && (
                <div className="user-profile__detail">
                  <span className="user-profile__detail-label">Graduation Year</span>
                  <span className="user-profile__detail-value">{profile.graduation_year}</span>
                </div>
              )}
              {profile.company && (
                <div className="user-profile__detail">
                  <span className="user-profile__detail-label">Company</span>
                  <span className="user-profile__detail-value">{profile.company}</span>
                </div>
              )}
              {profile.job_title && (
                <div className="user-profile__detail">
                  <span className="user-profile__detail-label">Job Title</span>
                  <span className="user-profile__detail-value">{profile.job_title}</span>
                </div>
              )}
              {profile.created_at && (
                <div className="user-profile__detail">
                  <span className="user-profile__detail-label">Joined</span>
                  <span className="user-profile__detail-value">{formatDate(profile.created_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="user-profile__card">
              <h2 className="user-profile__card-title">
                <span className="material-symbols-outlined">psychology</span>
                Skills
              </h2>
              <div className="user-profile__skills">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="user-profile__skill">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          <div className="user-profile__card">
            <h2 className="user-profile__card-title">
              <span className="material-symbols-outlined">article</span>
              Posts ({posts.length})
            </h2>
            {posts.length === 0 ? (
              <div className="user-profile__no-posts">
                <span className="material-symbols-outlined">edit_note</span>
                <p>No posts yet</p>
              </div>
            ) : (
              <div className="user-profile__posts">
                {posts.map((post) => (
                  <div key={post.id} className="user-profile__post">
                    <h3 className="user-profile__post-title">{post.title}</h3>
                    <p className="user-profile__post-excerpt">
                      {post.content?.substring(0, 150)}{post.content?.length > 150 ? '...' : ''}
                    </p>
                    <div className="user-profile__post-meta">
                      <span>{timeAgo(post.created_at)}</span>
                      <span>•</span>
                      <span>
                        <span className="material-symbols-outlined">thumb_up</span>
                        {post.upvotes || 0}
                      </span>
                      <span>
                        <span className="material-symbols-outlined">chat_bubble</span>
                        {post.comment_count || 0}
                      </span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="user-profile__post-tags">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="user-profile__tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
