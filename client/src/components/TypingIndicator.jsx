import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../assets/styles/theme';

const TypingIndicatorContainer = styled.div`
  padding: ${theme.spacing.small} ${theme.spacing.medium};
  font-style: italic;
  color: ${theme.colors.lightText};
  display: flex;
  align-items: center;
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
`;

const Dot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${theme.colors.lightText};
  margin: 0 2px;
  animation: ${bounce} 1.4s infinite ease-in-out;
  animation-delay: ${props => props.$delay}s;
`;

const getTypingMessage = (typingUsernames) => {
  if (typingUsernames.length === 0) return null;
  if (typingUsernames.length === 1) return `${typingUsernames[0]} is typing`;
  if (typingUsernames.length === 2) return `${typingUsernames[0]} and ${typingUsernames[1]} are typing`;
  return `${typingUsernames.length} users are typing`;
};

const TypingIndicator = ({ typingUsers }) => {
  const typingUsernames = Object.values(typingUsers);
  const typingMessage = getTypingMessage(typingUsernames);

  if (!typingMessage) return null;

  return (
    <TypingIndicatorContainer aria-live="polite" aria-atomic="true">
      {typingMessage}
      <Dot $delay={0} aria-hidden="true" />
      <Dot $delay={0.2} aria-hidden="true" />
      <Dot $delay={0.4} aria-hidden="true" />
    </TypingIndicatorContainer>
  );
};

export default TypingIndicator;

