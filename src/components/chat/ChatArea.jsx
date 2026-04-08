import React, { useState, useRef, useEffect } from 'react';

const ChatArea = ({ selectedChat, messages, loading, sendMessage, socket, currentUserId, isTyping }) => {
  const [content, setContent] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = (e) => {
    setContent(e.target.value);
    
    if (!socket || !selectedChat) return;
    socket.emit("typing", selectedChat._id);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    const timeout = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
    }, 3000);
    
    setTypingTimeout(timeout);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Image exceeds 5MB limit");
    }
  };

  const handleSend = () => {
    if (!content.trim() && !previewImage) return;
    sendMessage(content, previewImage);
    setContent('');
    setPreviewImage(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSender = (users) => {
    return users?.find(user => user._id !== currentUserId) || users[0];
  };

  if (!selectedChat) {
    return (
      <section className="chat__area flex items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
        <div className="text-center text-zinc-500">
          <span className="material-symbols-outlined text-6xl mb-4">chat_bubble_outline</span>
          <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
          <p>Select a chat from the left or create a new group.</p>
        </div>
      </section>
    );
  }

  const chatTitle = selectedChat.isGroupChat 
    ? selectedChat.chatName 
    : getSender(selectedChat.users)?.full_name;

  return (
    <section className="chat__area flex flex-col h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
      
      
      <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur z-10">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{chatTitle}</h3>
      </div>

      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="material-symbols-outlined animate-spin text-zinc-400">autorenew</span>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = m.sender_id._id === currentUserId;
            return (
              <div key={m._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl p-4 ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm'}`}>
                  
                  
                  {!isMe && selectedChat.isGroupChat && (
                    <div className="text-xs text-blue-500 font-semibold mb-1">
                      {m.sender_id.full_name}
                    </div>
                  )}

                  
                  {m.image_url && (
                    <img src={m.image_url} alt="chat attachment" className="rounded-xl mb-2 max-h-64 object-contain" />
                  )}

                  
                  {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                  
                  
                  <div className={`text-[10px] mt-2 text-right ${isMe ? 'text-blue-200' : 'text-zinc-400'}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl py-2 px-4 rounded-tl-sm flex gap-1 items-center">
               <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"></span>
               <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-75"></span>
               <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-150"></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {previewImage && (
          <div className="mb-4 relative inline-block">
            <img src={previewImage} alt="Preview" className="h-24 rounded-lg border border-zinc-200 dark:border-zinc-700 object-cover" />
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-full transition-all"
            title="Attach Image"
          >
            <span className="material-symbols-outlined">image</span>
          </button>
          
          <textarea
            value={content}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 border-none focus:ring-1 focus:ring-blue-500 rounded-2xl py-3 px-4 resize-none max-h-32 text-sm"
            rows="1"
            style={{ minHeight: '44px' }}
          />
          
          <button 
            onClick={handleSend}
            disabled={!content.trim() && !previewImage}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatArea;
