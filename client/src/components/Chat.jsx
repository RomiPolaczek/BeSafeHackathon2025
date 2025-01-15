import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import styled from 'styled-components';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import SearchBar from './SearchBar';
import { useSocket } from '../hooks/useSocket';
import useLocalStorage from '../hooks/useLocalStorage';
import { theme } from '../assets/styles/theme';

const ChatContainer = styled.main`
  display: flex;
  flex-direction: column;
  height: 100vh;
  flex: 1;
  background-color: ${theme.colors.white};
  box-shadow: ${theme.shadows.medium};
`;

const ReconnectingMessage = styled.div`
  background-color: ${theme.colors.error};
  color: ${theme.colors.white};
  padding: ${theme.spacing.small};
  text-align: center;
`;

function Chat({ activeChat, user, setUnreadCount, updateTabNotification }) {
  const [messages, setMessages] = useLocalStorage(`chat_${activeChat.id}`, {});
  const [searchResults, setSearchResults] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const onReceiveMessage = useCallback((msg) => {
    console.log('onReceiveMessage called with:', msg);
    if (!msg) {
      console.error('Received null or undefined message');
      return;
    }
    setMessages((prevMessages) => {
      const currentMessages = prevMessages[msg.chatId] || [];
      
      // Check if message already exists
      const messageExists = currentMessages.some(
        existingMsg => 
          existingMsg.message === msg.message &&
          existingMsg.timestamp === msg.timestamp &&
          existingMsg.username === msg.username
      );

      if (messageExists) {
        console.log('Duplicate message detected, not updating state');
        return prevMessages;
      }

      console.log('Updating messages state:', msg);
      return {
        ...prevMessages,
        [msg.chatId]: [...currentMessages, msg]
      };
    });

    const isFromOtherUser = msg.username !== user.username;
    if (isFromOtherUser) {
      setUnreadCount((prev) => prev + 1);
      updateTabNotification((prev) => prev + 1);
    }
  }, [user.username, setUnreadCount, updateTabNotification, setMessages]);

  const onReceiveMessageHistory = useCallback((history) => {
    console.log('Received message history:', history);
    setMessages((prevMessages) => ({
      ...prevMessages,
      [activeChat.id]: history
    }));
    if (history.length > 0) {
      enqueueSnackbar(`Loaded ${history.length} previous messages`, { 
        variant: 'info',
        autoHideDuration: 3000,
      });
    }
  }, [activeChat.id, enqueueSnackbar, setMessages]);

  const { 
    isConnected, 
    typingUsers, 
    sendMessage, 
    emitTyping, 
    reconnectAttempt,
    markMessageAsRead,
    socket
  } = useSocket(user.username, activeChat, onReceiveMessage, onReceiveMessageHistory);

  const handleReact = useCallback((messageId, emoji) => {
    setMessages((prevMessages) => {
      const updatedMessages = { ...prevMessages };
      const chatMessages = updatedMessages[activeChat.id] || [];
      const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex !== -1) {
        const message = chatMessages[messageIndex];
        const reactions = message.reactions || {};
        const users = reactions[emoji] || [];
        
        if (users.includes(user.username)) {
          users.splice(users.indexOf(user.username), 1);
        } else {
          users.push(user.username);
        }
        
        if (users.length === 0) {
          delete reactions[emoji];
        } else {
          reactions[emoji] = users;
        }
        
        chatMessages[messageIndex] = { ...message, reactions };
      }
      
      return updatedMessages;
    });
    
    // Emit reaction to server
    socket.emit('react', { messageId, emoji, username: user.username, chatId: activeChat.id });
  }, [activeChat.id, user.username, socket, setMessages]);

  const handleSearch = useCallback((query) => {
    const results = (messages[activeChat.id] || []).filter(msg => 
      msg.message.toLowerCase().includes(query.toLowerCase()) ||
      msg.username.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  }, [activeChat.id, messages]);

  const handleSendMessage = useCallback((message) => {
    sendMessage(message);
  }, [sendMessage]);

  const handleShowAllMessages = useCallback(() => {
    markMessageAsRead(activeChat.id);
  }, [markMessageAsRead, activeChat.id]);

  const memoizedMessageList = useMemo(() => (
    <MessageList 
      messages={searchResults.length > 0 ? searchResults : messages[activeChat.id] || []} 
      onReact={handleReact}
      user={user}
      setUnreadCount={setUnreadCount}
      updateTabNotification={updateTabNotification}
      markMessageAsRead={markMessageAsRead}
    />
  ), [searchResults, messages, activeChat.id, handleReact, user, setUnreadCount, updateTabNotification, markMessageAsRead]);

  return (
    <ChatContainer aria-label={`Chat room: ${activeChat.name}`}>
      <ChatHeader chatName={activeChat.name} isConnected={isConnected} />
      <SearchBar onSearch={handleSearch} />
      {!isConnected && reconnectAttempt > 0 && (
        <ReconnectingMessage role="alert" aria-live="assertive">
          Reconnecting... Attempt {reconnectAttempt}
        </ReconnectingMessage>
      )}
      {memoizedMessageList}
      <TypingIndicator typingUsers={typingUsers} />
      <MessageInput 
        onSendMessage={handleSendMessage} 
        onTyping={emitTyping} 
        isConnected={isConnected}
        onShowAllMessages={handleShowAllMessages}
      />
    </ChatContainer>
  );
}

export default Chat;

