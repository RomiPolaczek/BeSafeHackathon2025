import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const WelcomeContainer = styled.div`
  background-color: #f0f8ff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WelcomeText = styled.h2`
  color: #2613a4;
  font-size: 24px;
  margin: 0;
`;

const WelcomeMessage = () => {
  const { currentUser } = useAuth();

  return (
    <WelcomeContainer>
      <WelcomeText>Hi {currentUser.username}, welcome back!</WelcomeText>
    </WelcomeContainer>
  );
};

export default WelcomeMessage;

