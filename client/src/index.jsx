import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; 
import App from './App.jsx';
import { DuckProvider } from './context/DuckContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DuckProvider>
      <App /> 
    </DuckProvider>
  </React.StrictMode>
);