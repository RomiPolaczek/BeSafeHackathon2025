import React, { useState, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import io from 'socket.io-client';
import '../styles/Chat.css';

const socket = io('http://localhost:4000');

function Chat() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const [lastSeen, setLastSeen] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
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
      enqueueSnackbar(`${username} has left the chat.`, { variant: 'warning' });
    });

    socket.on('message history', (history) => {
      setMessages(history);
    });

    socket.on('chat message', (msg) => {
      if (msg.sender !== socket.id) {
        setMessages(prev => [...prev, msg]);
        if (!windowActiveRef.current) {
          enqueueSnackbar(`${msg.username}: ${msg.message}`, { variant: 'info' });
        }
      }
    });

    socket.on('typing', ({ userId, username }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: username }));
    });

    socket.on('stop typing', ({ userId }) => {
      setTypingUsers(prev => {
        const newTypingUsers = { ...prev };
        delete newTypingUsers[userId];
        return newTypingUsers;
      });
    });

    socket.on('last seen update', ({ userId, username, lastSeen }) => {
      setLastSeen(prev => ({ ...prev, [userId]: { username, lastSeen } }));
    });

    window.addEventListener('focus', () => { windowActiveRef.current = true; });
    window.addEventListener('blur', () => { windowActiveRef.current = false; });

    return () => {
      socket.off('username set');
      socket.off('user joined');
      socket.off('user disconnected');
      socket.off('message history');
      socket.off('chat message');
      socket.off('typing');
      socket.off('stop typing');
      socket.off('last seen update');
    };
  }, [enqueueSnackbar]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('set username', username);
      setIsModalOpen(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      socket.emit('chat message', { 
        message: inputMessage, 
        sender: socket.id, 
        type: 'text' 
      });
      setMessages(prev => [...prev, { 
        message: inputMessage, 
        sender: socket.id, 
        type: 'text',
        username,
        timestamp: new Date()
      }]);
      setInputMessage('');
      socket.emit('stop typing');
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    socket.emit('typing');
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('stop typing');
    }, 1000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target?.result;
        if (fileData) {
          socket.emit('chat message', { 
            message: fileData, 
            sender: socket.id, 
            type: file.type.startsWith('image/') ? 'image' : 'file' 
          });
          setMessages(prev => [...prev, { 
            message: fileData, 
            sender: socket.id, 
            type: file.type.startsWith('image/') ? 'image' : 'file',
            username,
            timestamp: new Date()
          }]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isModalOpen) {
    return (
      <div className="username-modal">
        <div className="modal-content">
          <h2>Choose a Username</h2>
          <form onSubmit={handleSetUsername}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              aria-label="Enter your username"
            />
            <button type="submit">Join Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <h2>Safe Chat</h2>
      <div className="last-seen">
        {Object.entries(lastSeen).map(([userId, { username, lastSeen }]) => (
          <div key={userId}>
            {username} last seen: {new Date(lastSeen).toLocaleTimeString()}
          </div>
        ))}
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.sender === socket.id ? 'sent' : 'received'}`}
          >
            <span style={{ fontWeight: 'bold' }}>{msg.username}: </span>
            {msg.type === 'text' && msg.message}
            {msg.type === 'image' && (
              <img src={msg.message || "/placeholder.svg"} alt="Shared image" className="file-preview" />
            )}
            {msg.type === 'file' && (
              <a href={msg.message} download>Download File</a>
            )}
            <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '8px' }}>
              ({new Date(msg.timestamp).toLocaleTimeString()})
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="typing-indicator">
        {Object.values(typingUsers).length > 0 && (
          `${Object.values(typingUsers).join(', ')} ${
            Object.values(typingUsers).length === 1 ? 'is' : 'are'
          } typing...`
        )}
      </div>
      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          aria-label="Type a message"
        />
        <label htmlFor="file-input" className="file-label">📎</label>
        <input
          type="file"
          id="file-input"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;

