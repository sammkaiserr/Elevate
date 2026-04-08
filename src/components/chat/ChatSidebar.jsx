import React, { useState } from 'react';
import GroupChatModal from './GroupChatModal';

const ChatSidebar = ({ conversations, selectedChat, setSelectedChat, fetchConversations, currentUserId }) => {
  const [activeTab, setActiveTab] = useState('direct');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getSender = (users) => {
    return users?.find(user => user._id !== currentUserId) || users[0];
  };

  const filteredConversations = conversations?.filter(c => {
    const name = c.isGroupChat ? c.chatName : getSender(c.users)?.full_name;
    const matchesSearch = name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'direct' ? !c.isGroupChat : c.isGroupChat;
    return matchesSearch && matchesTab;
  });

  return (
    <aside className="chat__sidebar">
      <div className="chat__sidebar-header">
        <div className="chat__sidebar-header-top">
          <h2 className="chat__sidebar-title">Messages</h2>
          <div className="chat__sidebar-actions">
            <button 
              className="chat__sidebar-action-btn chat__sidebar-action-btn--compose"
              onClick={() => setIsGroupModalOpen(true)}
              title="New Group Chat"
            >
              <span className="material-symbols-outlined">group_add</span>
            </button>
          </div>
        </div>

        <div className="chat__search">
          <span className="material-symbols-outlined chat__search-icon">search</span>
          <input
            type="text"
            className="chat__search-input"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="chat__tabs">
          <button
            className={`chat__tab ${activeTab === 'direct' ? 'active' : ''}`}
            onClick={() => setActiveTab('direct')}
          >
            Direct
          </button>
          <button
            className={`chat__tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        </div>
      </div>

      <div className="chat__conv-list p-2 space-y-2 overflow-y-auto">
        {filteredConversations?.length > 0 ? (
          filteredConversations.map(c => (
            <div 
              key={c._id}
              onClick={() => setSelectedChat(c)}
              className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all ${selectedChat?._id === c._id ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
            >
              <img 
                src={c.isGroupChat ? 'https://ui-avatars.com/api/?name=' + c.chatName : getSender(c.users)?.image || 'https://ui-avatars.com/api/?name=User'} 
                alt="avatar" 
                className="w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {c.isGroupChat ? c.chatName : getSender(c.users)?.full_name}
                </h4>
                {c.latestMessage && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    {c.latestMessage.sender_id?._id === currentUserId ? "You: " : ""}
                    {c.latestMessage.content || "📸 Image"}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="chat__conv-empty flex flex-col items-center justify-center p-8 mt-4 text-center bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">
                {activeTab === 'direct' ? 'forum' : 'groups'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {activeTab === 'direct' ? 'No Direct Messages' : 'No Groups Yet'}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-[200px]">
              {activeTab === 'direct' 
                ? 'Start a conversation with someone from their profile.' 
                : 'Create a group to collaborate with multiple professionals.'}
            </p>
            {activeTab === 'groups' && (
              <button 
                onClick={() => setIsGroupModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm w-full justify-center"
              >
                <span className="material-symbols-outlined text-xl">group_add</span>
                Create New Group
              </button>
            )}
          </div>
        )}
      </div>

      {isGroupModalOpen && (
        <GroupChatModal 
          onClose={() => setIsGroupModalOpen(false)} 
          fetchConversations={fetchConversations} 
        />
      )}
    </aside>
  );
};

export default ChatSidebar;
