import React, { useState, useEffect } from 'react';
import { SnackbarProvider } from 'notistack';
import styled from 'styled-components';
import Chat from './components/Chat';
import ChatList from './components/ChatList';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import { usePushNotifications } from './hooks/usePushNotifications';
import useLocalStorage from './hooks/useLocalStorage';
import './index.css';
import { ThemeProvider } from 'styled-components';
import { theme } from './assets/styles/theme';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const NotificationButton = styled.button`
  position: fixed;
  top: 10px;
  right: 10px;
  padding: ${({ theme }) => theme.spacing.small};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}dd`};
  }
`;

function App() {
  const [activeChat, setActiveChat] = useState(null);
  const [user, setUser] = useLocalStorage('user', null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chats, setChats] = useLocalStorage('chats', [
    { id: 1, name: 'General' },
    { id: 2, name: 'Random' },
    { id: 3, name: 'Tech Talk' },
  ]);
  const { isSubscribed, subscribeUser, unsubscribeUser } = usePushNotifications(user?.username);

  const updateTabNotification = (count) => {
    document.title = count > 0 ? `(${count}) New Messages - Chat` : 'Chat';
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setUnreadCount(0);
    updateTabNotification(0);
  };

  const handleCreateChat = (chatName) => {
    const newChat = { id: Date.now(), name: chatName };
    setChats([...chats, newChat]);
    setActiveChat(newChat);
  };

  const handleUsernameSubmit = (username) => {
    setUser({ username, avatar: 'https://via.placeholder.com/100', statusMessage: 'Available' });
  };

  const handleUpdateProfile = (updatedProfile) => {
    setUser({ ...user, ...updatedProfile });
  };

  const handleNotificationToggle = () => {
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        {!user ? (
          <LoginForm onSubmit={handleUsernameSubmit} />
        ) : (
          <AppContainer>
            <ChatList 
              chats={chats} 
              activeChat={activeChat} 
              onSelectChat={handleSelectChat}
              onCreateChat={handleCreateChat}
            />
            {activeChat ? (
              <Chat 
                activeChat={activeChat} 
                user={user} 
                setUnreadCount={setUnreadCount} 
                updateTabNotification={updateTabNotification}
              />
            ) : (
              <UserProfile user={user} onUpdateProfile={handleUpdateProfile} />
            )}
            <NotificationButton onClick={handleNotificationToggle}>
              {isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
            </NotificationButton>
          </AppContainer>
        )}
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;

