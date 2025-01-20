import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import webpush from 'web-push';
import { checkContentSafety } from './utils/contentChecker.js'; // Adjust the path as necessary
import { messageHistory } from './data/chatData.js';


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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const JWT_SECRET = 'your_jwt_secret'; // In a real application, this should be an environment variable

const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
  { id: 3, username: 'user3', password: 'password3' },
];

const messages = [];
const conversations = new Map();
const activeUsers = new Map();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

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

app.get('/api/users/search', authenticateToken, (req, res) => {
  const { query } = req.query;
  const searchResults = users
    .filter(user => user.username.toLowerCase().includes(query.toLowerCase()) && user.id !== req.user.id)
    .map(({ id, username }) => ({ id, username }));
  res.json(searchResults);
});

app.get('/api/conversations', authenticateToken, (req, res) => {
  const userConversations = Array.from(conversations.values())
    .filter(conv => conv.participants.includes(req.user.id))
    .map(conv => {
      const otherUser = users.find(u => u.id !== req.user.id && conv.participants.includes(u.id));
      return {
        id: conv.id,
        username: otherUser.username,
        lastMessage: conv.messages[conv.messages.length - 1]?.content || '',
        lastMessageTimestamp: conv.messages[conv.messages.length - 1]?.timestamp || Date.now()
      };
    })
    .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

  res.json(userConversations);
});

app.get('/api/messages', authenticateToken, (req, res) => {
  const { userId } = req.query;
  const conversationId = getConversationId(req.user.id, parseInt(userId));
  const conversation = conversations.get(conversationId);
  
  if (conversation) {
    res.json(conversation.messages);
  } else {
    res.json([]);
  }
});

app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
  // if (req.file) {
  //   const imageUrl = `./uploads/${req.file.filename}`;
  //   const isSafe = await checkContentSafety({ content: imageUrl, type: 'image' }); 
  //   if (isSafe) {
  //     console.log('Uploaded image contains safe content.');
  //     res.json({ imageUrl });
  //   } else {
  //     // Delete the unsafe image
  //     fs.unlinkSync(path.join(uploadsDir, req.file.filename));
  //     return;
  //     // res.status(400).json({ message: 'Uploaded image contains unsafe content.' });
  //   }
  // }
  // // res.status(400).json({ message: 'Uploaded image contains unsafe content.' });
  // return;

  if (req.file) {
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } else {
    res.status(400).send('No file uploaded.');
  }
});

function getConversationId(user1Id, user2Id) {
  return [user1Id, user2Id].sort().join('-');
}

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


  socket.on('chat message', async (input) => {

    console.log('The input: ', input.content , ' the type:', input.type);
    const isSafe =  await checkContentSafety(input, input.type);

    if(isSafe){
      console.log('The message: "', input, '" is safe');

      const conversationId = getConversationId(socket.user.id, input.recipientId);
      if (!conversations.has(conversationId)) {
        conversations.set(conversationId, {
        id: conversationId,
        participants: [socket.user.id, input.recipientId],
        messages: []
        });
      }
      const message = {
        id: Date.now(),
        senderId: socket.user.id,
        recipientId: input.recipientId,
        content: input.content,
        type: input.type,
        timestamp: new Date()
      };

      messageHistory.push(input);  
      conversations.get(conversationId).messages.push(input);
      io.to(input.recipientId.toString()).emit('chat message', input);

      // Send success feedback (even if message is safe)
      socket.emit('message feedback', { success: true });

    } else {
      // if the message is not safe - don't send it and display feedback:
      console.log('The message: "', input, '" is not safe');

      // Send feedback to the client about the unsafe message
      socket.emit('message feedback', { success: false, input:
            'Your message contains content that may be harmful, to yourself or to others.' });
    }

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

