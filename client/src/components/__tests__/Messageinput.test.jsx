import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageInput from '../MessageInput';

describe('MessageInput Component', () => {
  it('renders correctly', () => {
    render(<MessageInput onSendMessage={() => {}} onTyping={() => {}} isConnected={true} />);
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('handles text input correctly', () => {
    const mockOnTyping = jest.fn();
    render(<MessageInput onSendMessage={() => {}} onTyping={mockOnTyping} isConnected={true} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    expect(input.value).toBe('Test message');
    expect(mockOnTyping).toHaveBeenCalled();
  });

  it('calls onSendMessage when send button is clicked', () => {
    const mockOnSendMessage = jest.fn();
    render(<MessageInput onSendMessage={mockOnSendMessage} onTyping={() => {}} isConnected={true} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', null);
    expect(input.value).toBe('');
  });

  it('disables input when not connected', () => {
    render(<MessageInput onSendMessage={() => {}} onTyping={() => {}} isConnected={false} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });
});

