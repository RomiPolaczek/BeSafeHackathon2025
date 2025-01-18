import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../assets/styles/theme';

const InputContainer = styled.form`
  display: flex;
  padding: ${theme.spacing.medium};
  border-top: 1px solid ${theme.colors.border};
`;

const Input = styled.input`
  flex: 1;
  padding: ${theme.spacing.small};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.fontSizes.medium};
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const SendButton = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  padding: ${theme.spacing.small} ${theme.spacing.medium};
  margin-left: ${theme.spacing.small};
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;
  font-size: ${theme.fontSizes.medium};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${theme.colors.primary}dd;
  }

  &:disabled {
    background-color: ${theme.colors.lightText};
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.small};
`;

const MessageInput = ({ onSendMessage, onTyping, isConnected, onShowAllMessages }) => {
  const [inputMessage, setInputMessage] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && isConnected) {
      try {
        onSendMessage(inputMessage);
        setInputMessage('');
        onTyping(false);
      } catch (error) {
          console.error('Error checking message:', error);
        }
    }
  };

  const handleTyping = useCallback(() => {
    if (isConnected) {
      onTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 3000);
    }
  }, [onTyping, isConnected]);

  return (
    <InputContainer onSubmit={handleSubmit}>
      <Input
        type="text"
        value={inputMessage}
        onChange={(e) => {
          setInputMessage(e.target.value);
          handleTyping();
        }}
        placeholder={isConnected ? "Type a message..." : "Connecting..."}
        disabled={!isConnected}
        aria-label="Type a message"
      />
      <ButtonContainer>
        <SendButton 
          type="submit" 
          disabled={!inputMessage.trim() || !isConnected}
          aria-label="Send message"
        >
          Send
        </SendButton>
        <SendButton 
          type="button" 
          onClick={onShowAllMessages}
          disabled={!isConnected}
          aria-label="Show all messages"
        >
          Show All
        </SendButton>
      </ButtonContainer>
    </InputContainer>
  );
};

export default MessageInput;

