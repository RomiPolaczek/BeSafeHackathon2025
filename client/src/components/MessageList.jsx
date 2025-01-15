import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../assets/styles/theme';
import { Check, CheckCheck, AlertTriangle, Info, Smile } from 'lucide-react';

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

const ReadStatus = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: ${theme.spacing.small};
  font-size: ${theme.fontSizes.small};
  color: ${props => props.$isSent ? theme.colors.white : theme.colors.lightText};
`;

const PriorityIndicator = styled.span`
  font-size: ${theme.fontSizes.small};
  font-weight: bold;
  margin-right: ${theme.spacing.small};
  color: ${props => {
    switch (props.$priority) {
      case 'high':
        return theme.colors.error;
      case 'low':
        return theme.colors.success;
      default:
        return 'inherit';
    }
  }};
`;

const PriorityIcon = styled.span`
  margin-right: ${theme.spacing.small};
`;

const ReactionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const Reaction = styled.button`
  background-color: ${theme.colors.secondary};
  border: none;
  border-radius: ${theme.borderRadius.small};
  padding: 2px 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  font-size: ${theme.fontSizes.small};

  &:hover {
    background-color: ${theme.colors.secondary}dd;
  }
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

const MessageList = ({ messages, user, onReact, setUnreadCount, updateTabNotification, markMessageAsRead }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark displayed messages as read
    if (markMessageAsRead && Array.isArray(messages)) {
      messages.forEach(msg => {
        if (msg.username !== user.username && !msg.read && msg.id) {
          markMessageAsRead(msg.id);
        }
      });
    }

    // Reset unread count when messages are viewed
    setUnreadCount(0);
    updateTabNotification(0);
  }, [messages, user.username, markMessageAsRead, setUnreadCount, updateTabNotification]);

  // Ensure messages is an array before filtering
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Remove duplicate messages based on content and timestamp
  const uniqueMessages = safeMessages.filter((message, index, self) =>
    index === self.findIndex((m) => (
      m.message === message.message &&
      m.timestamp === message.timestamp &&
      m.username === message.username
    ))
  );

  const renderMessage = (msg, index) => {
    const isSentByCurrentUser = msg.username === user.username;
    const time = formatTime(msg.timestamp);

    const getPriorityIcon = (priority) => {
      switch (priority) {
        case 'high':
          return <AlertTriangle size={16} color={theme.colors.error} />;
        case 'low':
          return <Info size={16} color={theme.colors.success} />;
        default:
          return null;
      }
    };

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
          <PriorityIcon>{getPriorityIcon(msg.priority)}</PriorityIcon>
          {msg.message}
          <Timestamp 
            $isSent={isSentByCurrentUser}
            dateTime={msg.timestamp}
          >
            {time}
          </Timestamp>
          {isSentByCurrentUser && (
            <ReadStatus $isSent={isSentByCurrentUser}>
              {msg.read ? <CheckCheck size={16} /> : <Check size={16} />}
            </ReadStatus>
          )}
        </MessageContent>
        <ReactionContainer>
          {Object.entries(msg.reactions || {}).map(([emoji, users]) => (
            <Reaction key={emoji} onClick={() => onReact(msg.id, emoji)}>
              {emoji} {users.length}
            </Reaction>
          ))}
          <Reaction onClick={() => onReact(msg.id, '👍')}>
            <Smile size={16} />
          </Reaction>
        </ReactionContainer>
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

