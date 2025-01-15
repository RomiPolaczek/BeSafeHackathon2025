import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import io from 'socket.io-client';

const socket = io("http://localhost:4000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      enqueueSnackbar(`${msg.username}: ${msg.message}`, { variant: 'info' });
    });

    socket.on('user joined', ({ username }) => {
      enqueueSnackbar(`${username} has joined the chat.`, { variant: 'success' });
    });

    socket.on('user disconnected', ({ username }) => {
      enqueueSnackbar(`${username} has left the chat.`, { variant: 'warning' });
    });

    return () => {
      socket.off('chat message');
      socket.off('user joined');
      socket.off('user disconnected');
    };
  }, [enqueueSnackbar]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage && username) {
      socket.emit('chat message', { message: inputMessage, username });
      setInputMessage('');
    }
  };

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('set username', username);
      setIsModalOpen(false);
    }
  };

  if (isModalOpen) {
    return (
      <div className="username-modal">
        <form onSubmit={handleSetUsername}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <button type="submit">Join Chat</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <h2>Safe Chat</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;

