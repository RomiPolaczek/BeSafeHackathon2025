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
import { firestore } from '../firebaseInit';

const ChatContainer = styled.main`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${theme.colors.background};
  box-shadow: ${theme.shadows.medium};
  border-radius: ${theme.borderRadius.large};
  overflow: hidden;
`;

const ChatContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const SearchAndMessages = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const ReconnectingMessage = styled.div`
  background-color: ${theme.colors.error};
  color: ${theme.colors.white};
  padding: ${theme.spacing.small};
  text-align: center;
`;

function Chat({ activeChat, user, setUnreadCount, updateTabNotification }) {
  const [messages, setMessages] = useLocalStorage(`chat_${activeChat.id}`, []);
  const [searchResults, setSearchResults] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const onReceiveMessage = useCallback((msg) => {
    console.log('onReceiveMessage called with:', msg);
    if (!msg) {
      console.error('Received null or undefined message');
      return;
    }
    setMessages((prevMessages) => {
      const messageExists = prevMessages.some(
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
      return [...prevMessages, msg];
    });

    const isFromOtherUser = msg.username !== user.username;
    if (isFromOtherUser) {
      setUnreadCount((prev) => prev + 1);
      updateTabNotification((prev) => prev + 1);
    }
  }, [user.username, setUnreadCount, updateTabNotification, setMessages]);

  const onReceiveMessageHistory = useCallback((history) => {
    console.log('Received message history:', history);
    setMessages(history);
    if (history.length > 0) {
      enqueueSnackbar(`Loaded ${history.length} previous messages`, { 
        variant: 'info',
        autoHideDuration: 3000,
      });
    }
  }, [enqueueSnackbar, setMessages]);

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
      const messageIndex = prevMessages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex !== -1) {
        const message = prevMessages[messageIndex];
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
        
        const updatedMessage = { ...message, reactions };
        return [
          ...prevMessages.slice(0, messageIndex),
          updatedMessage,
          ...prevMessages.slice(messageIndex + 1)
        ];
      }
      
      return prevMessages;
    });
    
    // Emit reaction to server
    socket.emit('react', { messageId, emoji, username: user.username, chatId: activeChat.id });
  }, [user.username, socket, setMessages, activeChat.id]);

  const handleSearch = useCallback((query) => {
    const results = messages.filter(msg => 
      msg.message.toLowerCase().includes(query.toLowerCase()) ||
      msg.username.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  }, [messages]);

  const handleSendMessage = useCallback((message) => {
    sendMessage(message);
  }, [sendMessage]);

  const handleShowAllMessages = useCallback(() => {
    markMessageAsRead(activeChat.id);
  }, [markMessageAsRead, activeChat.id]);

  const memoizedMessageList = useMemo(() => (
    <MessageList 
      messages={searchResults.length > 0 ? searchResults : messages} 
      onReact={handleReact}
      user={user}
      setUnreadCount={setUnreadCount}
      updateTabNotification={updateTabNotification}
      markMessageAsRead={markMessageAsRead}
    />
  ), [searchResults, messages, handleReact, user, setUnreadCount, updateTabNotification, markMessageAsRead]);

  return (
    <ChatContainer aria-label={`Chat room: ${activeChat.name}`}>
      <ChatHeader chatName={activeChat.name} isConnected={isConnected} />
      <ChatContent>
        <SearchAndMessages>
          <SearchBar onSearch={handleSearch} />
          {!isConnected && reconnectAttempt > 0 && (
            <ReconnectingMessage role="alert" aria-live="assertive">
              Reconnecting... Attempt {reconnectAttempt}
            </ReconnectingMessage>
          )}
          {memoizedMessageList}
        </SearchAndMessages>
        <TypingIndicator typingUsers={typingUsers} />
        <MessageInput 
          onSendMessage={handleSendMessage} 
          onTyping={emitTyping} 
          isConnected={isConnected}
          onShowAllMessages={handleShowAllMessages}
        />
      </ChatContent>
    </ChatContainer>
  );
}

export default Chat;

