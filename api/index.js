import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { clerkMiddleware } from '@clerk/express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import profileRoutes from './_routes/profiles.js';
import postRoutes from './_routes/posts.js';
import connectionRoutes from './_routes/connections.js';
import messageRoutes from './_routes/messages.js';
import notificationRoutes from './_routes/notifications.js';
import conversationRoutes from './_routes/conversations.js';
import commentRoutes from './_routes/comments.js';

import parseResumeRoute from './_routes/resume/parseResume.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  pingTimeout: 60000,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
}));

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/api/profiles', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/comments', commentRoutes);

app.use('/api/resume/upload', parseResumeRoute);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Elevate Backend is running!' });
});

io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
  });

  socket.on('new message', (newMessageReceived) => {
    var chat = newMessageReceived.conversation_id;
    if (!chat || !chat.users) return;

    chat.users.forEach((user) => {

      const userId = user._id || user; 

      const senderId = newMessageReceived.sender_id._id || newMessageReceived.sender_id;
      if (userId === senderId) return;

      socket.in(userId).emit('message received', newMessageReceived);
    });
  });
  
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  httpServer.listen(PORT, () => {
    console.log(`Development server running on port ${PORT}`);
  });
}

export default app;
