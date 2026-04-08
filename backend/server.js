const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Prisma setup
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Inject prisma and io
app.use((req, res, next) => {
  req.prisma = prisma;
  req.io = io;
  next();
});

// Routes
const teamRoutes = require('./routes/teamRoutes');
const matchRoutes = require('./routes/matchRoutes');
const goalRoutes = require('./routes/goalRoutes');

app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/goal', goalRoutes);

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 🔥 PERFECT PORT HANDLING (FINAL)
let PORT = process.env.PORT || 5000;

function startServer(port) {
  const tempServer = http.createServer(app);

  const ioServer = new Server(tempServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
  });

  app.set("io", ioServer);

  ioServer.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
  });

  tempServer.listen(port, () => {
    console.log(`🚀 Backend server running on port ${port}`);
  });

  tempServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
}

// Start server
startServer(PORT);