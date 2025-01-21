# Safe Chat Application

This project is a secure chat application built using JavaScript, React, HTML, CSS, and Node.js. The application includes real-time messaging, user authentication, and a content moderation system that ensures the safety of messages and images using AI-based checks. This project was developed as part of the **QueenB X AppsFlyer - BeSafe Hackathon 2025**.

## Features

### 1. Real-Time Messaging
- **Socket.io Integration**: Real-time communication between users is facilitated through `socket.io`, ensuring instant message delivery and updates.
- **Conversation Management**: Users can maintain multiple conversations, and messages are sorted based on the latest interaction.

### 2. Content Moderation System
- **AI-Based Safety Checks**: Messages and images are checked for inappropriate content using OpenAI's API and Google Cloud Vision.
- **Text Content Safety**: The `checkContentSafety` function analyzes text messages for offensive or harmful content. Messages deemed unsafe are flagged.
- **Image Content Safety**: Uploaded images are analyzed for nudity or inappropriate content using Google Cloud Vision and OpenAI's moderation tools. Images related to swimsuits or beach scenes are also flagged.
- **Fallback Mechanism**: If a user chooses to ignore the content warning, the message is sent to a trusted adult's email address, provided during the sign-up process.

### 3. File Uploads
- **Multer for File Handling**: The application uses `multer` for handling file uploads, storing them securely in a designated directory.

### 4. Email Notifications
- **Nodemailer for Email Alerts**: If a user ignores a content warning, an email notification is sent to a trusted adult with details of the flagged content.

### 5. User Authentication (Future Development)
- **JWT Authentication**: Secure user authentication using JSON Web Tokens (JWT) for session management.
- **Registration and Login**: Users can register and log in with secure password hashing using `bcryptjs`.


## Installation

### Prerequisites

- **Node.js**
  - Version 20.x or higher required (latest LTS recommended)
- **npm**
  - Version 10.x or higher required (get the latest by running `npm install -g npm@latest --no-optional`)

### Clone the Repository

To get started with this project, you need to clone the repository to your local machine:

```bash
   git clone (https://github.com/RomiPolaczek/BeSafeHackathon2025.git)
   ```

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```

### Client Setup

1. Navigate to the client directory:
   ```bash
   cd ../client
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```

### Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     OPENAI_API_KEY=your_openai_api_key
     GOOGLE_APPLICATION_CREDENTIALS=path_to_your_google_credentials.json
     ```

## Usage

- Register or log in to access the chat application.
- Start a conversation with any registered user.
- Upload images or send text messages, which will be automatically checked for safety.

## Technologies Used

- **Frontend**: React, HTML, CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: Not yet implemented (planned for future versions)
- **File Handling**: Multer
- **AI Content Moderation**: OpenAI API, Google Cloud Vision
- **Email Notifications**: Nodemailer
