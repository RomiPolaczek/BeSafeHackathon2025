import React from 'react';
import styled from 'styled-components';

const ChatListContainer = styled.div`
  width: 250px;
  background-color: #f0f0f0;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid #ccc;
`;

const ChatItem = styled.div`
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e0e0e0;
  }

  ${props => props.$active && `
    background-color: #007bff;
    color: white;

    &:hover {
      background-color: #0056b3;
    }
  `}
`;

const ChatList = ({ chats, activeChat, onSelectChat }) => {
  return (
    <ChatListContainer>
      {chats.map(chat => (
        <ChatItem
          key={chat.id}
          $active={activeChat && activeChat.id === chat.id}
          onClick={() => onSelectChat(chat)}
        >
          {chat.name}
        </ChatItem>
      ))}
    </ChatListContainer>
  );
};

export default ChatList;

