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
const messageHistory = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('set username', (username) => {
    users.set(socket.id, { username, lastSeen: new Date() });
    socket.emit('username set', username);
    io.emit('user joined', { userId: socket.id, username });
    socket.emit('message history', messageHistory);
  });

  socket.on('chat message', (msg) => {
    const user = users.get(socket.id);
    if (user) {
      const messageWithUser = { ...msg, username: user.username, timestamp: new Date() };
      messageHistory.push(messageWithUser);
      io.emit('chat message', messageWithUser);
      updateLastSeen(socket.id);
    }
  });

  socket.on('typing', () => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit('user typing', { userId: socket.id, username: user.username });
      updateLastSeen(socket.id);
    }
  });

  socket.on('stop typing', () => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit('user stop typing', { userId: socket.id, username: user.username });
      updateLastSeen(socket.id);
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log('User disconnected:', user.username);
      io.emit('user disconnected', { userId: socket.id, username: user.username });
      users.delete(socket.id);
    }
  });
});

function updateLastSeen(userId) {
  if (users.has(userId)) {
    const user = users.get(userId);
    user.lastSeen = new Date();
    io.emit('last seen update', { userId, username: user.username, lastSeen: user.lastSeen });
  }
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

