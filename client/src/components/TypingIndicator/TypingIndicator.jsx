import React from 'react';
import styles from './TypingIndicator.module.css';

const TypingIndicator = ({ username }) => (
  <div className={styles.typingIndicator}>
    <span role="img" aria-label="typing">✍️</span> {username} is typing...
  </div>
);

export default TypingIndicator;

