const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, '../build')));

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

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

