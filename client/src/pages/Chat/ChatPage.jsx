import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import ConversationList from '../../components/ConversationList/ConversationList';
import UserSearch from '../../components/UserSearch';
import TypingIndicator from '../../components/TypingIndicator/TypingIndicator';
import MessageInput from '../../components/MessageInput/MessageInput';
import MessageList from '../../components/MessageList/MessageList';
import styles from './ChatPage.module.css';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
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
      updateConversations(message);
    });

    newSocket.on('user typing', ({ userId, username }) => {
      if (selectedConversation && userId === selectedConversation.id) {
        setIsTyping(true);
      }
    });

    newSocket.on('user stop typing', ({ userId }) => {
      if (selectedConversation && userId === selectedConversation.id) {
        setIsTyping(false);
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [currentUser.token, selectedConversation]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/conversations', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [currentUser.token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessages = useCallback(async () => {
    if (selectedConversation) {
      try {
        const response = await axios.get(`http://localhost:3001/api/messages?userId=${selectedConversation.id}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
  }, [selectedConversation, currentUser.token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (content, type) => {
    if (content && selectedConversation) {
      try {
        const messageData = {
          id: Date.now(),
          content,
          recipientId: selectedConversation.id,
          senderId: currentUser.id,
          type,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, messageData]);
        updateConversations(messageData);
        
        socket.emit('chat message', messageData);
        socket.emit('stop typing', selectedConversation.id);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleTyping = () => {
    if (selectedConversation && socket) {
      socket.emit('typing', selectedConversation.id);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop typing', selectedConversation.id);
      }, 1000);
    }
  };

  const updateConversations = (message) => {
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conv => {
        if (conv.id === message.senderId || conv.id === message.recipientId) {
          return { ...conv, lastMessage: message.content };
        }
        return conv;
      });
      return updatedConversations.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
    });
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setIsTyping(false);
  };

  const handleUserSelect = (user) => {
    const existingConversation = conversations.find(conv => conv.id === user.id);
    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      const newConversation = {
        id: user.id,
        username: user.username,
        lastMessage: '',
        lastMessageTimestamp: Date.now()
      };
      setConversations(prevConversations => [newConversation, ...prevConversations]);
      setSelectedConversation(newConversation);
    }
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidebar}>
        <UserSearch onSelectUser={handleUserSelect} />
        <ConversationList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedConversation={selectedConversation}
        />
      </div>
      <div className={styles.chatArea}>
        {selectedConversation ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.avatar}>{selectedConversation.username[0].toUpperCase()}</div>
              <div className={styles.userInfo}>
                <h2 className={styles.username}>{selectedConversation.username}</h2>
                <span className={styles.userStatus}>Online</span>
              </div>
            </div>
            <MessageList 
              messages={messages} 
              currentUser={currentUser} 
              ref={messageListRef}
            />
            {isTyping && <TypingIndicator username={selectedConversation.username} />}
            <MessageInput 
              onSendMessage={handleSendMessage} 
              onTyping={handleTyping}
              currentUser={currentUser}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>💬</div>
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

