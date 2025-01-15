import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { theme } from '../styles/theme';

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export function useSocket(username, activeChat, onReceiveMessage) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const connect = useCallback(() => {
    const newSocket = io('http://localhost:4000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    setSocket(newSocket);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [connect]);

  useEffect(() => {
    console.log('isConnected changed:', isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (!socket) return;

    function onConnect() {
      console.log('Connected to server');
      setIsConnected(true);
      setReconnectAttempt(0);
      socket.emit('join chat', { username, chatId: activeChat.id });
    }

    function onDisconnect(reason) {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
    }

    function onConnectError(error) {
      console.error('Connection error:', error);
      const delay = Math.min(INITIAL_RECONNECT_DELAY * (2 ** reconnectAttempt), MAX_RECONNECT_DELAY);
      setTimeout(() => {
        setReconnectAttempt(prev => prev + 1);
        connect();
      }, delay);
    }

    function onChatMessage(msg) {
      console.log('Received chat message in useSocket:', msg); // Added console log
      console.log('Received chat message:', msg);
      onReceiveMessage(msg);
    }

    function onTyping({ userId, username, chatId }) {
      if (chatId === activeChat.id && userId !== socket.id) {
        setTypingUsers(prev => ({ ...prev, [userId]: username }));
      }
    }

    function onStopTyping({ userId, chatId }) {
      if (chatId === activeChat.id) {
        setTypingUsers(prev => {
          const newTypingUsers = { ...prev };
          delete newTypingUsers[userId];
          return newTypingUsers;
        });
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('chat message', onChatMessage);
    socket.on('typing', onTyping);
    socket.on('stop typing', onStopTyping);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('chat message', onChatMessage);
      socket.off('typing', onTyping);
      socket.off('stop typing', onStopTyping);
    };
  }, [socket, username, activeChat, onReceiveMessage, connect, reconnectAttempt]);

  const sendMessage = useCallback((message) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Not connected to server'));
        return;
      }
      if (message.trim() && username) {
        const newMessage = {
          message: message.trim(),
          username,
          chatId: activeChat.id,
          timestamp: new Date().toISOString()
        };
        console.log('Emitting chat message:', newMessage);
        socket.timeout(5000).emit('chat message', newMessage, (err, confirmedMessage) => {
          if (err) {
            console.error('Error sending message:', err);
            reject(err);
          } else {
            console.log('Message sent successfully:', confirmedMessage);
            resolve(confirmedMessage);
          }
        });
      } else {
        reject(new Error('Invalid message or username'));
      }
    });
  }, [socket, username, activeChat]);

  const emitTyping = useCallback((isTyping = true) => {
    if (socket && socket.connected) {
      if (isTyping) {
        socket.emit('typing', { username, chatId: activeChat.id });
      } else {
        socket.emit('stop typing', { username, chatId: activeChat.id });
      }
    }
  }, [socket, username, activeChat]);

  return {
    isConnected,
    typingUsers,
    sendMessage,
    emitTyping,
    reconnectAttempt
  };
}

