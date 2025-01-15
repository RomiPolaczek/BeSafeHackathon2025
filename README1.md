# Safe Chat Application

## Project Overview

Safe Chat is a real-time chat application built with React and Node.js, focusing on secure and efficient communication. It features a modern, responsive UI and implements various advanced features for an enhanced user experience.

### Key Features

- Real-time messaging using Socket.IO
- User authentication and profile management
- Multiple chat rooms
- Message search functionality
- Typing indicators
- Read receipts
- Message reactions
- Offline message handling
- Push notifications (work in progress)

## Tech Stack

- Frontend: React, Vite, Styled-components
- Backend: Node.js, Express, Socket.IO
- State Management: React Hooks, Context API
- Storage: Local Storage (client-side caching)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:


## File and Directory Explanation

### Client-side (`/client`)

- `/public`: Contains static assets and the main `index.html` file.
  - `index.html`: The main HTML file that serves as the entry point for the React application.
  - `service-worker.js`: Handles push notifications and offline functionality.

- `/src`: Contains the main source code for the React application.
  - `/assets`: Stores static assets like images, icons, and global styles.
    - `/styles/theme.js`: Defines the global theme for styled-components.
    - `/icons/ChatIcon.jsx` and `UserIcon.jsx`: SVG icons used throughout the application.
  - `/components`: Contains all React components used in the application.
    - `App.jsx`: The main component that sets up routing and global state.
    - `Chat.jsx`: The main chat interface component.
    - `ChatHeader.jsx`: Displays the chat room name and connection status.
    - `ChatList.jsx`: Shows the list of available chat rooms.
    - `LoginForm.jsx`: Handles user authentication.
    - `MessageInput.jsx`: Allows users to type and send messages.
    - `MessageList.jsx`: Displays the list of messages in a chat room.
    - `SearchBar.jsx`: Enables message searching within a chat room.
    - `Tooltip.jsx`: Provides hover tooltips for various UI elements.
    - `TypingIndicator.jsx`: Shows when other users are typing.
    - `UserProfile.jsx`: Displays and allows editing of user profile information.
  - `/hooks`: Custom React hooks for shared logic across components.
    - `useLocalStorage.js`: Manages state persistence in local storage.
    - `usePushNotifications.js`: Handles push notification subscriptions.
    - `useSocket.js`: Manages WebSocket connections and real-time communication.
  - `main.jsx`: The entry point for the React application.

- `vite.config.js`: Configuration file for Vite, the build tool used in this project.

### Server-side (`/server`)

- `server.js`: The main Node.js server file that sets up Express and Socket.IO.
- `/models`: Contains database models (currently only `Message.js`).
  - `Message.js`: Defines the schema for chat messages (Note: currently not in use as we're using in-memory storage).

### Root Directory

- `package.json`: Defines project dependencies and scripts for both client and server.
- `README.md`: This file, providing project documentation.

## Contributing

When contributing to this project, please consider the following:

- Follow the existing code style and structure.
- Write clear, descriptive commit messages.
- Create a new branch for each feature or bugfix.
- Submit a pull request with a detailed description of your changes.

Before starting work on a new feature, please discuss it by creating an issue first.

