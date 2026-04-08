import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // profile only — auth state is via Clerk
import './Header.css';

const Header = ({ variant = 'default', activeNav = '', hideSearch = false }) => {
  const showSearch = variant === 'default' && !hideSearch;
  const showNav = variant === 'chat';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    // Pre-fill from URL on mount so the box stays synced when navigating back
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { profile } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const initials = profile?.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search: navigate to /home?q=... 400 ms after the user stops typing
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      // Clear search — go back to normal feed
      if (location.pathname === '/home' && new URLSearchParams(location.search).get('q')) {
        navigate('/home', { replace: true });
      }
      return;
    }
    const timer = setTimeout(() => {
      navigate(`/home?q=${encodeURIComponent(trimmed)}`, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync input value when URL changes (e.g. browser back/fwd)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQ = params.get('q') || '';
    setSearchQuery(prev => (prev !== urlQ ? urlQ : prev));
  }, [location.search]);

  // Close search results dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/home?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <div className="header__left">
            <button
              className="header__menu-btn"
              onClick={() => setShowDrawer(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link to="/home" className="header__brand">Elevate</Link>
          </div>

          {showNav && (
            <nav className="header__nav">
              <Link to="/home" className={activeNav === 'feed' ? 'active' : ''}>Feed</Link>
              <Link to="/home" className={activeNav === 'network' ? 'active' : ''}>Network</Link>
              <Link to="/chat" className={activeNav === 'messages' ? 'active' : ''}>Messages</Link>
            </nav>
          )}

          {showSearch && (
            <div className="header__search" ref={searchRef}>
              <div className="header__search-wrapper">
                <span className="material-symbols-outlined header__search-icon">search</span>
                <input
                  id="header-search-input"
                  type="text"
                  className="header__search-input"
                  placeholder="Search insights, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    className="header__search-clear"
                    onClick={() => { setSearchQuery(''); navigate('/home', { replace: true }); }}
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="header__actions">
            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle Dark Mode"
            >
              <span className="material-symbols-outlined theme-toggle-icon sun">light_mode</span>
              <span className="material-symbols-outlined theme-toggle-icon moon">dark_mode</span>
            </button>

            {/* Notification Bell + Dropdown */}
            <div className="header__notif-wrapper hide-mobile" ref={notifRef}>
              <button
                className={`header__icon-btn ${showNotifications ? 'header__icon-btn--active' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="material-symbols-outlined">notifications</span>
                <NotificationBadge />
              </button>

              {showNotifications && (
                <div className="header__notif-dropdown">
                  <div className="header__notif-header">
                    <h3 className="header__notif-title">Notifications</h3>
                    <button
                      className="header__notif-close"
                      onClick={() => setShowNotifications(false)}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div className="header__notif-tabs">
                    <button className="header__notif-tab active">All</button>
                  </div>

                  <NotificationList onClose={() => setShowNotifications(false)} />
                </div>
              )}
            </div>

            <Link to={profile?.role === 'professional' ? '/profile/professional' : '/profile/student'} className="header__avatar">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" className="header__avatar-img" />
                : <span className="header__avatar-fallback">{initials}</span>
              }
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      {showDrawer && (
        <div className="header__drawer-overlay" onClick={() => setShowDrawer(false)}>
          <nav className="header__drawer" onClick={(e) => e.stopPropagation()}>
            <div className="header__drawer-header">
              <Link to="/home" className="header__drawer-brand" onClick={() => setShowDrawer(false)}>
                Elevate
              </Link>
              <button className="header__drawer-close" onClick={() => setShowDrawer(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="header__drawer-links">
              <Link
                to="/home"
                className={`header__drawer-link ${path === '/home' ? 'active' : ''}`}
                onClick={() => setShowDrawer(false)}
              >
                <span className="material-symbols-outlined">dynamic_feed</span>
                <span>Feed</span>
              </Link>
              <Link
                to="/network"
                className={`header__drawer-link ${path === '/network' ? 'active' : ''}`}
                onClick={() => setShowDrawer(false)}
              >
                <span className="material-symbols-outlined">group</span>
                <span>Network</span>
              </Link>
              <Link
                to="/chat"
                className={`header__drawer-link ${path === '/chat' ? 'active' : ''}`}
                onClick={() => setShowDrawer(false)}
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                <span>Messages</span>
              </Link>
              <Link
                to="/resume"
                className={`header__drawer-link ${path === '/resume' ? 'active' : ''}`}
                onClick={() => setShowDrawer(false)}
              >
                <span className="material-symbols-outlined">document_scanner</span>
                <span>Resume AI</span>
              </Link>
              <Link
                to="/settings"
                className={`header__drawer-link ${path === '/settings' ? 'active' : ''}`}
                onClick={() => setShowDrawer(false)}
              >
                <span className="material-symbols-outlined">settings</span>
                <span>Settings</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

const NotificationBadge = () => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    import('../../config/api').then(({ apiFetch }) => {
      apiFetch('/notifications').then(data => {
        if (data && Array.isArray(data)) {
          setCount(data.filter(n => !n.is_read).length);
        }
      }).catch(() => {});
    });
  }, []);

  if (count === 0) return null;
  return (
    <span style={{
      position: 'absolute', top: '4px', right: '4px',
      background: '#ef4444', color: 'white',
      fontSize: '10px', fontWeight: 700,
      borderRadius: '999px', minWidth: '16px', height: '16px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 3px', pointerEvents: 'none'
    }}>{count > 9 ? '9+' : count}</span>
  );
};

const NotificationList = ({ onClose }) => {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    import('../../config/api').then(({ apiFetch }) => {
      apiFetch('/notifications').then(data => {
        if (data && Array.isArray(data)) {
          setNotifications(data);
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    });
  }, []);

  const markRead = async (notif) => {
    import('../../config/api').then(({ apiFetch }) => {
      apiFetch(`/notifications/${notif.id}`, { method: 'PUT', body: JSON.stringify({ is_read: true }) })
        .then(() => {
          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        });
    });
    // Navigate based on type
    if (notif.type === 'connection_request') {
      if (onClose) onClose();
      navigate('/network', { state: { tab: 'pending' } });
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-zinc-500">Loading...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="header__notif-empty">
        <div className="header__notif-empty-icon">
          <span className="material-symbols-outlined">notifications_none</span>
        </div>
        <h4>No notifications yet</h4>
        <p>When you get notifications, they'll show up here. Start engaging with the community to stay connected.</p>
      </div>
    );
  }

  return (
    <div className="header__notif-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
      {notifications.map(notif => (
        <div 
          key={notif.id} 
          onClick={() => markRead(notif)}
          className={`p-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-1 bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-sm">
                {notif.type === 'connection_request' ? 'person_add' : 'notifications'}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <p className="text-sm text-zinc-800 dark:text-zinc-200">{notif.message}</p>
              {notif.type === 'connection_request' && (
                <p className="text-xs text-blue-500 mt-0.5">Click to view in Network →</p>
              )}
              <span className="text-xs text-zinc-500 mt-1 block">
                {new Date(notif.created_at).toLocaleDateString()}
              </span>
            </div>
            {!notif.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto mt-2"></div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Header;
