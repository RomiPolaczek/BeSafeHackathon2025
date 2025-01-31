import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { functions } from '../firebaseInit';

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export function useSocket(username, activeChat, onReceiveMessage, onReceiveMessageHistory) {
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
      console.log(`Socket connected for user: ${username}`);
      setIsConnected(true);
      setReconnectAttempt(0);
      socket.emit('join chat', { username, chatId: activeChat.id });
    }

    function onDisconnect(reason) {
      console.log(`Socket disconnected for user: ${username}. Reason: ${reason}`);
      setIsConnected(false);
    }

    function onConnectError(error) {
      console.error(`Connection error for user: ${username}. Error:`, error);
      const delay = Math.min(INITIAL_RECONNECT_DELAY * (2 ** reconnectAttempt), MAX_RECONNECT_DELAY);
      setTimeout(() => {
        setReconnectAttempt(prev => prev + 1);
        connect();
      }, delay);
    }

    function onChatMessage(msg) {
      console.log(`Received chat message for user: ${username}`, msg);
      onReceiveMessage(msg);
    }

    function onOfflineMessages(messages) {
      console.log(`Received offline messages for user: ${username}`, messages);
      messages.forEach(onReceiveMessage);
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

    function onMessageUpdated(updatedMessage) {
      onReceiveMessage(updatedMessage);
    }

    function onMessageHistory(history) {
      console.log(`Received message history for chat: ${activeChat.id}`, history);
      onReceiveMessageHistory(history);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('chat message', onChatMessage);
    socket.on('offline messages', onOfflineMessages);
    socket.on('typing', onTyping);
    socket.on('stop typing', onStopTyping);
    socket.on('message updated', onMessageUpdated);
    socket.on('message history', onMessageHistory);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('chat message', onChatMessage);
      socket.off('offline messages', onOfflineMessages);
      socket.off('typing', onTyping);
      socket.off('stop typing', onStopTyping);
      socket.off('message updated', onMessageUpdated);
      socket.off('message history', onMessageHistory);
    };
  }, [socket, username, activeChat, onReceiveMessage, onReceiveMessageHistory, connect, reconnectAttempt]);

  const sendMessage = useCallback((message, recipient, priority = 'normal') => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Not connected to server'));
        return;
      }
      if (message.trim() && username) {
        const newMessage = {
          message: message.trim(),
          username,
          recipient,
          chatId: activeChat.id,
          timestamp: new Date().toISOString(),
          priority
        };
        console.log('Emitting chat message:', newMessage);
        socket.emit('chat message', newMessage, (response) => {
          if (response) {
            console.log('Message sent successfully:', response);
            resolve(response);
          } else {
            console.error('Failed to send message: No response from server');
            reject(new Error('Failed to send message'));
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

  const markMessageAsRead = useCallback((messageId) => {
    if (socket && socket.connected) {
      socket.emit('message read', { messageId, chatId: activeChat.id });
    }
  }, [socket, activeChat]);

  return {
    isConnected,
    typingUsers,
    sendMessage,
    emitTyping,
    reconnectAttempt,
    markMessageAsRead,
    socket
  };
}

