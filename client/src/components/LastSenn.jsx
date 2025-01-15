// components/LastSeen.js
import React from 'react';

function LastSeen({ lastSeen }) {
  const lastSeenUsers = Object.values(lastSeen);
  
  if (lastSeenUsers.length === 0) return null;
  
  return (
    <div className="last-seen" aria-live="polite">
      {lastSeenUsers.map(({ username, lastSeen }) => (
        <div key={username}>
          {username} last seen: {new Date(lastSeen).toLocaleTimeString()}
        </div>
      ))}
    </div>
  );
}

export default LastSeen;