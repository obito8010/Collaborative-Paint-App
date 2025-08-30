const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Store drawing history for new connections
let drawingHistory = [];
let users = 0;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  users++;
  io.emit('users-count', users);
  
  // Send current drawing history to new client
  socket.emit('drawing-history', drawingHistory);
  
  // Handle drawing events
  socket.on('drawing', (data) => {
    // Add to history
    drawingHistory.push(data);
    // Broadcast to all other clients
    socket.broadcast.emit('drawing', data);
  });
  
  // Handle clear canvas
  socket.on('clear-canvas', () => {
    drawingHistory = [];
    io.emit('canvas-cleared');
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    users--;
    io.emit('users-count', users);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});