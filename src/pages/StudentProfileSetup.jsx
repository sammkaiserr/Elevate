import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import './StudentProfileSetup.css';

const interestsList = ['Product Design', 'Machine Learning', 'Entrepreneurship', 'Public Speaking', 'Fintech', 'Climate Tech'];

const StudentProfileSetup = () => {
  const { user, profile, fetchProfile, updateAvatar } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [toast, setToast] = useState('');

  const avatarInputRef = useRef(null);
  const personalRef = useRef(null);
  const academicRef = useRef(null);
  const interestsRef = useRef(null);
  const menuRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('2026');
  const [activeInterests, setActiveInterests] = useState([]);
  const [localAvatar, setLocalAvatar] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (profile) {
      setFullName(profile.full_name || '');
      setDob(profile.dob || '');
      setLocation(profile.location || '');
      setUniversity(profile.university || '');
      setMajor(profile.field_of_study || '');
      setGradYear(profile.graduation_year || '2026');
      setActiveInterests(profile.skills || []);
      setLocalAvatar(profile.avatar_url || null);
      setIsEditing(!profile.full_name);
    } else {
      setIsEditing(true);
    }
    fetchMyPosts();
  }, [user, profile, navigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMyPosts = async () => {
    if (!user) return;
    setPostsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('created_at', { ascending: false });
    if (!error && data) setMyPosts(data);
    setPostsLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const toggleInterest = (interest) => {
    setActiveInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName, dob, location, university,
      field_of_study: major, graduation_year: gradYear, skills: activeInterests,
    }).eq('id', user.id);
    if (error) { alert('Error saving profile: ' + error.message); }
    else { await fetchProfile(user.id); setIsEditing(false); }
    setLoading(false);
  };

  const handleAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = urlData.publicUrl + '?t=' + Date.now();
      setLocalAvatar(publicUrl);
      await updateAvatar(publicUrl);
      showToast('Profile photo updated!');
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
    setAvatarUploading(false);
  };

  // Post actions
  const handleEditPost = (post) => {
    navigate(`/create?edit=${post.id}`);
  };

  const handleArchivePost = async (post) => {
    const { error } = await supabase.from('posts').update({ archived: true }).eq('id', post.id);
    if (!error) {
      setMyPosts(prev => prev.filter(p => p.id !== post.id));
      showToast('Post archived.');
    }
    setOpenMenuId(null);
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (!error) {
      setMyPosts(prev => prev.filter(p => p.id !== post.id));
      showToast('Post deleted.');
    }
    setOpenMenuId(null);
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const avatarSrc = localAvatar || profile?.avatar_url;
  const firstLetter = fullName ? fullName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="student-profile">
      <Header variant="minimal" />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '5rem', left: '50%', transform: 'translateX(-50%)',
          background: '#1e3a5f', color: 'white', padding: '0.75rem 1.25rem',
          borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 9999,
          animation: 'spToastIn 0.2s ease'
        }}>
          {toast}
        </div>
      )}

      <main className="student-profile__main">
        {/* Left Sidebar */}
        <aside className="student-profile__sidebar">
          <div>
            <h1>{isEditing ? 'Build your profile' : 'Your Profile'}</h1>
            <p style={{ marginTop: '0.5rem' }}>
              {isEditing
                ? 'Complete your student identity to unlock personalized mentorship and opportunities.'
                : 'Manage your professional identity and view your posts.'}
            </p>
          </div>

          <nav className="student-profile__progress-nav">
            <div
              className={`student-profile__progress-item ${!isEditing ? 'active' : 'active'}`}
              onClick={() => isEditing && scrollToSection(personalRef)}
              style={{ cursor: isEditing ? 'pointer' : 'default' }}
            >
              <span className="step-num">01</span>
              <span className="step-label">Personal Identity</span>
            </div>
            <div
              className={`student-profile__progress-item ${!isEditing ? 'active' : ''}`}
              onClick={() => isEditing && scrollToSection(academicRef)}
              style={{ cursor: isEditing ? 'pointer' : 'default' }}
            >
              <span className="step-num">02</span>
              <span className="step-label">Academic Path</span>
            </div>
            <div
              className={`student-profile__progress-item ${!isEditing ? 'active' : ''}`}
              onClick={() => isEditing && scrollToSection(interestsRef)}
              style={{ cursor: isEditing ? 'pointer' : 'default' }}
            >
              <span className="step-num">03</span>
              <span className="step-label">Interests & Goals</span>
            </div>
          </nav>
        </aside>

        {/* Main Form */}
        <div className="student-profile__form-wrapper">
          <section className="student-profile__form-card">
            {isEditing ? (
              <form className="student-profile__form" onSubmit={e => e.preventDefault()}>
                <div ref={personalRef} style={{ scrollMarginTop: '80px' }}>
                  <div className="student-profile__section-header">
                    <h2>Personal Identity</h2>
                    <p>How you'll appear to your peers and mentors.</p>
                  </div>
                  <div className="student-profile__grid" style={{ marginTop: '1.5rem' }}>
                    <div className="student-profile__field">
                      <label>Full Name</label>
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Alex Rivera" />
                    </div>
                    <div className="student-profile__field">
                      <label>Date of Birth</label>
                      <div className="field-icon">
                        <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                        <span className="material-symbols-outlined" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--icon-color)' }}>calendar_today</span>
                      </div>
                    </div>
                    <div className="student-profile__field">
                      <label>Current Location</label>
                      <div className="field-icon">
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" />
                        <span className="material-symbols-outlined" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--icon-color)' }}>location_on</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={academicRef} style={{ scrollMarginTop: '80px' }}>
                  <div className="student-profile__section-header" style={{ marginTop: '2rem' }}>
                    <h2>Academic Background</h2>
                    <p>Tell us about your current studies.</p>
                  </div>
                  <div className="student-profile__grid" style={{ marginTop: '1.5rem' }}>
                    <div className="student-profile__field full-width">
                      <label>University / College</label>
                      <input type="text" value={university} onChange={e => setUniversity(e.target.value)} placeholder="e.g. Stanford University" />
                    </div>
                    <div className="student-profile__field">
                      <label>Course / Major</label>
                      <input type="text" value={major} onChange={e => setMajor(e.target.value)} placeholder="e.g. Computer Science" />
                    </div>
                    <div className="student-profile__field">
                      <label>Year of Graduation</label>
                      <select value={gradYear} onChange={e => setGradYear(e.target.value)}>
                        <option>2024</option>
                        <option>2025</option>
                        <option>2026</option>
                        <option>2027</option>
                        <option>2028+</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div ref={interestsRef} style={{ scrollMarginTop: '80px' }}>
                  <div className="student-profile__section-header" style={{ marginTop: '2rem' }}>
                    <h2>Interests & Expertise</h2>
                    <p>Select topics that resonate with your career path.</p>
                  </div>
                  <div className="student-profile__interests" style={{ marginTop: '1.5rem' }}>
                    {interestsList.map(interest => (
                      <button
                        key={interest} type="button"
                        className={`student-profile__interest-tag ${activeInterests.includes(interest) ? 'student-profile__interest-tag--active' : 'student-profile__interest-tag--default'}`}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="student-profile__actions" style={{ marginTop: '2.5rem' }}>
                  <div className="student-profile__actions-info">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>security</span>
                    <span>Your data is encrypted safely</span>
                  </div>
                  <div className="student-profile__actions-buttons">
                    {profile?.full_name && (
                      <button type="button" className="student-profile__draft-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    )}
                    <button type="button" className="btn-gradient student-profile__submit-btn" onClick={handleSaveProfile} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="student-profile__view">
                <div className="student-profile__view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Avatar with upload overlay */}
                    <div
                      onClick={handleAvatarClick}
                      style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: 'var(--primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.75rem', fontWeight: 'bold', cursor: 'pointer',
                        position: 'relative', overflow: 'hidden', flexShrink: 0,
                        border: '3px solid #e2e8f0'
                      }}
                      title="Click to change profile photo"
                    >
                      {avatarSrc
                        ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : firstLetter
                      }
                      {/* Hover overlay */}
                      <div className="sp-avatar-overlay">
                        {avatarUploading
                          ? <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                          : <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>photo_camera</span>
                        }
                      </div>
                    </div>
                    <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

                    <div>
                      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{fullName}</h2>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        {major ? `${major} at ${university}` : (university || 'Student')}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="btn-gradient" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>edit</span>
                    Edit
                  </button>
                </div>

                <div className="student-profile__view-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Location</strong>
                    <span style={{ color: 'var(--text-primary)' }}>{location || 'Not specified'}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Graduation Year</strong>
                    <span style={{ color: 'var(--text-primary)' }}>{gradYear || 'Not specified'}</span>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Interests & Expertise</strong>
                    <div className="student-profile__interests">
                      {activeInterests.length > 0 ? activeInterests.map(interest => (
                        <span key={interest} className="student-profile__interest-tag student-profile__interest-tag--active" style={{ cursor: 'default' }}>{interest}</span>
                      )) : <span style={{ color: 'var(--text-secondary)' }}>No interests added.</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* User Posts Section */}
          {!isEditing && (
            <section className="student-profile__posts-section" style={{ marginTop: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>My Posts</h3>
                <Link to="/create" className="btn-gradient" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: '500', fontSize: '0.875rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add</span>
                  New Post
                </Link>
              </div>

              {postsLoading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading posts...</p>
              ) : myPosts.length === 0 ? (
                <div style={{ background: 'white', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--border-color)', marginBottom: '1rem' }}>article</span>
                  <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.125rem' }}>No posts published yet</h4>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Share your professional insights to build your brand.</p>
                  <Link to="/create" className="btn-gradient" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>add</span>
                    Create Post
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} ref={menuRef}>
                  {myPosts.map(post => (
                    <article key={post.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative' }}>
                      {/* Three-dot action menu */}
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                          title="Post options"
                        >
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                        {openMenuId === post.id && (
                          <div style={{
                            position: 'absolute', top: '2rem', right: 0,
                            background: 'white', borderRadius: '10px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
                            zIndex: 50, minWidth: '150px', overflow: 'hidden'
                          }}>
                            <button
                              onClick={() => handleEditPost(post)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#1e3a5f', textAlign: 'left' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
                              Edit
                            </button>
                            <button
                              onClick={() => handleArchivePost(post)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b', textAlign: 'left' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>archive</span>
                              Archive
                            </button>
                            <button
                              onClick={() => handleDeletePost(post)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#ef4444', textAlign: 'left', borderTop: '1px solid #f1f5f9' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', paddingRight: '2rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, overflow: 'hidden' }}>
                          {avatarSrc
                            ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : firstLetter
                          }
                        </div>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{fullName || 'Anonymous'}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{major} • {getTimeAgo(post.created_at)}</p>
                        </div>
                      </div>

                      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem', paddingRight: '2rem' }}>{post.title}</h2>
                      {post.content && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                          {post.content.replace(/<[^>]+>/g, '').substring(0, 200)}{post.content.length > 200 ? '...' : ''}
                        </p>
                      )}

                      {post.cover_image_url && (
                        <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                          <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_upward</span>
                          {post.upvotes || 0}
                        </span>
                        {post.tags?.length > 0 && (
                          <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '999px', color: '#64748b' }}>{post.tags[0]}</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <BottomNav />

      <style>{`
        .sp-avatar-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s ease; color: white;
        }
        div:hover > .sp-avatar-overlay { opacity: 1; }
        @keyframes spToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default StudentProfileSetup;
