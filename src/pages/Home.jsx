import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { apiFetch } from '../config/api';
import { useAuth } from '../context/AuthContext';
import CommentList from '../components/comment/CommentList';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [votedPosts, setVotedPosts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const { user, profile } = useAuth();
  const location = useLocation();

  const searchQuery = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    if (searchQuery) {
      searchPosts(searchQuery);
    } else {
      fetchPosts();
    }
  }, [searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/posts');
      if (data) {
        const postsArray = Array.isArray(data) ? data : (data.posts || []);
        setPosts(postsArray);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
    setLoading(false);
  };

  const searchPosts = async (q) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/posts/search?q=${encodeURIComponent(q)}`);
      if (data) {
        const postsArray = Array.isArray(data) ? data : (data.posts || []);
        setPosts(postsArray);
      }
    } catch (err) {
      console.error('Error searching posts:', err);
      setPosts([]);
    }
    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleUpvote = async (post) => {
    const current = votedPosts[post.id];
    let newUpvotes = post.upvotes || 0;
    let newDownvotes = post.downvotes || 0;
    let newVote = null;

    if (current === 'up') {
      newUpvotes = Math.max(0, newUpvotes - 1);
      newVote = null;
    } else {
      if (current === 'down') newDownvotes = Math.max(0, newDownvotes - 1);
      newUpvotes += 1;
      newVote = 'up';
    }

    setVotedPosts((prev) => ({ ...prev, [post.id]: newVote }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, upvotes: newUpvotes, downvotes: newDownvotes } : p
      )
    );
    try {
      await apiFetch(`/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ upvotes: newUpvotes, downvotes: newDownvotes }),
      });
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const handleDownvote = async (post) => {
    const current = votedPosts[post.id];
    let newUpvotes = post.upvotes || 0;
    let newDownvotes = post.downvotes || 0;
    let newVote = null;

    if (current === 'down') {
      newDownvotes = Math.max(0, newDownvotes - 1);
      newVote = null;
    } else {
      if (current === 'up') newUpvotes = Math.max(0, newUpvotes - 1);
      newDownvotes += 1;
      newVote = 'down';
    }

    setVotedPosts((prev) => ({ ...prev, [post.id]: newVote }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, upvotes: newUpvotes, downvotes: newDownvotes } : p
      )
    );
    try {
      await apiFetch(`/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ upvotes: newUpvotes, downvotes: newDownvotes }),
      });
    } catch (err) {
      console.error('Error downvoting:', err);
    }
  };

  const handleShare = (post) => {
    const url = `${window.location.origin}/home`;
    navigator.clipboard
      .writeText(url)
      .then(() => showToast('Link copied to clipboard!'))
      .catch(() => showToast('Could not copy link.'));
  };

  return (
    <MainLayout showRightSidebar>
      <div className="home__feed">
        
        {toast && (
          <div
            style={{
              position: 'fixed',
              top: '5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e3a5f',
              color: 'white',
              padding: '0.75rem 1.25rem',
              borderRadius: '999px',
              fontSize: '0.875rem',
              fontWeight: 500,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              zIndex: 9999,
              animation: 'fadeInDown 0.2s ease',
            }}
          >
            {toast}
          </div>
        )}

        
        {searchQuery && !loading && (
          <div className="home__search-banner">
            <span className="material-symbols-outlined">search</span>
            <span>
              {posts.length === 0
                ? `No results for "${searchQuery}"`
                : `${posts.length} result${posts.length !== 1 ? 's' : ''} for "${searchQuery}"`}
            </span>
          </div>
        )}

        
        <div className="home__posts">
          {loading ? (
            <div className="home__feed-empty">
              <p>Loading...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="home__feed-empty">
              <div className="home__feed-empty-icon">
                <span className="material-symbols-outlined">
                  {searchQuery ? 'search_off' : 'dynamic_feed'}
                </span>
              </div>
              <h3>{searchQuery ? 'No posts found' : 'No posts yet'}</h3>
              <p>
                {searchQuery
                  ? `We couldn't find any posts matching "${searchQuery}". Try a different keyword.`
                  : 'Be the first to share a professional insight with the community.'}
              </p>
            </div>
          ) : (
            posts.map((post) => {
              const authorName = post.profiles?.full_name || 'Anonymous';
              const authorInitials =
                authorName !== 'Anonymous'
                  ? authorName
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : '??';
              const timeAgo = getTimeAgo(post.created_at);
              const voted = votedPosts[post.id];

              const plainContent = (post.content || '').replace(/<[^>]+>/g, '');
              const previewText =
                plainContent.substring(0, 200) +
                (plainContent.length > 200 ? '...' : '');

              return (
                <article key={post.id} className="home__post">
                  <div className="home__post-body">
                    <div className="home__post-header">
                      <div className="home__post-author">
                        <Link
                          to={`/profile/user/${post.user_id}`}
                          className="home__post-avatar"
                        >
                          {post.profiles?.avatar_url ? (
                            <img
                              src={post.profiles.avatar_url}
                              alt={authorName}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '50%',
                              }}
                            />
                          ) : (
                            authorInitials
                          )}
                        </Link>
                        <div>
                          <Link
                            to={`/profile/user/${post.user_id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <h3 className="home__post-name hover:underline cursor-pointer">
                              {authorName}
                            </h3>
                          </Link>
                          <p className="home__post-meta">
                            {post.profiles?.job_title || ''} • {timeAgo}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {post.tags?.length > 0 && (
                          <span className="home__post-tag">{post.tags[0]}</span>
                        )}
                      </div>
                    </div>

                    
                    <h2 className="home__post-title">
                      {highlightText(post.title, searchQuery)}
                    </h2>

                    
                    {previewText && (
                      <p className="home__post-text">
                        {highlightText(previewText, searchQuery)}
                      </p>
                    )}

                    {post.cover_image_url && (
                      <div className="home__post-image">
                        <img src={post.cover_image_url} alt={post.title} />
                      </div>
                    )}

                    <div className="home__post-actions">
                      <div className="home__post-votes">
                        <button
                          className={`home__vote-btn home__vote-btn--up ${
                            voted === 'up' ? 'home__vote-btn--active' : ''
                          }`}
                          onClick={() => handleUpvote(post)}
                          title="Upvote"
                        >
                          <span className="material-symbols-outlined">
                            arrow_upward
                          </span>
                          <span>{post.upvotes || 0}</span>
                        </button>
                        <button
                          className={`home__vote-btn home__vote-btn--down ${
                            voted === 'down' ? 'home__vote-btn--active-down' : ''
                          }`}
                          onClick={() => handleDownvote(post)}
                          title="Downvote"
                        >
                          <span className="material-symbols-outlined">
                            arrow_downward
                          </span>
                        </button>
                      </div>
                      <div className="home__post-engage">
                        <button
                          className={`home__engage-btn ${
                            expandedComments[post.id]
                              ? 'bg-zinc-100 dark:bg-zinc-800'
                              : ''
                          }`}
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }))
                          }
                        >
                          <span className="material-symbols-outlined">
                            chat_bubble
                          </span>
                          <span>
                            Comment
                            {post.comment_count > 0
                              ? ` (${post.comment_count})`
                              : ''}
                          </span>
                        </button>
                        <button
                          className="home__engage-btn"
                          onClick={() => handleShare(post)}
                        >
                          <span className="material-symbols-outlined">share</span>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>

                    
                    {expandedComments[post.id] && (
                      <div className="px-4 pb-4">
                        <CommentList
                          postId={post.id}
                          onCommentAdded={() => {
                            setPosts((prev) =>
                              prev.map((p) =>
                                p.id === post.id
                                  ? {
                                      ...p,
                                      comment_count: (p.comment_count || 0) + 1,
                                    }
                                  : p
                              )
                            );
                          }}
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      
      <aside className="home__right-sidebar">
        <div className="home__right-sidebar-sections"></div>
      </aside>
    </MainLayout>
  );
};

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function highlightText(text, keyword) {
  if (!keyword || !text) return text;
  try {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="home__search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
}

export default Home;