import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../assets/styles/theme';

const LoginContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${theme.colors.background};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.medium};
  width: 300px;
  padding: ${theme.spacing.large};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.medium};
`;

const Input = styled.input`
  padding: ${theme.spacing.small};
  font-size: ${theme.fontSizes.medium};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};

  &:focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Button = styled.button`
  padding: ${theme.spacing.small} ${theme.spacing.medium};
  font-size: ${theme.fontSizes.medium};
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${theme.colors.primary}dd;
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    background-color: ${theme.colors.lightText};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: ${theme.colors.error};
  font-size: ${theme.fontSizes.small};
`;

const LoginForm = ({ onSubmit, existingUsers }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      setIsSubmitting(false);
    } else if (trimmedUsername.length > 20) {
      setError('Username must be no more than 20 characters long');
      setIsSubmitting(false);
    } else if (existingUsers.some(user => user.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      setError('Username already exists');
      setIsSubmitting(false);
    } else {
      setError('');
      // Simulate a delay to show loading state
      setTimeout(() => {
        setIsSubmitting(false);
        onSubmit(trimmedUsername);
      }, 1000);
    }
  };

  return (
    <LoginContainer>
      <Form onSubmit={handleSubmit}>
        <h1>Enter your name to join the chat</h1>
        <Input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Your name (3-20 characters)"
          required
          aria-label="Enter your username"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "username-error" : undefined}
          disabled={isSubmitting}
        />
        {error && <ErrorMessage id="username-error" role="alert">{error}</ErrorMessage>}
        <Button type="submit" disabled={isSubmitting || username.length < 3}>
          {isSubmitting ? 'Joining...' : 'Join Chat'}
        </Button>
      </Form>
    </LoginContainer>
  );
};

export default LoginForm;

