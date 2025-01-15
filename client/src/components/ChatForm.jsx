// components/ChatForm.js
import React, { useState, useRef } from 'react';

function ChatForm({ onSendMessage, onTyping, onStopTyping }) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      onStopTyping();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    onTyping();
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(onStopTyping, 1000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target.result;
        onSendMessage(fileData, file.type.startsWith('image/') ? 'image' : 'file');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-form">
      <input
        type="text"
        value={message}
        onChange={handleInput}
        placeholder="Type a message..."
        aria-label="Type a message"
      />
      <label htmlFor="file-input" className="file-label">📎</label>
      <input
        type="file"
        id="file-input"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <button type="submit">Send</button>
    </form>
  );
}

export default ChatForm;