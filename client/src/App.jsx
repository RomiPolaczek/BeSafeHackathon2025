import React, { useState } from 'react';
import { SnackbarProvider } from 'notistack';
import styled from 'styled-components';
import Chat from './components/Chat';
import ChatList from './components/ChatList';
import LoginForm from './components/LoginForm';
import './index.css';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const chats = [
  { id: 1, name: 'General' },
  { id: 2, name: 'Random' },
  { id: 3, name: 'Tech Talk' },
];

function App() {
  const [activeChat, setActiveChat] = useState(chats[0]);
  const [username, setUsername] = useState('');

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleUsernameSubmit = (submittedUsername) => {
    setUsername(submittedUsername);
  };

  return (
    <SnackbarProvider maxSnack={3}>
      {!username ? (
        <LoginForm onSubmit={handleUsernameSubmit} />
      ) : (
        <AppContainer>
          <ChatList chats={chats} activeChat={activeChat} onSelectChat={handleSelectChat} />
          <Chat activeChat={activeChat} username={username} />
        </AppContainer>
      )}
    </SnackbarProvider>
  );
}

export default App;

