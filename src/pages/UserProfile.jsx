import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import { getCleanPreviewText } from '../utils/textUtils';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);
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

        const postsData = await apiFetch(`/posts/user/${userId}`);
        setPosts(postsData || []);

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
      if (connectionId) {
        await apiFetch(`/connections/${connectionId}`, { method: 'DELETE' });
      }
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
      if (connectionId) {
        await apiFetch(`/connections/${connectionId}`, { method: 'DELETE' });
      }
      setConnectionStatus('none');
      setConnectionId(null);
    } catch (err) {
      console.error('Error removing connection:', err);
    }
    setActionLoading(false);
  };

  const startConversation = async () => {
    setActionLoading(true);
    try {
      const chat = await apiFetch('/conversations', {
        method: 'POST',
        body: JSON.stringify({ partnerId: userId })
      });
      navigate('/chat', { state: { selectedChat: chat } });
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
    setActionLoading(false);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert("Failed to delete post");
    }
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
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="ml-4 text-zinc-500 dark:text-zinc-400">Loading profile...</p>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-zinc-400 mb-4">person_off</span>
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">Profile not found</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">This user doesn't exist or their profile is unavailable.</p>
          <button
            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
            onClick={() => navigate(-1)}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        
        <button
          className="flex items-center gap-2 px-4 py-2 mb-6 text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>

        
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-90 relative"></div>

          <div className="px-6 sm:px-10 pb-8 relative -mt-16 flex flex-col sm:flex-row gap-6 sm:items-end">
            
            <div className="relative shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 object-cover bg-zinc-100 dark:bg-zinc-800"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-4xl font-bold">
                  {getInitials(profile.full_name)}
                </div>
              )}
              <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white ${profile.role === 'professional' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                <span className="material-symbols-outlined text-[16px]">
                  {profile.role === 'professional' ? 'work' : 'school'}
                </span>
              </div>
            </div>

            
            <div className="flex-1 mt-2 sm:mt-16">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{profile.full_name}</h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-1">
                {profile.role === 'professional'
                  ? `${profile.job_title || 'Professional'}${profile.company ? ` at ${profile.company}` : ''}`
                  : `${profile.field_of_study || 'Student'}${profile.university ? ` at ${profile.university}` : ''}`}
              </p>
              {profile.location && (
                <p className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-sm mt-2 font-medium">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {profile.location}
                </p>
              )}
            </div>

            
            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0 sm:self-end">
              {!isOwnProfile && (
                <>
                  {connectionStatus === 'none' && (
                    <button
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm"
                      onClick={sendRequest}
                      disabled={actionLoading}
                    >
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                      {actionLoading ? '...' : 'Connect'}
                    </button>
                  )}
                  {connectionStatus === 'pending_sent' && (
                    <button
                      className="flex items-center gap-2 px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
                      onClick={withdrawRequest}
                      disabled={actionLoading}
                    >
                      <span className="material-symbols-outlined text-[20px]">undo</span>
                      {actionLoading ? '...' : 'Pending'}
                    </button>
                  )}
                  {connectionStatus === 'pending_received' && (
                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-sm"
                        onClick={acceptRequest}
                        disabled={actionLoading}
                      >
                        <span className="material-symbols-outlined text-[20px]">check</span>
                        Accept
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        onClick={rejectRequest}
                        disabled={actionLoading}
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>
                  )}
                  {connectionStatus === 'accepted' && (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      Connected
                      <button
                        className="ml-2 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 p-1 rounded-lg transition text-emerald-600 dark:text-emerald-400"
                        onClick={removeConnection}
                        disabled={actionLoading}
                      >
                        <span className="material-symbols-outlined text-[20px] block">person_remove</span>
                      </button>
                    </div>
                  )}

                  <button
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium rounded-xl transition shadow-sm border border-indigo-200 dark:border-indigo-800 border-opacity-50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                    onClick={startConversation}
                    disabled={actionLoading}
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    Message
                  </button>
                </>
              )}
              {isOwnProfile && (
                <button
                  className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-xl transition hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  onClick={() => navigate('/settings')}
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            
            {profile.bio && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                  <span className="material-symbols-outlined text-zinc-400">info</span>
                  About
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                <span className="material-symbols-outlined text-zinc-400">badge</span>
                Details
              </h2>
              <div className="space-y-4">
                {profile.role && (
                  <div>
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Role</span>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{profile.role === 'professional' ? 'Working Professional' : 'Student'}</span>
                  </div>
                )}
                {profile.university && (
                  <div>
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">University</span>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{profile.university}</span>
                  </div>
                )}
                {profile.field_of_study && (
                  <div>
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Field of Study</span>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{profile.field_of_study}</span>
                  </div>
                )}
                {profile.graduation_year && (
                  <div>
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Graduation Year</span>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{profile.graduation_year}</span>
                  </div>
                )}
                {profile.company && (
                  <div>
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Company</span>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{profile.company}</span>
                  </div>
                )}
                {profile.job_title && (
                  <div>
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Job Title</span>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{profile.job_title}</span>
                  </div>
                )}
                {profile.created_at && (
                  <div>
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Joined</span>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{formatDate(profile.created_at)}</span>
                  </div>
                )}
              </div>
            </div>

            
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                  <span className="material-symbols-outlined text-zinc-400">psychology</span>
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40 font-medium text-xs rounded-lg">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                <span className="material-symbols-outlined text-zinc-400">article</span>
                Posts ({posts.length})
              </h2>
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-4xl text-zinc-400 mb-3">edit_note</span>
                  <p className="text-zinc-500 dark:text-zinc-400">No posts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="p-5 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 hover:dark:bg-zinc-800 transition rounded-xl border border-zinc-200 dark:border-zinc-800 relative">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 pr-8">{post.title}</h3>
                        {(post.user_id === user?.id || post.user_id?._id === user?.id || post.profiles?.id === user?.id || post.profiles?._id === user?.id) && (
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition p-1"
                            title="Delete Post"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                        {getCleanPreviewText(post.content, 150)}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                        <span>{timeAgo(post.created_at)}</span>
                        <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                          {post.upvotes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                          {post.comment_count || 0}
                        </span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, i) => (
                            <span key={i} className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">#{tag}</span>
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
      </div>
    </MainLayout>
  );
};

export default UserProfile;
