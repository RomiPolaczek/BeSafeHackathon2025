import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.medium};
  background-color: ${theme.colors.background};
`;

const Message = styled.article`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.medium};
  flex-direction: ${props => props.$isSent ? 'row-reverse' : 'row'};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  font-weight: bold;
  margin: ${props => props.$isSent ? `0 0 0 ${theme.spacing.small}` : `0 ${theme.spacing.small} 0 0`};
  text-transform: uppercase;
`;

const MessageContent = styled.div`
  background-color: ${props => props.$isSent ? theme.colors.primary : theme.colors.secondary};
  color: ${props => props.$isSent ? theme.colors.white : theme.colors.text};
  padding: ${theme.spacing.small} ${theme.spacing.medium};
  border-radius: ${theme.borderRadius.large};
  max-width: 70%;
  word-wrap: break-word;
  box-shadow: ${theme.shadows.small};
`;

const Username = styled.span`
  font-weight: 600;
  margin-right: ${theme.spacing.small};
  text-transform: capitalize;
`;

const Timestamp = styled.time`
  font-size: ${theme.fontSizes.small};
  color: ${props => props.$isSent ? theme.colors.white : theme.colors.lightText};
  opacity: 0.8;
  display: block;
  margin-top: ${theme.spacing.small};
`;

const getAvatarColor = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

const MessageList = ({ messages, currentUsername }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Remove duplicate messages based on content and timestamp
  const uniqueMessages = messages.filter((message, index, self) =>
    index === self.findIndex((m) => (
      m.message === message.message &&
      m.timestamp === message.timestamp &&
      m.username === message.username
    ))
  );

  const renderMessage = (msg, index) => {
    const isSentByCurrentUser = msg.username === currentUsername;
    const time = formatTime(msg.timestamp);

    return (
      <Message key={`${msg.timestamp}-${index}`} $isSent={isSentByCurrentUser}>
        <Avatar 
          color={getAvatarColor(msg.username)} 
          $isSent={isSentByCurrentUser}
          aria-hidden="true"
        >
          {msg.username.charAt(0)}
        </Avatar>
        <MessageContent $isSent={isSentByCurrentUser}>
          <Username>{msg.username}</Username>
          {msg.message}
          <Timestamp 
            $isSent={isSentByCurrentUser}
            dateTime={msg.timestamp}
          >
            {time}
          </Timestamp>
        </MessageContent>
      </Message>
    );
  };

  return (
    <MessagesContainer>
      {uniqueMessages.map(renderMessage)}
      <div ref={messagesEndRef} />
    </MessagesContainer>
  );
};

export default MessageList;

