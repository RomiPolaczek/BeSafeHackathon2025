import React, { useState, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import io from 'socket.io-client';
import styled from 'styled-components';
import TypingIndicator from './TypingIndicator';

// Make sure this URL matches your server's address and port
const socket = io('http://localhost:4000', {
  transports: ['websocket', 'polling']
});

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  background-color: var(--primary-color);
  color: white;
  padding: 1rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-direction: ${props => props.isSent ? 'row-reverse' : 'row'};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin: ${props => props.isSent ? '0 0 0 10px' : '0 10px 0 0'};
`;

const MessageContent = styled.div`
  background-color: ${props => props.isSent ? 'var(--primary-color)' : 'var(--secondary-color)'};
  color: ${props => props.isSent ? 'white' : 'var(--text-color)'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  max-width: 70%;
  word-wrap: break-word;
`;

const Username = styled.span`
  font-weight: 600;
  margin-right: 0.5rem;
`;

const Timestamp = styled.span`
  font-size: 0.8rem;
  color: var(--light-text-color);
  display: block;
  margin-top: 0.2rem;
`;

const InputContainer = styled.form`
  display: flex;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
`;

const SendButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3a7bc8;
  }
`;

const UsernameModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
`;

const UsernameInput = styled(Input)`
  margin-bottom: 1rem;
`;

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('chat message', (msg) => {
      console.log('Received message:', msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
      enqueueSnackbar(`${msg.username}: ${msg.message}`, { variant: 'info' });
    });

    socket.on('user joined', ({ username }) => {
      console.log('User joined:', username);
      enqueueSnackbar(`${username} has joined the chat.`, { variant: 'success' });
    });

    socket.on('user disconnected', ({ username }) => {
      console.log('User disconnected:', username);
      enqueueSnackbar(`${username} has left the chat.`, { variant: 'warning' });
    });

    socket.on('typing', ({ userId, username }) => {
      console.log('User typing:', username);
      setTypingUsers(prev => ({ ...prev, [userId]: username }));
    });

    socket.on('stop typing', ({ userId }) => {
      console.log('User stopped typing:', userId);
      setTypingUsers(prev => {
        const newTypingUsers = { ...prev };
        delete newTypingUsers[userId];
        return newTypingUsers;
      });
    });

    return () => {
      socket.off('connect');
      socket.off('chat message');
      socket.off('user joined');
      socket.off('user disconnected');
      socket.off('typing');
      socket.off('stop typing');
    };
  }, [enqueueSnackbar]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage && username) {
      console.log('Sending message:', inputMessage);
      socket.emit('chat message', { message: inputMessage, username });
      setInputMessage('');
      socket.emit('stop typing', { username });
    }
  };

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      console.log('Setting username:', username);
      socket.emit('set username', username);
      setIsModalOpen(false);
    }
  };

  const handleTyping = () => {
    console.log('User typing');
    socket.emit('typing', { username });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log('User stopped typing');
      socket.emit('stop typing', { username });
    }, 3000);
  };

  const getAvatarColor = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  if (isModalOpen) {
    return (
      <UsernameModal>
        <ModalContent>
          <h2>Enter your username</h2>
          <form onSubmit={handleSetUsername}>
            <UsernameInput
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
            <SendButton type="submit">Join Chat</SendButton>
          </form>
        </ModalContent>
      </UsernameModal>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>Safe Chat</ChatHeader>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <Message key={index} isSent={msg.username === username}>
            <Avatar color={getAvatarColor(msg.username)}>
              {msg.username.charAt(0).toUpperCase()}
            </Avatar>
            <MessageContent isSent={msg.username === username}>
              <Username>{msg.username}:</Username>
              {msg.message}
              <Timestamp>{new Date(msg.timestamp).toLocaleTimeString()}</Timestamp>
            </MessageContent>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <TypingIndicator typingUsers={typingUsers} />
      <InputContainer onSubmit={handleSendMessage}>
        <Input
          type="text"
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
        />
        <SendButton type="submit">Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
}

export default Chat;

