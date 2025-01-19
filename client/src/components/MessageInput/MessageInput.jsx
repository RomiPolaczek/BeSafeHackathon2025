import React, { useState } from 'react';
import styles from './MessageInput.module.css';

const MessageInput = ({ onSendMessage, onTyping, isConnected, onShowAllMessages }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    onTyping(true);
  };

  return (
    <form className={styles.inputForm} onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={handleChange}
        placeholder="Type a message..."
        className={styles.messageInput}
        disabled={!isConnected}
      />
      <button type="submit" className={styles.sendButton} disabled={!isConnected || !message.trim()}>
        Send
      </button>
      <button type="button" className={styles.showAllButton} onClick={onShowAllMessages}>
        Show All
      </button>
    </form>
  );
};

export default MessageInput;

