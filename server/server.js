import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, '../client/build')));

const users = new Map();
const messageHistory = new Map();

io.on('connection', (socket) => {
  console.log('New connection. Socket ID:', socket.id);

  socket.on('join chat', ({ username, chatId }) => {
    console.log(`User ${username} joining chat ${chatId}`);
    socket.join(chatId);
    users.set(socket.id, { username, lastSeen: new Date() });
    io.to(chatId).emit('user joined', { userId: socket.id, username, chatId });
    if (!messageHistory.has(chatId)) {
      messageHistory.set(chatId, []);
    }
    socket.emit('message history', messageHistory.get(chatId));
  });

  socket.on('chat message', (msg, callback) => {
    console.log('Received chat message:', msg);
    const user = users.get(socket.id);
    if (user) {
      const messageWithUser = { ...msg, username: user.username, timestamp: new Date() };
      if (!messageHistory.has(msg.chatId)) {
        messageHistory.set(msg.chatId, []);
      }
      messageHistory.get(msg.chatId).push(messageWithUser);
      console.log('Broadcasting message to room:', msg.chatId, messageWithUser);
      socket.to(msg.chatId).emit('chat message', messageWithUser);
      if (callback) {
        console.log('Calling callback for message:', messageWithUser);
        callback(null, messageWithUser);
      }
    } else {
      console.error('User not found for socket ID:', socket.id);
      if (callback) callback('User not found');
    }
  });

  socket.on('typing', ({ username, chatId }) => {
    console.log(`User ${username} is typing in chat ${chatId}`);
    socket.to(chatId).emit('typing', { userId: socket.id, username, chatId });
  });

  socket.on('stop typing', ({ username, chatId }) => {
    console.log(`User ${username} stopped typing in chat ${chatId}`);
    socket.to(chatId).emit('stop typing', { userId: socket.id, chatId });
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log('User disconnected:', user.username, 'Socket ID:', socket.id);
      io.emit('user disconnected', { userId: socket.id, username: user.username });
      users.delete(socket.id);
    } else {
      console.log('Unknown user disconnected. Socket ID:', socket.id);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

