import React from 'react';
import styles from './ChatHeader.module.css';

const ChatHeader = ({ chatName, isConnected }) => (
  <header className={styles.header}>
    <h2 className={styles.chatTitle}>{chatName}</h2>
    <span className={`${styles.connectionStatus} ${isConnected ? styles.connected : styles.disconnected}`}>
      {isConnected ? 'Connected' : 'Disconnected'}
    </span>
  </header>
);

export default ChatHeader;

