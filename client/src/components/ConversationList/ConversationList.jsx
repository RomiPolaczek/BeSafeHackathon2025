import React from 'react';
import styles from './ConversationList.module.css';
import { theme } from '../../assets/styles/theme';

const ConversationList = ({ conversations, onSelectConversation, selectedConversation }) => {
  return (
    <div className={styles.conversationList}>
      <h2 className={styles.header}>Conversations</h2>
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`${styles.conversationItem} ${selectedConversation?.id === conversation.id ? styles.selected : ''}`}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className={styles.avatar}>{conversation.username[0].toUpperCase()}</div>
          <div className={styles.conversationInfo}>
            <div className={styles.username}>{conversation.username}</div>
            <div className={styles.lastMessage}>{conversation.lastMessage}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;

