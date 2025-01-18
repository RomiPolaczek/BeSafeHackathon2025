import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Send, Paperclip } from 'lucide-react';
import { theme } from '../assets/styles/theme';

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.sm};
`;

const TextInput = styled.input`
  flex: 1;
  border: none;
  font-size: ${theme.fontSizes.medium};
  padding: ${theme.spacing.sm};
  &:focus {
    outline: none;
  }
`;

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.primary};
  font-size: ${theme.fontSizes.large};
  padding: ${theme.spacing.sm};
  transition: color ${theme.transitions.default};

  &:hover {
    color: ${theme.colors.secondary};
  }

  &:disabled {
    color: ${theme.colors.lightText};
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  display: none;
`;

function MessageInput({ onSendMessage, onTyping, isConnected }) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || file) {
      onSendMessage(message, file);
      setMessage('');
      setFile(null);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <InputContainer onSubmit={handleSubmit}>
      <Button type="button" onClick={() => fileInputRef.current.click()}>
        <Paperclip />
      </Button>
      <FileInput
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
      />
      <TextInput
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          onTyping();
        }}
        placeholder="Type a message..."
        disabled={!isConnected}
      />
      <Button type="submit" disabled={!isConnected || (!message.trim() && !file)}>
        <Send />
      </Button>
    </InputContainer>
  );
}

export default MessageInput;

