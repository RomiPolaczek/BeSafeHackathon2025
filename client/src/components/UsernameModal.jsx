// components/UsernameModal.js
import React, { useState } from 'react';

function UsernameModal({ isOpen, onSetUsername }) {
  const [inputUsername, setInputUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      onSetUsername(inputUsername.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="username-modal">
      <div className="modal-content">
        <h2>Choose a Username</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            placeholder="Enter your username"
            aria-label="Enter your username"
          />
          <button type="submit">Join Chat</button>
        </form>
      </div>
    </div>
  );
}

export default UsernameModal;