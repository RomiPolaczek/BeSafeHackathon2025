import React, { forwardRef } from 'react';
import styles from './MessageList.module.css';

const MessageList = forwardRef(({ messages, currentUser }, ref) => {
  return (
    <div className={styles.messageList} ref={ref}>
      {messages.map((message, index) => (
        <div
          key={message.id || index}
          className={`${styles.messageBubble} ${
            message.senderId === currentUser.id ? styles.sent : styles.received
          }`}
        >
          {message.type === 'image' ? (
            <div className={styles.imageContainer}>
              <img 
                src={message.content || "/placeholder.svg"} 
                alt="Shared content" 
                className={styles.messageImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.svg';
                }}
              />
            </div>
          ) : (
            message.content
          )}
          <span className={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
});

export default MessageList;

