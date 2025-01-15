import React from 'react';

function TypingIndicator({ typingUsers }) {
  if (Object.keys(typingUsers).length === 0) return null;

  const typingUsernames = Object.values(typingUsers).join(', ');
  return (
    <div className="typing-indicator">
      {typingUsernames} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
    </div>
  );
}

export default TypingIndicator;

