import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { clerkMiddleware } from '@clerk/express';

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Clerk Authentication Middleware
console.log('Clerk Secret Key loaded:', process.env.CLERK_SECRET_KEY ? 'Yes (hidden)' : 'No');
app.use(clerkMiddleware({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.CLERK_PUBLISHABLE_KEY }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in server/.env');
  process.exit(1);
}

const connectDB = () => {
  mongoose.connect(MONGODB_URI, { family: 4 })
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      console.log('Retrying database connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    });
};

connectDB();
import profileRoutes from './routes/profiles.js';
import postRoutes from './routes/posts.js';
import connectionRoutes from './routes/connections.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';

// API Routes
app.use('/api/profiles', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Elevate Backend is running!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
