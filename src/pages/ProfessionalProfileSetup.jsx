import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../config/api';
import './ProfessionalProfileSetup.css';

const ProfessionalProfileSetup = () => {
  const { user, profile, fetchProfile, updateAvatar } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [toast, setToast] = useState('');

  const avatarInputRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [localAvatar, setLocalAvatar] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (profile) {
      setFullName(profile.full_name || '');
      setJobTitle(profile.job_title || '');
      setCompany(profile.company || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
      setGraduationYear(profile.graduation_year || '');
      setSkills(profile.skills || []);
      setLocalAvatar(profile.avatar_url || null);
      setIsEditing(!profile.full_name);
    }
  }, [user, profile, navigate]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill));

  const addSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills(prev => [...prev, customSkill.trim()]);
    }
    setCustomSkill('');
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await apiFetch(`/profiles/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          full_name: fullName,
          job_title: jobTitle,
          company,
          location,
          bio,
          graduation_year: graduationYear,
          skills,
          role: 'professional',
        })
      });
      await fetchProfile(user.id);
      setIsEditing(false);
      showToast('Profile saved successfully!');
    } catch (error) {
      alert('Error saving profile: ' + error.message);
    }
    setLoading(false);
  };

  const handleAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const publicUrl = reader.result;
        setLocalAvatar(publicUrl);
        await updateAvatar(publicUrl);
        showToast('Profile photo updated!');
      } catch (err) {
        alert('Upload failed: ' + err.message);
      }
      setAvatarUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const avatarSrc = localAvatar || profile?.avatar_url;
  const firstLetter = fullName ? fullName.charAt(0).toUpperCase() : 'P';

  return (
    <div className="pro-profile">
      <Header />

      {toast && (
        <div style={{
          position: 'fixed', top: '5rem', left: '50%', transform: 'translateX(-50%)',
          background: '#1e3a5f', color: 'white', padding: '0.75rem 1.25rem',
          borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 9999,
          animation: 'fadeInDown 0.2s ease'
        }}>
          {toast}
        </div>
      )}

      <main className="pro-profile__main">
        {/* Sidebar */}
        <aside className="pro-profile__sidebar">
          <div className="pro-profile__identity">
            <div className="pro-profile__identity-header">
              <div
                className="pro-profile__avatar"
                onClick={handleAvatarClick}
                style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span className="pro-profile__avatar-fallback">{firstLetter}</span>
                )}
                <div className="pro-profile__avatar-overlay">
                  {avatarUploading
                    ? <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                    : <span className="material-symbols-outlined">photo_camera</span>
                  }
                </div>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <h2>Professional Profile</h2>
              <p>Build your identity in the Elevate ecosystem.</p>
            </div>

            <nav className="pro-profile__sidebar-nav">
              <a href="#" className="pro-profile__sidebar-link active">
                <span className="material-symbols-outlined">person</span>
                Basic Info
              </a>
              <a href="#" className="pro-profile__sidebar-link">
                <span className="material-symbols-outlined">work</span>
                Experience
              </a>
              <a href="#" className="pro-profile__sidebar-link">
                <span className="material-symbols-outlined">verified</span>
                Skills
              </a>
            </nav>
          </div>
        </aside>

        {/* Form Section */}
        <section className="pro-profile__form-section">
          <div className="pro-profile__heading">
            <h1>{isEditing ? 'Setup your Professional Hub' : 'Your Professional Profile'}</h1>
            <p>Elevate uses these details to match you with high-growth communities and opportunities.</p>
          </div>

          {!isEditing ? (
            <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--outline-variant)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                  >
                    {avatarSrc
                      ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : firstLetter
                    }
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--on-surface)' }}>{fullName}</h2>
                    <p style={{ color: 'var(--on-surface-variant)' }}>
                      {jobTitle ? `${jobTitle}${company ? ` at ${company}` : ''}` : 'Professional'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsEditing(true)} className="btn-gradient" style={{ padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>edit</span>
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <form className="pro-profile__form" onSubmit={e => e.preventDefault()}>
              {/* Identity & Role */}
              <div>
                <div className="pro-profile__group-header">
                  <span className="material-symbols-outlined">contact_page</span>
                  <h3>Identity & Role</h3>
                </div>
                <div className="pro-profile__grid pro-profile__grid--2">
                  <div className="pro-profile__field">
                    <label>Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={{ color: '#000', fontWeight: '500' }} />
                  </div>
                  <div className="pro-profile__field">
                    <label>Current Job Role</label>
                    <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={{ color: '#000', fontWeight: '500' }} />
                  </div>
                </div>
              </div>

              {/* Experience & Background */}
              <div className="pro-profile__experience-group">
                <div className="pro-profile__group-header">
                  <span className="material-symbols-outlined">history_edu</span>
                  <h3>Experience & Background</h3>
                </div>
                <div className="pro-profile__grid pro-profile__grid--2">
                  <div className="pro-profile__field">
                    <label>Current Company</label>
                    <input type="text" value={company} onChange={e => setCompany(e.target.value)} style={{ color: '#000', fontWeight: '500' }} />
                  </div>
                  <div className="pro-profile__field">
                    <label>Graduation Year</label>
                    <input type="text" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} style={{ color: '#000', fontWeight: '500' }} />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <div className="pro-profile__group-header">
                  <span className="material-symbols-outlined">description</span>
                  <h3>Bio</h3>
                </div>
                <div className="pro-profile__field">
                  <label>Short Bio</label>
                  <textarea
                    value={bio} onChange={e => setBio(e.target.value)}
                    rows="3" placeholder="Tell us about yourself..."
                    style={{ color: '#000', fontWeight: '500', resize: 'vertical', width: '100%', padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-container-highest)', border: 'none', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* Network Context */}
              <div>
                <div className="pro-profile__group-header">
                  <span className="material-symbols-outlined">explore</span>
                  <h3>Network Context</h3>
                </div>
                <div className="pro-profile__grid">
                  <div className="pro-profile__field">
                    <label>City / Base Location</label>
                    <div className="field-icon">
                      <span className="material-symbols-outlined">location_on</span>
                      <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={{ color: '#000', fontWeight: '500' }} />
                    </div>
                  </div>
                  <div className="pro-profile__field">
                    <label>Core Competencies (Skills)</label>
                    <div className="pro-profile__skills-container">
                      {skills.map(skill => (
                        <span key={skill} className="pro-profile__skill-tag">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)}>
                            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>close</span>
                          </button>
                        </span>
                      ))}
                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '300px' }}>
                        <input
                          type="text" value={customSkill}
                          onChange={e => setCustomSkill(e.target.value)}
                          onKeyDown={handleSkillKeyDown}
                          placeholder="Add skill..."
                          style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--outline)', background: 'var(--surface)', color: '#000', outline: 'none', fontSize: '0.875rem' }}
                        />
                        <button
                          type="button" onClick={addSkill}
                          style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pro-profile__actions">
                <div className="pro-profile__actions-info">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>security</span>
                  <p>Your data is encrypted safely</p>
                </div>
                <div className="pro-profile__actions-buttons">
                  {profile?.full_name && (
                    <button type="button" className="pro-profile__cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                  )}
                  <button type="button" className="btn-gradient pro-profile__complete-btn" onClick={handleSaveProfile} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>
      </main>

      <BottomNav />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalProfileSetup;
