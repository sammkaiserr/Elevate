import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CreateBlog.css';

const CreateBlog = () => {
  const [tags, setTags] = useState(['Engineering']);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const removeTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
    setShowTagInput(false);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      setTagInput('');
      setShowTagInput(false);
    }
  };

  // Toolbar formatting
  const execFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (bodyRef.current) bodyRef.current.focus();
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) execFormat('createLink', url);
  };

  const handleCoverImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCoverImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    alert('Post published successfully!');
    navigate('/home');
  };

  return (
    <div className="create-blog">
      {/* Header */}
      <header className="create-blog__header">
        <div className="create-blog__header-inner">
          <div className="create-blog__header-left">
            <Link to="/home" className="create-blog__close-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
            </Link>
            <div className="create-blog__draft-status">
              <span>Draft</span>
              <span className="create-blog__draft-dot"></span>
              <span className="create-blog__draft-time">Saved just now</span>
            </div>
          </div>
          <div className="create-blog__header-actions">
            <button className="btn-gradient create-blog__publish-btn" onClick={handlePublish}>
              <span>Publish</span>
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>rocket_launch</span>
            </button>
          </div>
        </div>
      </header>

      <main className="create-blog__editor">
        {/* Tags */}
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
              type="text"
              className="create-blog__tag-input"
              placeholder="Type tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              autoFocus
            />
          )}
        </div>

        {/* Title */}
        <textarea
          className="create-blog__title"
          placeholder="Your disruptive insight here..."
          rows="1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Cover Image */}
        <div className="create-blog__cover" onClick={handleCoverImage}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {coverImage ? (
            <img src={coverImage} alt="Cover" className="create-blog__cover-preview" />
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

        {/* Toolbar */}
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

        {/* Content Area */}
        <div className="create-blog__content-area">
          <div
            ref={bodyRef}
            className="create-blog__body"
            contentEditable
            data-placeholder="Start writing or type '/' for commands..."
            suppressContentEditableWarning
          />
        </div>
      </main>

      {/* Mobile Toolbar */}
      <div className="create-blog__mobile-toolbar">
        <button onClick={handleCoverImage}><span className="material-symbols-outlined">image</span></button>
        <button onClick={() => execFormat('insertUnorderedList')}><span className="material-symbols-outlined">format_list_bulleted</span></button>
        <button onClick={handleLink}><span className="material-symbols-outlined">link</span></button>
      </div>
    </div>
  );
};

export default CreateBlog;
