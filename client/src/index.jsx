import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeFirebase } from './firebaseInit';
import App from './App.jsx';
import './index.css';

console.log('Starting application initialization...');

// Initialize Firebase before rendering the app
initializeFirebase();

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('Rendering React app...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('React app rendered successfully');

