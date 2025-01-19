import React from 'react';
import styles from './TypingIndicator.module.css';

const TypingIndicator = ({ typingUsers }) => {
  const typingUsernames = Object.values(typingUsers);
  
  if (typingUsernames.length === 0) return null;

  let message = '';
  if (typingUsernames.length === 1) {
    message = `${typingUsernames[0]} is typing...`;
  } else if (typingUsernames.length === 2) {
    message = `${typingUsernames[0]} and ${typingUsernames[1]} are typing...`;
  } else {
    message = 'Multiple users are typing...';
  }

  return (
    <div className={styles.typingIndicator}>
      {message}
    </div>
  );
};

export default TypingIndicator;

