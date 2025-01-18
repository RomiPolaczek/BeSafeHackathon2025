import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding-top: 2rem;
`;

const LoginHeading = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 300px;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const Button = styled.button`
  padding: 0.5rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;

  &:hover {
    background-color: #357abd;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  margin-top: 1rem;
  text-decoration: underline;
  
  &:hover {
    color: #357abd;
  }
`;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, signup } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      setError(error.message);
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };

  return (
    <LoginContainer>
      <LoginHeading>{isRegistering ? 'Register' : 'Login'}</LoginHeading>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoComplete="email"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoComplete={isRegistering ? 'new-password' : 'current-password'}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading 
            ? (isRegistering ? 'Creating Account...' : 'Logging in...') 
            : (isRegistering ? 'Create Account' : 'Log In')}
        </Button>
      </Form>
      <ToggleButton type="button" onClick={toggleMode}>
        {isRegistering 
          ? 'Already have an account? Log in' 
          : 'Need an account? Register'}
      </ToggleButton>
    </LoginContainer>
  );
}

export default Login;

