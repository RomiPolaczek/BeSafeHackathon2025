import React from 'react';
import styled from 'styled-components';
import { theme } from '../assets/styles/theme';
import Tooltip from './Tooltip';
import ChatIcon from '../assets/icons/ChatIcon';

const Header = styled.header`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  padding: ${theme.spacing.medium};
  text-align: center;
  font-size: ${theme.fontSizes.large};
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ConnectionStatus = styled.span`
  font-size: ${theme.fontSizes.small};
  padding: ${theme.spacing.small} ${theme.spacing.medium};
  border-radius: ${theme.borderRadius.large};
  background-color: ${props => props.$isConnected ? theme.colors.success : theme.colors.error};
  transition: background-color 0.3s ease;
`;

const ChatHeader = ({ chatName, isConnected }) => (
  <Header>
    <ChatIcon width="24" height="24" />
    <h1>{chatName}</h1>
    <Tooltip text={isConnected ? 'Connected to server' : 'Attempting to reconnect...'}>
      <ConnectionStatus 
        $isConnected={isConnected}
        aria-live="polite"
        aria-label={`Connection status: ${isConnected ? 'Connected' : 'Disconnected'}`}
      >
        {isConnected ? 'Connected' : 'Disconnected'}
      </ConnectionStatus>
    </Tooltip>
  </Header>
);

export default ChatHeader;

