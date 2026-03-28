import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const CommentList = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const data = await apiFetch(`/comments/${postId}`);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const added = await apiFetch('/comments', {
        method: 'POST',
        body: JSON.stringify({ post_id: postId, content: newComment.trim() }),
      });
      setComments([added, ...comments]);
      setNewComment('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
    setSubmitting(false);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
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
    return new Date(dateStr).toLocaleDateString('en-US');
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
          {user ? getInitials(user.fullName || user.firstName) : '?'}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-full px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-full text-sm font-medium transition disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
          >
            {submitting ? '...' : 'Post'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-4">
          <div className="w-5 h-5 border-2 border-zinc-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-2">No comments yet. Be the first to start the conversation!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <Link to={`/profile/${comment.profiles?.id || comment.profiles?._id}`} className="shrink-0">
                {comment.profiles?.avatar_url ? (
                  <img src={comment.profiles.avatar_url} alt={comment.profiles.full_name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    {getInitials(comment.profiles?.full_name)}
                  </div>
                )}
              </Link>
              <div className="flex-1">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-zinc-100 dark:border-zinc-800/80 inline-block max-w-full">
                  <div className="flex items-center justify-between gap-4 mb-0.5">
                    <Link to={`/profile/${comment.profiles?.id || comment.profiles?._id}`} className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition">
                      {comment.profiles?.full_name || 'User'}
                    </Link>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{timeAgo(comment.created_at)}</span>
                  </div>
                  {comment.profiles?.job_title && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">{comment.profiles.job_title}</p>
                  )}
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;