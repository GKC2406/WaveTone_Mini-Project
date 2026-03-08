import summaryRoutes from './src/routes/summaryRoutes.js';
app.use('/api/sessions', summaryRoutes);
import roomDetailsRoutes from './src/routes/roomDetailsRoutes.js';
app.use('/api/rooms', roomDetailsRoutes);
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './src/db.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// MongoDB connection handled in connectDB()


// Room API routes
import roomRoutes from './src/routes/roomRoutes.js';
app.use('/api/rooms', roomRoutes);

// API routes (stub)
app.get('/', (req, res) => {
  res.send('WaveTone backend running');
});

// Socket.io signaling (stub)
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Room join/leave, signaling, moderation events go here
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
