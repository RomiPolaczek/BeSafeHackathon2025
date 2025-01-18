import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeFirebase } from './firebaseInit.js';
import App from './App.jsx';
import './index.css';

console.log('Starting application initialization...');

try {
  console.log('Initializing Firebase...');
  initializeFirebase();
  console.log('Firebase initialization complete');

  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('Rendering React app...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Error during app initialization:', error);
}

