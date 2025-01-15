// components/MessageList.js
import React, { useEffect, useRef } from 'react';

function MessageList({ messages, currentUser }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="chat-messages" id="messages">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.sender === currentUser ? 'sent' : 'received'}`}>
          <span className="username">{msg.username}: </span>
          {msg.type === 'text' && msg.message}
          {msg.type === 'image' && <img src={msg.message || "/placeholder.svg"} alt="Shared image" className="file-preview" />}
          {msg.type === 'file' && <a href={msg.message} download>Download File</a>}
          <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;