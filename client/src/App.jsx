import React, { useState, useEffect } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import styled from 'styled-components';
import Chat from './components/Chat.jsx';
import ChatList from './components/ChatList.jsx';
import UserProfile from './components/UserProfile.jsx';
import { usePushNotifications } from './hooks/usePushNotifications';
import useLocalStorage from './hooks/useLocalStorage';
import './index.css';
import { ThemeProvider } from 'styled-components';
import { theme } from './assets/styles/theme';
import { auth, firestore } from './firebaseInit';
import { AuthProvider } from './contexts/AuthContext';

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

const UserSelector = styled.select`
  margin-right: 10px;
  padding: 5px;
`;

function App() {
  const [activeChat, setActiveChat] = useState(null);
  const [users, setUsers] = useLocalStorage('users', [
    { id: 1, username: 'Sarah', avatar: 'https://via.placeholder.com/100', statusMessage: 'Available' }
  ]);
  const [currentUser, setCurrentUser] = useState({ id: 1, username: 'DefaultUser', avatar: 'https://via.placeholder.com/100', statusMessage: 'Available' });
  const [unreadCount, setUnreadCount] = useState(0);
  const [chats, setChats] = useLocalStorage('chats', [
    { id: 1, name: 'General' },
    { id: 2, name: 'Random' },
    { id: 3, name: 'Tech Talk' },
  ]);
  const { isSubscribed, subscribeUser, unsubscribeUser } = usePushNotifications(currentUser?.username);

  const updateTabNotification = (count) => {
    document.title = count > 0 ? `(${count}) New Messages - Chat` : 'Chat';
  };

  useEffect(() => {
    console.log('App component mounted');
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
          console.error('Service Worker registration failed:', error);
        });
    }

    try {
      console.log('Firebase app accessed in App component:', auth.currentUser);
    } catch (error) {
      console.error('Error accessing Firebase in App component:', error);
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

  const handleUpdateProfile = (updatedProfile) => {
    setCurrentUser({ ...currentUser, ...updatedProfile });
    setUsers(users.map(user => user.id === currentUser.id ? { ...user, ...updatedProfile } : user));
  };

  const handleNotificationToggle = () => {
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      // The subscription is now handled automatically in the hook
      enqueueSnackbar('Push notifications enabled', { variant: 'success' });
    }
  };

  const handleUserChange = (event) => {
    const selectedUserId = parseInt(event.target.value);
    const selectedUser = users.find(user => user.id === selectedUserId);
    setCurrentUser(selectedUser);
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <AppContainer>
            <ChatList 
              chats={chats} 
              activeChat={activeChat} 
              onSelectChat={handleSelectChat}
              onCreateChat={handleCreateChat}
            />
            {activeChat ? (
              <>
                <UserSelector onChange={handleUserChange} value={currentUser.id}>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </UserSelector>
                <Chat 
                  activeChat={activeChat} 
                  user={currentUser} 
                  setUnreadCount={setUnreadCount} 
                  updateTabNotification={updateTabNotification}
                />
              </>
            ) : (
              <UserProfile user={currentUser} onUpdateProfile={handleUpdateProfile} />
            )}
            <NotificationButton onClick={handleNotificationToggle}>
              {isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
            </NotificationButton>
          </AppContainer>
        </SnackbarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

