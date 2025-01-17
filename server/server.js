import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import webpush from 'web-push';

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
app.use(express.json());

const users = new Map();
const messageHistory = new Map();
const offlineMessages = new Map();
const subscriptions = new Map();

// Set up web-push
const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  const username = req.query.username;
  subscriptions.set(username, subscription);
  res.status(201).json({});
});

io.on('connection', (socket) => {
  console.log('New connection. Socket ID:', socket.id);

  socket.on('join chat', ({ username, chatId }) => {
    console.log(`User ${username} joining chat ${chatId}`);
    socket.join(chatId);
    users.set(socket.id, { username, lastSeen: new Date() });
    io.to(chatId).emit('user joined', { userId: socket.id, username, chatId });
    
    // Send message history for this chat
    const chatMessages = messageHistory.get(chatId) || [];
    socket.emit('message history', chatMessages);
  });

  socket.on('chat message', (msg, callback) => {
    console.log('Received chat message:', msg);
    const user = users.get(socket.id);
    if (user) {
      const messageWithUser = { 
        id: Date.now().toString(),
        ...msg, 
        username: user.username, 
        timestamp: new Date(),
        priority: msg.priority || 'normal',
        read: false
      };

      if (!messageHistory.has(msg.chatId)) {
        messageHistory.set(msg.chatId, []);
      }
      messageHistory.get(msg.chatId).push(messageWithUser);
      console.log(`Saved message to chat ${msg.chatId}. Total messages: ${messageHistory.get(msg.chatId).length}`);
      
      console.log('Broadcasting message to room:', msg.chatId, messageWithUser);
      io.to(msg.chatId).emit('chat message', messageWithUser);
      
      if (callback && typeof callback === 'function') {
        console.log('Calling callback with message:', messageWithUser);
        callback(messageWithUser);
      }
    } else {
      console.error('User not found for socket ID:', socket.id);
      if (callback && typeof callback === 'function') {
        callback({ error: 'User not found' });
      }
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

  socket.on('message read', ({ messageId, chatId }) => {
    console.log(`Message ${messageId} read in chat ${chatId}`);
    if (messageHistory.has(chatId)) {
      const chatMessages = messageHistory.get(chatId);
      const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        chatMessages[messageIndex].read = true;
        io.to(chatId).emit('message updated', chatMessages[messageIndex]);
      }
    }
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

