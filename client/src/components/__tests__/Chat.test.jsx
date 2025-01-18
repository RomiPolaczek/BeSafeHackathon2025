import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from '../../contexts/AuthContext';
import Chat from '../Chat';

// Mock the Firebase hooks
jest.mock('react-firebase-hooks/firestore', () => ({
  useCollectionData: jest.fn(() => [[], false, null]),
}));

// Mock the custom hooks
jest.mock('../../hooks/useSocket', () => ({
  useSocket: jest.fn(() => ({
    sendMessage: jest.fn(),
    isConnected: true,
    typingUsers: {},
    emitTyping: jest.fn(),
  })),
}));

const mockActiveChat = { id: 'chat1', name: 'Test Chat' };

describe('Chat Component', () => {
  it('renders without crashing', () => {
    render(
      <SnackbarProvider>
        <AuthProvider>
          <Chat activeChat={mockActiveChat} />
        </AuthProvider>
      </SnackbarProvider>
    );
    expect(screen.getByText('Test Chat')).toBeInTheDocument();
  });

  it('allows user to type and send a message', () => {
    render(
      <SnackbarProvider>
        <AuthProvider>
          <Chat activeChat={mockActiveChat} />
        </AuthProvider>
      </SnackbarProvider>
    );
    
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    expect(input.value).toBe('Hello, world!');

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    expect(input.value).toBe('');
  });
});

