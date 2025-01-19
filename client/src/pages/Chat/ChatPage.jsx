import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import UserSearch from '../../components/UserSearch';
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  margin: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Sidebar = styled.div`
  width: 300px;
  border-right: 1px solid #ddd;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
`;

const ChatHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #ddd;
  background: #f8f9fa;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Message = styled.div`
  max-width: 70%;
  padding: 10px 15px;
  margin: ${props => props.$isSent ? '0 0 0 auto' : '0'};
  border-radius: 15px;
  background-color: ${props => props.$isSent ? '#4a90e2' : '#f0f0f0'};
  color: ${props => props.$isSent ? 'white' : 'black'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-break: break-word;
`;

const InputArea = styled.div`
  padding: 20px;
  border-top: 1px solid #ddd;
  background: #f8f9fa;
  display: flex;
  gap: 10px;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #4a90e2;
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #357abd;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const TypingIndicator = styled.div`
  padding: 10px 20px;
  color: #666;
  font-style: italic;
  font-size: 14px;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 18px;
  padding: 20px;
`;

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messageListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      auth: { token: currentUser.token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('chat message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    newSocket.on('user typing', ({ userId, username }) => {
      if (selectedUser && userId === selectedUser.id) {
        setIsTyping(true);
      }
    });

    newSocket.on('user stop typing', ({ userId }) => {
      if (selectedUser && userId === selectedUser.id) {
        setIsTyping(false);
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [currentUser.token]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    if (selectedUser) {
      try {
        const response = await axios.get(`http://localhost:3001/api/messages?userId=${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
  }, [selectedUser, currentUser.token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      try {
        const messageData = {
          id: Date.now(), // Temporary ID for local state
          content: newMessage.trim(),
          recipientId: selectedUser.id,
          senderId: currentUser.id, // Add sender ID
          type: 'text',
          timestamp: new Date()
        };
        
        // Add message to local state immediately
        setMessages(prevMessages => [...prevMessages, messageData]);
        
        // Emit to socket
        socket.emit('chat message', messageData);
        setNewMessage('');
        socket.emit('stop typing', selectedUser.id);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleTyping = () => {
    if (selectedUser && socket) {
      socket.emit('typing', selectedUser.id);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop typing', selectedUser.id);
      }, 1000);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]);
    setNewMessage('');
    setIsTyping(false);
  };

  return (
    <ChatContainer>
      <Sidebar>
        <UserSearch onSelectUser={handleUserSelect} />
      </Sidebar>
      <ChatArea>
        {selectedUser ? (
          <>
            <ChatHeader>
              <h2>Chat with {selectedUser.username}</h2>
            </ChatHeader>
            <MessageList ref={messageListRef}>
              {messages.map((message, index) => (
                <Message 
                  key={message.id || index} 
                  $isSent={message.senderId === currentUser.id}
                >
                  {message.content}
                </Message>
              ))}
            </MessageList>
            {isTyping && (
              <TypingIndicator>
                {selectedUser.username} is typing...
              </TypingIndicator>
            )}
            <InputArea>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <MessageInput
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onInput={handleTyping}
                  placeholder="Type a message..."
                  autoComplete="off"
                />
                <SendButton type="submit" disabled={!newMessage.trim()}>
                  Send
                </SendButton>
              </form>
            </InputArea>
          </>
        ) : (
          <EmptyState>
            Select a user to start chatting
          </EmptyState>
        )}
      </ChatArea>
    </ChatContainer>
  );
};

export default ChatPage;

