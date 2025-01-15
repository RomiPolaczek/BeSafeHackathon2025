import React from 'react';

function LastSeen({ lastSeen }) {
  return (
    <div className="last-seen">
      {Object.entries(lastSeen).map(([userId, { username, lastSeen }]) => (
        <p key={userId}>{username} last seen: {new Date(lastSeen).toLocaleTimeString()}</p>
      ))}
    </div>
  );
}

export default LastSeen;

