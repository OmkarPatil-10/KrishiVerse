const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./src/models/Message');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend origins
    methods: ["GET", "POST", "PUT"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.log('❌ MongoDB Connection Error:', err.message);
    console.log('📝 Note: Make sure MongoDB is running. Install it from: https://www.mongodb.com/try/download/community');
  });

// ========== IMPORT ALL ROUTES HERE ==========
const authRoutes = require('./src/routes/authRoutes');
const cropRoutes = require('./src/routes/cropRoutes');
const contractRoutes = require('./src/routes/contractRoutes');
const weatherRoutes = require('./src/routes/weatherRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const userRoutes = require('./src/routes/userRoutes');
const otpRoutes = require('./src/routes/otpRoutes');
const supportRoutes = require('./src/routes/supportRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const chatbotRoutes = require('./src/routes/chatbotRoutes');

// ========== USE ALL ROUTES HERE ==========
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ Krishiverse Backend is running!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ---------------- SOCKET.IO LOGIC ----------------
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Join a room based on contractId
  socket.on('join_room', (contractId) => {
    socket.join(contractId);
    console.log(`👤 Socket ${socket.id} joined room/contract: ${contractId}`);
  });

  // Handle incoming message
  socket.on('send_message', async (data) => {
    try {
      // data: { contractId, senderId, senderName, role, text }
      const newMessage = new Message({
        contractId: data.contractId,
        senderId: data.senderId,
        senderName: data.senderName,
        role: data.role,
        text: data.text
      });
      await newMessage.save();

      // Emit to everyone in the room, including sender
      io.to(data.contractId).emit('receive_message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Socket.io enabled`);
});