import React from 'react';
import styled from 'styled-components';
import { theme } from '../../assets/styles/theme';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${theme.colors.background};
  color: ${theme.colors.error};
  padding: ${theme.spacing.large};
  text-align: center;
`;

const ErrorHeading = styled.h1`
  font-size: ${theme.fontSizes.xlarge};
  margin-bottom: ${theme.spacing.medium};
`;

const ErrorMessage = styled.p`
  font-size: ${theme.fontSizes.medium};
  margin-bottom: ${theme.spacing.large};
`;

const ReloadButton = styled.button`
  padding: ${theme.spacing.small} ${theme.spacing.medium};
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  font-size: ${theme.fontSizes.medium};

  &:hover {
    background-color: ${theme.colors.primary}dd;
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorHeading>Oops! Something went wrong.</ErrorHeading>
          <ErrorMessage>
            {this.state.error && this.state.error.toString()}
          </ErrorMessage>
          <ReloadButton onClick={() => window.location.reload()}>
            Reload Page
          </ReloadButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

