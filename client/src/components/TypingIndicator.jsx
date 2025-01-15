import React from 'react';
import styled from 'styled-components';

const TypingIndicatorContainer = styled.div`
  padding: 0.5rem 1rem;
  font-style: italic;
  color: var(--light-text-color);
`;

const TypingIndicator = ({ typingUsers }) => {
  if (Object.keys(typingUsers).length === 0) return null;

  const typingUsernames = Object.values(typingUsers).join(', ');
  return (
    <TypingIndicatorContainer>
      {typingUsernames} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
    </TypingIndicatorContainer>
  );
};

export default TypingIndicator;

