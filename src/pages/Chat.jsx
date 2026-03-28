import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { io } from 'socket.io-client';
import Header from '../components/layout/Header';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatArea from '../components/chat/ChatArea';
import './Chat.css';

const ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:5001';
var socket, selectedChatCompare;

const Chat = () => {
  const { getToken, userId } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize socket
  useEffect(() => {
    if (!userId) return;
    socket = io(ENDPOINT, {
      transports: ['websocket', 'polling']
    });
    
    socket.emit('setup', userId);
    socket.on('connected', () => {});
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching chats", error);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        setLoading(true);
        const token = await getToken();
        const res = await fetch(`/api/messages/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMessages(data);
        setLoading(false);
        socket.emit('join chat', selectedChat._id);
      } catch (error) {
        console.error("Error fetching messages", error);
        setLoading(false);
      }
    };
    
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  // Socket On Message Recieved
  useEffect(() => {
    if (!socket) return;
    const messageHandler = (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.conversation_id._id) {
        // Notification logic or update chat list could go here
        fetchConversations();
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
    };
    socket.on('message received', messageHandler);
    return () => socket.off('message received', messageHandler);
  });

  const sendMessage = async (content, imageUrl = "") => {
    if (!content && !imageUrl) return;
    socket.emit('stop typing', selectedChat._id);

    try {
      const token = await getToken();
      const res = await fetch('/api/messages', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          conversation_id: selectedChat._id,
          image_url: imageUrl
        })
      });
      const data = await res.json();
      socket.emit('new message', data);
      setMessages([...messages, data]);
      fetchConversations(); // Trigger update for latest message on sidebar
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  return (
    <div className="chat">
      <Header hideSearch />
      <main className="chat__main">
        <ChatSidebar 
          conversations={conversations} 
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          fetchConversations={fetchConversations}
          currentUserId={userId}
        />
        <ChatArea 
          selectedChat={selectedChat}
          messages={messages}
          loading={loading}
          sendMessage={sendMessage}
          socket={socket}
          currentUserId={userId}
          isTyping={isTyping}
        />
      </main>
    </div>
  );
};

export default Chat;
