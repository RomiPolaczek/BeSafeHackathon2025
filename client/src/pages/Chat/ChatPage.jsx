import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import UserSearch from '../../components/UserSearch'; // Updated import path
import TypingIndicator from '../../components/TypingIndicator/TypingIndicator';
import { Send, Paperclip } from 'lucide-react';
import styles from './ChatPage.module.css';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messageListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      auth: { token: currentUser.token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('chat message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    newSocket.on('user typing', ({ userId, username }) => {
      if (selectedUser && userId === selectedUser.id) {
        setIsTyping(true);
      }
    });

    newSocket.on('user stop typing', ({ userId }) => {
      if (selectedUser && userId === selectedUser.id) {
        setIsTyping(false);
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [currentUser.token, selectedUser]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    if (selectedUser) {
      try {
        const response = await axios.get(`http://localhost:3001/api/messages?userId=${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
  }, [selectedUser, currentUser.token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      try {
        const messageData = {
          id: Date.now(),
          content: newMessage.trim(),
          recipientId: selectedUser.id,
          senderId: currentUser.id,
          type: 'text',
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, messageData]);
        
        socket.emit('chat message', messageData);
        setNewMessage('');
        socket.emit('stop typing', selectedUser.id);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleTyping = () => {
    if (selectedUser && socket) {
      socket.emit('typing', selectedUser.id);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop typing', selectedUser.id);
      }, 1000);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]);
    setNewMessage('');
    setIsTyping(false);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidebar}>
        <UserSearch onSelectUser={handleUserSelect} />
      </div>
      <div className={styles.chatArea}>
        {selectedUser ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.avatar}>{selectedUser.username[0].toUpperCase()}</div>
              <div className={styles.userInfo}>
                <h2 className={styles.username}>{selectedUser.username}</h2>
                <span className={styles.userStatus}>Online</span>
              </div>
            </div>
            <div className={styles.messageList} ref={messageListRef}>
              {messages.map((message, index) => (
                <div 
                  key={message.id || index} 
                  className={`${styles.messageBubble} ${message.senderId === currentUser.id ? styles.sent : styles.received}`}
                >
                  {message.content}
                </div>
              ))}
            </div>
            {isTyping && <TypingIndicator username={selectedUser.username} />}
            <div className={styles.inputArea}>
              <form className={styles.inputForm} onSubmit={handleSendMessage}>
                <button type="button" className={styles.iconButton}>
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onInput={handleTyping}
                  placeholder="Type a message..."
                  className={styles.messageInput}
                  autoComplete="off"
                />
                <button type="submit" className={styles.iconButton} disabled={!newMessage.trim()}>
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>💬</div>
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

