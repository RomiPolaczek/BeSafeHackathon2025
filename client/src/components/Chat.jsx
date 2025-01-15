import React, { useState, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import styled from 'styled-components';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { useSocket } from '../hooks/useSocket';
import { theme } from '../styles/theme';

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

function Chat({ activeChat, username }) {
  const [messages, setMessages] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  const onReceiveMessage = useCallback((msg) => {
    console.log('onReceiveMessage called with:', msg);
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

    const isFromOtherUser = msg.username !== username;
    if (isFromOtherUser) {
      enqueueSnackbar(`${msg.username}: ${msg.message}`, { 
        variant: 'info',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  }, [username, enqueueSnackbar]);

  const { isConnected, typingUsers, sendMessage, emitTyping, reconnectAttempt } = useSocket(username, activeChat, onReceiveMessage);

  const handleSendMessage = async (message) => {
    console.log('handleSendMessage called with:', message);
    try {
      const newMessage = await sendMessage(message);
      console.log('Message sent successfully:', newMessage);
      // The state update will be handled by onReceiveMessage
    } catch (error) {
      console.error('Error sending message:', error);
      enqueueSnackbar('Failed to send message. Please try again.', { 
        variant: 'error',
        action: (key) => (
          <button onClick={() => handleSendMessage(message)} aria-label="Retry sending message">
            Retry
          </button>
        ),
      });
    }
  };

  const activeChatMessages = messages[activeChat.id] || [];

  const memoizedMessageList = useMemo(() => (
    <MessageList messages={activeChatMessages} currentUsername={username} />
  ), [activeChatMessages, username]);

  return (
    <ChatContainer aria-label={`Chat room: ${activeChat.name}`}>
      <ChatHeader chatName={activeChat.name} isConnected={isConnected} />
      {!isConnected && reconnectAttempt > 0 && (
        <ReconnectingMessage role="alert" aria-live="assertive">
          Reconnecting... Attempt {reconnectAttempt}
        </ReconnectingMessage>
      )}
      {memoizedMessageList}
      <TypingIndicator typingUsers={typingUsers} />
      <MessageInput onSendMessage={handleSendMessage} onTyping={emitTyping} isConnected={isConnected} />
    </ChatContainer>
  );
}

export default Chat;

