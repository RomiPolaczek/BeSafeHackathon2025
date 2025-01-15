// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static('build'));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ filename: req.file.filename });
  } else {
    res.status(400).send('No file uploaded.');
  }
});

const users = new Map();
const messageHistory = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('set username', (username) => {
    users.set(socket.id, { username, lastSeen: new Date() });
    socket.emit('username set', username);
    io.emit('user joined', { userId: socket.id, username });
    
    // Send message history to the newly connected user
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
    if (user) {node 
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});