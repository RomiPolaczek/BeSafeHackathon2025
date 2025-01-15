// components/TypingIndicator.js
import React from 'react';

function TypingIndicator({ typingUsers }) {
  const typingUsernames = Object.values(typingUsers);
  
  if (typingUsernames.length === 0) return null;
  
  return (
    <div className="typing-indicator" aria-live="polite">
      {typingUsernames.join(', ')} {typingUsernames.length === 1 ? 'is' : 'are'} typing...
    </div>
  );
}

export default TypingIndicator;