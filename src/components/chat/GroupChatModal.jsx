import React, { useState } from 'react';
import { useAuth } from '@clerk/react';

const GroupChatModal = ({ onClose, fetchConversations }) => {
  const { getToken } = useAuth();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResult([]);
      return;
    }
    
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`/api/profiles?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      console.error("Error fetching users", error);
      setLoading(false);
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      alert("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      alert("Please fill all the fields");
      return;
    }
    try {
      const token = await getToken();
      await fetch(`/api/conversations/group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        }),
      });
      fetchConversations();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartDirect = async (user) => {
    try {
      const token = await getToken();
      await fetch(`/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          partnerId: user._id
        }),
      });
      fetchConversations();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Create Chat
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <span className="material-symbols-outlined font-light">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Group Chat Name (Optional)"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-zinc-900 dark:text-zinc-100"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                placeholder="Search Users (e.g. Shyam, Jane)"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-zinc-900 dark:text-zinc-100"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <span 
                  key={u._id} 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                >
                  {u.full_name}
                  <button onClick={() => handleDelete(u)} className="hover:text-blue-900 dark:hover:text-blue-100">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
            </div>

            
            {loading ? (
              <div className="flex justify-center p-4">
                <span className="material-symbols-outlined animate-spin text-zinc-400">autorenew</span>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {searchResult?.slice(0, 4).map((user) => (
                  <div 
                    key={user._id} 
                    className="flex justify-between items-center p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition"
                  >
                    <div className="flex items-center gap-3 w-full" onClick={() => handleStartDirect(user)}>
                      <img src={user.image || `https://ui-avatars.com/api/?name=${user.full_name}`} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{user.full_name}</h4>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    {groupChatName.length > 0 && (
                      <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleGroup(user);
                         }}
                         className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 font-medium"
                      >
                        Add
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={selectedUsers.length < 2 || !groupChatName}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-semibold rounded-xl transition shadow-sm"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;
