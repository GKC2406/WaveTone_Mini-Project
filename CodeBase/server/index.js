import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wavetone', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Room/session models (stub)
// ... Add Mongoose models here ...

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
