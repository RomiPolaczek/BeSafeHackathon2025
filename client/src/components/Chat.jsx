// components/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import io from 'socket.io-client';
import UsernameModal from './UsernameModal';
import MessageList from './MessageList';
import ChatForm from './ChatForm';
import TypingIndicator from './TypingIndicator';
import LastSeen from './LastSeen';

const socket = io('http://localhost:3000');

function Chat() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const [lastSeen, setLastSeen] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const windowActiveRef = useRef(true);

  useEffect(() => {
    socket.on('username set', (confirmedUsername) => {
      setUsername(confirmedUsername);
      enqueueSnackbar(`Welcome, ${confirmedUsername}!`, { variant: 'success' });
    });

    socket.on('user joined', ({ userId, username }) => {
      enqueueSnackbar(`${username} has joined the chat.`, { variant: 'info' });
    });

    socket.on('user disconnected', ({ userId, username }) => {
      enqueueSnackbar(`${username} has left the chat.`, { variant: 'info' });
    });

    socket.on('message history', (history) => {
      setMessages(history);
    });

    socket.on('chat message', (msg) => {
      if (msg.sender !== socket.id) {
        setMessages((prevMessages) => [...prevMessages, msg]);
        if (!windowActiveRef.current) {
          enqueueSnackbar(`${msg.username}: ${msg.message}`, { variant: 'info' });
        }
      }
    });

    socket.on('user typing', ({ userId, username }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: username }));
    });

    socket.on('user stop typing', ({ userId }) => {
      setTypingUsers((prev) => {
        const newTypingUsers = { ...prev };
        delete newTypingUsers[userId];
        return newTypingUsers;
      });
    });

    socket.on('last seen update', ({ userId, username, lastSeen }) => {
      setLastSeen((prev) => ({ ...prev, [userId]: { username, lastSeen } }));
    });

    window.addEventListener('focus', () => { windowActiveRef.current = true; });
    window.addEventListener('blur', () => { windowActiveRef.current = false; });

    return () => {
      socket.off('username set');
      socket.off('user joined');
      socket.off('user disconnected');
      socket.off('message history');
      socket.off('chat message');
      socket.off('user typing');
      socket.off('user stop typing');
      socket.off('last seen update');
    };
  }, [enqueueSnackbar]);

  const handleSetUsername = (newUsername) => {
    socket.emit('set username', newUsername);
    setIsModalOpen(false);
  };

  const handleSendMessage = (message, type) => {
    socket.emit('chat message', { message, sender: socket.id, type });
    setMessages((prevMessages) => [...prevMessages, { message, sender: socket.id, type, username, timestamp: new Date() }]);
  };

  const handleTyping = () => {
    socket.emit('typing');
  };

  const handleStopTyping = () => {
    socket.emit('stop typing');
  };

  return (
    <div className="chat-window">
      <h2>Safe Chat</h2>
      <LastSeen lastSeen={lastSeen} />
      <MessageList messages={messages} currentUser={username} />
      <TypingIndicator typingUsers={typingUsers} />
      <ChatForm onSendMessage={handleSendMessage} onTyping={handleTyping} onStopTyping={handleStopTyping} />
      <UsernameModal isOpen={isModalOpen} onSetUsername={handleSetUsername} />
    </div>
  );
}

export default Chat;