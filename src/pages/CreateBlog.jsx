import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './CreateBlog.css';

const CreateBlog = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [title, setTitle] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load post data in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      // NOTE: Our backend doesn't have GET /:id for posts yet, we could use GET / and filter
      apiFetch('/posts').then((posts) => {
        const data = posts.find(p => p.id === editId || p._id === editId);
        if (data) {
          setTitle(data.title || '');
          setTags(data.tags || []);
          if (data.cover_image_url) setCoverImagePreview(data.cover_image_url);
          setTimeout(() => {
            if (bodyRef.current) bodyRef.current.innerHTML = data.content || '';
          }, 0);
        }
      }).catch(err => console.error('Error fetching post:', err));
    }
  }, [isEditMode, editId]);

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) setTags(prev => [...prev, trimmed]);
    setTagInput('');
    setShowTagInput(false);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    else if (e.key === 'Escape') { setTagInput(''); setShowTagInput(false); }
  };

  const execFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (bodyRef.current) bodyRef.current.focus();
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) execFormat('createLink', url);
  };

  const handleCoverImage = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCoverImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    setErrorMsg('');
    if (!title.trim()) { setErrorMsg('Please add a title before publishing.'); return; }
    setPublishing(true);

    try {
      if (!user?.id) throw new Error('You must be logged in to publish a post.');

      let coverImageUrl = coverImagePreview || ''; // We use the base64 preview string directly

      const content = bodyRef.current?.innerHTML || '';

      if (isEditMode) {
        await apiFetch(`/posts/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: title.trim(), content, tags,
            cover_image_url: coverImageUrl,
          })
        });
      } else {
        await apiFetch('/posts', {
          method: 'POST',
          body: JSON.stringify({
            title: title.trim(), content, tags,
            cover_image_url: coverImageUrl,
          })
        });
      }

      navigate('/profile/student');
    } catch (err) {
      console.error('Publish error:', err);
      setErrorMsg(err.message || 'Unknown error occurred while publishing.');
      setPublishing(false);
    }
  };

  return (
    <div className="create-blog">
      <header className="create-blog__header">
        <div className="create-blog__header-inner">
          <div className="create-blog__header-left">
            <Link to={isEditMode ? '/profile/student' : '/home'} className="create-blog__close-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
            </Link>
            <div className="create-blog__draft-status">
              <span>{isEditMode ? 'Editing Post' : 'Draft'}</span>
              <span className="create-blog__draft-dot"></span>
              <span className="create-blog__draft-time">Unsaved</span>
            </div>
          </div>
          <div className="create-blog__header-actions">
            <button className="btn-gradient create-blog__publish-btn" onClick={handlePublish} disabled={publishing}>
              <span>{publishing ? (isEditMode ? 'Saving...' : 'Publishing...') : (isEditMode ? 'Save Changes' : 'Publish')}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>{isEditMode ? 'save' : 'rocket_launch'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="create-blog__editor">
        {errorMsg && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>
            <strong>Error:</strong> {errorMsg}
          </div>
        )}
        <div className="create-blog__tags">
          <button className="create-blog__add-tag" onClick={() => setShowTagInput(true)}>
            <span className="material-symbols-outlined">sell</span>
            Add Topic Tags
          </button>
          {tags.map(tag => (
            <span key={tag} className="create-blog__tag">
              {tag}
              <button onClick={() => removeTag(tag)}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>close</span>
              </button>
            </span>
          ))}
          {showTagInput && (
            <input
              type="text" className="create-blog__tag-input" placeholder="Type tag..."
              value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown} onBlur={addTag} autoFocus
            />
          )}
        </div>

        <textarea
          className="create-blog__title" placeholder="Your disruptive insight here..."
          rows="1" value={title} onChange={(e) => setTitle(e.target.value)}
        />

        <div className="create-blog__cover" onClick={handleCoverImage}>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          {coverImagePreview ? (
            <img src={coverImagePreview} alt="Cover" className="create-blog__cover-preview" />
          ) : (
            <div className="create-blog__cover-content">
              <div className="create-blog__cover-icon">
                <span className="material-symbols-outlined">add_photo_alternate</span>
              </div>
              <div>
                <p>Add Cover Image</p>
                <p>16:9 ratio recommended for feed</p>
              </div>
            </div>
          )}
        </div>

        <div className="create-blog__toolbar">
          <div className="create-blog__toolbar-group">
            <button className="create-blog__toolbar-btn" title="Bold" onClick={() => execFormat('bold')}>
              <span className="material-symbols-outlined">format_bold</span>
            </button>
            <button className="create-blog__toolbar-btn" title="Italic" onClick={() => execFormat('italic')}>
              <span className="material-symbols-outlined">format_italic</span>
            </button>
            <button className="create-blog__toolbar-btn" title="Underline" onClick={() => execFormat('underline')}>
              <span className="material-symbols-outlined">format_underlined</span>
            </button>
          </div>
          <div className="create-blog__toolbar-group">
            <button className="create-blog__toolbar-btn" title="Heading 1" onClick={() => execFormat('formatBlock', 'h1')}>
              <span className="material-symbols-outlined">format_h1</span>
            </button>
            <button className="create-blog__toolbar-btn" title="Heading 2" onClick={() => execFormat('formatBlock', 'h2')}>
              <span className="material-symbols-outlined">format_h2</span>
            </button>
          </div>
          <div className="create-blog__toolbar-group">
            <button className="create-blog__toolbar-btn" title="Bulleted List" onClick={() => execFormat('insertUnorderedList')}>
              <span className="material-symbols-outlined">format_list_bulleted</span>
            </button>
            <button className="create-blog__toolbar-btn" title="Numbered List" onClick={() => execFormat('insertOrderedList')}>
              <span className="material-symbols-outlined">format_list_numbered</span>
            </button>
          </div>
          <div className="create-blog__toolbar-group">
            <button className="create-blog__toolbar-btn" title="Link" onClick={handleLink}>
              <span className="material-symbols-outlined">link</span>
            </button>
            <button className="create-blog__toolbar-btn" title="Code Block" onClick={() => execFormat('formatBlock', 'pre')}>
              <span className="material-symbols-outlined">code_blocks</span>
            </button>
          </div>
        </div>

        <div className="create-blog__content-area">
          <div
            ref={bodyRef} className="create-blog__body" contentEditable
            data-placeholder="Start writing or type '/' for commands..." suppressContentEditableWarning
          />
        </div>
      </main>

      <div className="create-blog__mobile-toolbar">
        <button onClick={handleCoverImage}><span className="material-symbols-outlined">image</span></button>
        <button onClick={() => execFormat('insertUnorderedList')}><span className="material-symbols-outlined">format_list_bulleted</span></button>
        <button onClick={handleLink}><span className="material-symbols-outlined">link</span></button>
      </div>
    </div>
  );
};

export default CreateBlog;
