import React from 'react';
import { SnackbarProvider } from 'notistack';
import Chat from './components/Chat';
import './styles/Chat.css';

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <div className="App">
        <Chat />
      </div>
    </SnackbarProvider>
  );
}

export default App;

