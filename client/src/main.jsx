import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import '@fortawesome/fontawesome-free/css/all.min.css';

console.log('Starting application initialization...');

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('Rendering React app...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('React app rendered successfully');

