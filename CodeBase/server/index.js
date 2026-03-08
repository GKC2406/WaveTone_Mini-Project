import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './src/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './src/routes/roomRoutes.js';
import roomDetailsRoutes from './src/routes/roomDetailsRoutes.js';
import summaryRoutes from './src/routes/summaryRoutes.js';
import Room from './src/models/Room.js';

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

// API routes
app.get('/', (req, res) => res.send('WaveTone backend running'));
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms', roomDetailsRoutes);
app.use('/api/sessions', summaryRoutes);

// --- Socket.io signaling ---
// In-memory state: roomId → [{socketId, alias}]
const roomParticipants = new Map();
// socketId → alias
const socketAliases = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, alias }) => {
    socket.join(roomId);
    socketAliases.set(socket.id, alias);

    if (!roomParticipants.has(roomId)) {
      roomParticipants.set(roomId, []);
    }
    const participants = roomParticipants.get(roomId);

    // Send current participants to the new user BEFORE adding them
    socket.emit('room-users', participants);

    // Add new user to participants
    participants.push({ socketId: socket.id, alias });

    // Notify everyone else in the room
    socket.to(roomId).emit('user-joined', { socketId: socket.id, alias });

    console.log(`${alias} (${socket.id}) joined room ${roomId}`);
  });

  socket.on('leave-room', ({ roomId }) => {
    _leaveRoom(socket, roomId);
  });

  // WebRTC: relay offer to target peer
  socket.on('offer', ({ offer, targetSocketId }) => {
    io.to(targetSocketId).emit('offer', { offer, fromSocketId: socket.id });
  });

  // WebRTC: relay answer to target peer
  socket.on('answer', ({ answer, targetSocketId }) => {
    io.to(targetSocketId).emit('answer', { answer, fromSocketId: socket.id });
  });

  // WebRTC: relay ICE candidate to target peer
  socket.on('ice-candidate', ({ candidate, targetSocketId }) => {
    io.to(targetSocketId).emit('ice-candidate', { candidate, fromSocketId: socket.id });
  });

  // Kick a user (remove from room; kicks are local-only for now)
  socket.on('kick-user', ({ roomId, targetSocketId }) => {
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.emit('kicked');
      _leaveRoom(targetSocket, roomId);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    socketAliases.delete(socket.id);
    // Remove from all rooms they were in
    roomParticipants.forEach((participants, roomId) => {
      const idx = participants.findIndex(p => p.socketId === socket.id);
      if (idx !== -1) {
        participants.splice(idx, 1);
        socket.to(roomId).emit('user-left', { socketId: socket.id });
        if (participants.length === 0) {
          roomParticipants.delete(roomId);
          Room.findByIdAndUpdate(roomId, { isActive: false }).catch(() => {});
        }
      }
    });
  });
});

function _leaveRoom(socket, roomId) {
  socket.leave(roomId);
  const participants = roomParticipants.get(roomId);
  if (participants) {
    const idx = participants.findIndex(p => p.socketId === socket.id);
    if (idx !== -1) participants.splice(idx, 1);
    if (participants.length === 0) {
      roomParticipants.delete(roomId);
      // Deactivate room in MongoDB so it disappears from Browse
      Room.findByIdAndUpdate(roomId, { isActive: false }).catch(() => {});
      console.log(`Room ${roomId} closed — no participants remain`);
    }
  }
  socket.to(roomId).emit('user-left', { socketId: socket.id });
  console.log(`${socket.id} left room ${roomId}`);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
