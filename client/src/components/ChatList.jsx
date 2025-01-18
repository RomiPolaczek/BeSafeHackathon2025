import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../assets/styles/theme';
import { getFirebase } from '../firebaseInit';
import { firestore } from '../firebaseInit';

const ChatListContainer = styled.div`
  width: 250px;
  background-color: ${theme.colors.background};
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid ${theme.colors.border};
`;

const ChatItem = styled.div`
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid ${theme.colors.border};
  transition: background-color 0.3s;

  &:hover {
    background-color: ${theme.colors.secondary};
  }

  ${props => props.$active && `
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};

    &:hover {
      background-color: ${theme.colors.primary}dd;
    }
  `}
`;

const NewChatForm = styled.form`
  padding: 15px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const NewChatInput = styled.input`
  width: 100%;
  padding: 5px;
  margin-bottom: 5px;
`;

const NewChatButton = styled.button`
  width: 100%;
  padding: 5px;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.primary}dd;
  }
`;

const ChatList = ({ chats, activeChat, onSelectChat, onCreateChat }) => {
  const [newChatName, setNewChatName] = useState('');
  const { firestore } = getFirebase();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newChatName.trim()) {
      onCreateChat(newChatName.trim());
      setNewChatName('');
    }
  };

  return (
    <ChatListContainer>
      <NewChatForm onSubmit={handleSubmit}>
        <NewChatInput
          type="text"
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          placeholder="New chat name"
        />
        <NewChatButton type="submit">Create Chat</NewChatButton>
      </NewChatForm>
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

