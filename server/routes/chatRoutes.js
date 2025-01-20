import express from 'express';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

const setupSocketRoutes = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('set username', (username) => chatController.setUsername(io, socket, username));
    socket.on('chat message', (input, type) => chatController.handleChatMessage(io, socket, msg));
    socket.on('typing', () => chatController.handleTyping(socket));
    socket.on('stop typing', () => chatController.handleStopTyping(socket));
    socket.on('disconnect', () => chatController.handleDisconnect(io, socket));
  });
};

export default setupSocketRoutes;

