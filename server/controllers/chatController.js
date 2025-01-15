import { users, messageHistory } from '../data/chatData.js';

export const setUsername = (io, socket, username) => {
  users.set(socket.id, { username, lastSeen: new Date() });
  socket.emit('username set', username);
  io.emit('user joined', { userId: socket.id, username });
  socket.emit('message history', messageHistory);
};

export const handleChatMessage = (io, socket, msg) => {
  const user = users.get(socket.id);
  if (user) {
    const messageWithUser = { ...msg, username: user.username, timestamp: new Date() };
    messageHistory.push(messageWithUser);
    io.emit('chat message', messageWithUser);
    updateLastSeen(io, socket.id);
  }
};

export const handleTyping = (socket) => {
  const user = users.get(socket.id);
  if (user) {
    socket.broadcast.emit('user typing', { userId: socket.id, username: user.username });
    updateLastSeen(socket.broadcast, socket.id);
  }
};

export const handleStopTyping = (socket) => {
  const user = users.get(socket.id);
  if (user) {
    socket.broadcast.emit('user stop typing', { userId: socket.id, username: user.username });
    updateLastSeen(socket.broadcast, socket.id);
  }
};

export const handleDisconnect = (io, socket) => {
  const user = users.get(socket.id);
  if (user) {
    console.log('User disconnected:', user.username);
    io.emit('user disconnected', { userId: socket.id, username: user.username });
    users.delete(socket.id);
  }
};

const updateLastSeen = (io, userId) => {
  if (users.has(userId)) {
    const user = users.get(userId);
    user.lastSeen = new Date();
    io.emit('last seen update', { userId, username: user.username, lastSeen: user.lastSeen });
  }
};

