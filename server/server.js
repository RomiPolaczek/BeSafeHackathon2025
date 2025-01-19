import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

const JWT_SECRET = 'your_jwt_secret'; // In a real application, this should be an environment variable

const users = [];
const messages = [];
const activeUsers = new Map();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../client/public/uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ filename: `/uploads/${req.file.filename}` });
  } else {
    res.status(400).send('No file uploaded.');
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, username, password: hashedPassword };
  users.push(user);

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
  res.status(201).json({ token, user: { id: user.id, username: user.username } });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username } });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/api/users/search', authenticateToken, (req, res) => {
  const { query } = req.query;
  const searchResults = users
    .filter(user => user.username.toLowerCase().includes(query.toLowerCase()) && user.id !== req.user.id)
    .map(({ id, username }) => ({ id, username }));
  res.json(searchResults);
});

app.get('/api/messages', authenticateToken, (req, res) => {
  const { userId } = req.query;
  const conversationMessages = messages.filter(
    msg => (msg.senderId === req.user.id && msg.recipientId === parseInt(userId)) ||
           (msg.senderId === parseInt(userId) && msg.recipientId === req.user.id)
  );
  res.json(conversationMessages);
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.user.username);
  activeUsers.set(socket.user.id, { username: socket.user.username, lastSeen: new Date() });
  socket.join(socket.user.id.toString());

  socket.on('chat message', (msg) => {
    const message = {
      id: messages.length + 1,
      senderId: socket.user.id,
      recipientId: msg.recipientId,
      content: msg.content,
      type: msg.type,
      timestamp: new Date()
    };
    messages.push(message);
    io.to(msg.recipientId.toString()).emit('chat message', message);
    updateLastSeen(socket.user.id);
  });

  socket.on('typing', (recipientId) => {
    socket.to(recipientId.toString()).emit('user typing', { userId: socket.user.id, username: socket.user.username });
    updateLastSeen(socket.user.id);
  });

  socket.on('stop typing', (recipientId) => {
    socket.to(recipientId.toString()).emit('user stop typing', { userId: socket.user.id, username: socket.user.username });
    updateLastSeen(socket.user.id);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.username);
    activeUsers.delete(socket.user.id);
    io.emit('user disconnected', { userId: socket.user.id, username: socket.user.username });
  });
});

function updateLastSeen(userId) {
  if (activeUsers.has(userId)) {
    const user = activeUsers.get(userId);
    user.lastSeen = new Date();
    io.emit('last seen update', { userId, username: user.username, lastSeen: user.lastSeen });
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

