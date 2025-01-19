import React from 'react';
import styles from './MessageList.module.css';

const MessageList = ({ messages, user, setUnreadCount, markMessageAsRead }) => {
  return (
    <div className={styles.messageList}>
      {messages.map((msg, index) => (
        <div key={msg.id || index} className={`${styles.message} ${msg.username === user?.displayName ? styles.sent : styles.received}`}>
          <span className={styles.username}>{msg.username}</span>
          <p className={styles.messageText}>{msg.text}</p>
          <span className={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;

