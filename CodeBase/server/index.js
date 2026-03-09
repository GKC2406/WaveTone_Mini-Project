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
import { containsProfanity, filterProfanity } from './src/utils/profanityFilter.js';

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

app.use(cors({
  origin: [
    'https://wave-tone-mini-project.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// API routes
app.get('/', (req, res) => res.send('WaveTone backend running'));
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms', roomDetailsRoutes);
app.use('/api/sessions', summaryRoutes);

// --- Socket.io in-memory state ---
const roomParticipants = new Map();  // roomId → [{socketId, alias}]
const socketAliases = new Map();     // socketId → alias
const roomBannedIPs = new Map();     // roomId → Set<ip>
const globalBannedIPs = new Set();   // Global IPs banned from all rooms (persistent across sessions)
const socketWarnings = new Map();    // socketId → { count, lastTimestamp }
const activeVotes = new Map();       // roomId → { targetSocketId, targetAlias, initiatorAlias, votes: Set, startTime, timeout }

const MAX_WARNINGS = 3;
const WARNING_AUTO_VOTE_THRESHOLD = 2; // Auto-start vote-kick after 2 warnings
const WARNING_RATE_LIMIT_MS = 500; // Reduced from 2000ms for faster detection
const VOTE_TIMEOUT_MS = 30000;
const VOTE_THRESHOLD = 0.7;

function _getIP(socket) {
  return socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || socket.handshake.address;
}

function _banAndKick(socket, roomId, reason, isGlobalBan = false) {
  const ip = _getIP(socket);
  if (!roomBannedIPs.has(roomId)) roomBannedIPs.set(roomId, new Set());
  roomBannedIPs.get(roomId).add(ip);
  if (isGlobalBan) {
    globalBannedIPs.add(ip);
    console.log(`IP ${ip} added to global ban list`);
  }
  socket.emit('kicked', { reason });
  _leaveRoom(socket, roomId);
}

// --- Socket.io signaling ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ==================== JOIN ROOM ====================
  socket.on('join-room', async ({ roomId, alias }) => {
    const ip = _getIP(socket);

    // Check global ban first
    if (globalBannedIPs.has(ip)) {
      socket.emit('join-denied', { reason: 'You have been globally banned from WaveTone.' });
      return;
    }

    if (roomBannedIPs.has(roomId) && roomBannedIPs.get(roomId).has(ip)) {
      socket.emit('join-denied', { reason: 'You have been banned from this room.' });
      return;
    }

    // Check if room exists in database
    try {
      const roomExists = await Room.findById(roomId);
      if (!roomExists) {
        socket.emit('room-error', { code: 'NOT_FOUND', error: 'Room has been destroyed or does not exist.' });
        return;
      }
    } catch (err) {
      socket.emit('room-error', { code: 'NOT_FOUND', error: 'Room not found.' });
      return;
    }

    if (!roomParticipants.has(roomId)) roomParticipants.set(roomId, []);
    const participants = roomParticipants.get(roomId);

    // Assign 'Host' only to the first participant, others get their alias or 'Anonymous'
    let cleanAlias;
    if (participants.length === 0) {
      cleanAlias = 'Host';
    } else {
      cleanAlias = alias && alias !== 'Host' ? (containsProfanity(alias) ? filterProfanity(alias) : alias) : 'Anonymous';
    }

    socket.join(roomId);
    socketAliases.set(socket.id, cleanAlias);

    socket.emit('room-users', participants);
    participants.push({ socketId: socket.id, alias: cleanAlias });
    socket.to(roomId).emit('user-joined', { socketId: socket.id, alias: cleanAlias });

    console.log(`${cleanAlias} (${socket.id}) [${ip}] joined room ${roomId}`);
  });

  // ==================== LEAVE ROOM ====================
  socket.on('leave-room', ({ roomId }) => {
    _leaveRoom(socket, roomId);
  });

  // ==================== WEBRTC SIGNALING ====================
  socket.on('offer', ({ offer, targetSocketId }) => {
    io.to(targetSocketId).emit('offer', { offer, fromSocketId: socket.id });
  });

  socket.on('answer', ({ answer, targetSocketId }) => {
    io.to(targetSocketId).emit('answer', { answer, fromSocketId: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, targetSocketId }) => {
    io.to(targetSocketId).emit('ice-candidate', { candidate, fromSocketId: socket.id });
  });

  // ==================== HOST KICK ====================
  socket.on('kick-user', ({ roomId, targetSocketId }) => {
    // Only allow Host to kick
    const participants = roomParticipants.get(roomId);
    if (!participants) return;
    const host = participants[0];
    if (!host || host.socketId !== socket.id) {
      // Not the host, ignore
      return;
    }
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      _banAndKick(targetSocket, roomId, 'You have been kicked from this room.');
      console.log(`Host kicked ${targetSocketId} from room ${roomId}`);
    }
  });

  // ==================== PROFANITY WARNING SYSTEM ====================
  socket.on('profanity-warning', ({ roomId }) => {
    const now = Date.now();

    if (!socketWarnings.has(socket.id)) {
      socketWarnings.set(socket.id, { count: 0, lastTimestamp: 0 });
    }
    const record = socketWarnings.get(socket.id);

    // Rate-limit: ignore if too soon
    if (now - record.lastTimestamp < WARNING_RATE_LIMIT_MS) return;

    record.count += 1;
    record.lastTimestamp = now;

    console.log(`Profanity warning #${record.count}/${MAX_WARNINGS} for ${socket.id} in room ${roomId}`);

    socket.emit('warning-issued', { count: record.count, maxWarnings: MAX_WARNINGS });

    // Auto-start vote-kick at WARNING_AUTO_VOTE_THRESHOLD (2 warnings)
    if (record.count === WARNING_AUTO_VOTE_THRESHOLD) {
      const participants = roomParticipants.get(roomId);
      if (participants && participants.length >= 3) {
        const targetAlias = socketAliases.get(socket.id) || 'Anonymous';
        const initiatorAlias = 'System';
        const totalVoters = participants.length - 1;

        if (!activeVotes.has(roomId)) {
          const voteSession = {
            targetSocketId: socket.id,
            targetAlias,
            initiatorAlias,
            votes: new Set(),
            timeout: null,
          };

          voteSession.timeout = setTimeout(() => {
            if (activeVotes.has(roomId)) {
              io.to(roomId).emit('vote-kick-ended', {
                targetSocketId: socket.id, targetAlias,
                result: 'failed', reason: 'Vote timed out.',
              });
              activeVotes.delete(roomId);
            }
          }, VOTE_TIMEOUT_MS);

          activeVotes.set(roomId, voteSession);
          const requiredVotes = Math.ceil(totalVoters * VOTE_THRESHOLD);

          io.to(roomId).emit('vote-kick-active', {
            targetSocketId: socket.id, targetAlias, initiatorAlias,
            currentVotes: 0, requiredVotes, totalVoters,
            timeoutSeconds: VOTE_TIMEOUT_MS / 1000,
          });

          console.log(`Auto vote-kick started (system) against ${targetAlias} after ${WARNING_AUTO_VOTE_THRESHOLD} warnings in room ${roomId}`);
        }
      }
    }

    // Auto-kick at MAX_WARNINGS threshold (3 warnings) with global ban
    if (record.count >= MAX_WARNINGS) {
      console.log(`Auto-kicking ${socket.id} after ${MAX_WARNINGS} profanity warnings (global ban)`);
      socketWarnings.delete(socket.id);
      _banAndKick(socket, roomId, `Removed after ${MAX_WARNINGS} profanity warnings.`, true);
    }
  });

  // ==================== VOTE-KICK SYSTEM ====================
  socket.on('vote-kick-start', ({ roomId, targetSocketId }) => {
    if (targetSocketId === socket.id) return;

    if (activeVotes.has(roomId)) {
      socket.emit('vote-kick-error', { message: 'A vote is already in progress.' });
      return;
    }

    const participants = roomParticipants.get(roomId);
    if (!participants) return;
    if (participants.length < 3) {
      socket.emit('vote-kick-error', { message: 'Vote kick requires at least 3 participants.' });
      return;
    }
    const target = participants.find(p => p.socketId === targetSocketId);
    if (!target) return;

    const initiatorAlias = socketAliases.get(socket.id) || 'Anonymous';
    const totalVoters = participants.length - 1; // exclude target

    const voteSession = {
      targetSocketId,
      targetAlias: target.alias,
      initiatorAlias,
      votes: new Set([socket.id]), // initiator auto-votes yes
      timeout: null,
    };

    // 30-second timeout
    voteSession.timeout = setTimeout(() => {
      if (activeVotes.has(roomId)) {
        io.to(roomId).emit('vote-kick-ended', {
          targetSocketId, targetAlias: target.alias,
          result: 'failed', reason: 'Vote timed out.',
        });
        activeVotes.delete(roomId);
      }
    }, VOTE_TIMEOUT_MS);

    activeVotes.set(roomId, voteSession);

    const requiredVotes = Math.ceil(totalVoters * VOTE_THRESHOLD);

    // Notify everyone except the target
    participants.forEach(p => {
      if (p.socketId !== targetSocketId) {
        io.to(p.socketId).emit('vote-kick-active', {
          targetSocketId, targetAlias: target.alias, initiatorAlias,
          currentVotes: voteSession.votes.size, requiredVotes, totalVoters,
          timeoutSeconds: VOTE_TIMEOUT_MS / 1000,
        });
      }
    });

    console.log(`Vote-kick started by ${initiatorAlias} against ${target.alias} in room ${roomId}`);
  });

  socket.on('vote-kick-cast', ({ roomId, vote }) => {
    const session = activeVotes.get(roomId);
    if (!session || socket.id === session.targetSocketId) return;

    if (vote === 'yes') session.votes.add(socket.id);

    const participants = roomParticipants.get(roomId);
    if (!participants) return;

    const totalVoters = participants.length - 1;
    const requiredVotes = Math.ceil(totalVoters * VOTE_THRESHOLD);

    // Broadcast updated count (except target)
    participants.forEach(p => {
      if (p.socketId !== session.targetSocketId) {
        io.to(p.socketId).emit('vote-kick-update', {
          currentVotes: session.votes.size, requiredVotes, totalVoters,
        });
      }
    });

    // Check threshold
    if (session.votes.size >= requiredVotes) {
      clearTimeout(session.timeout);

      const targetSocket = io.sockets.sockets.get(session.targetSocketId);
      if (targetSocket) {
        _banAndKick(targetSocket, roomId, 'You were vote-kicked by the room.');
      }

      io.to(roomId).emit('vote-kick-ended', {
        targetSocketId: session.targetSocketId, targetAlias: session.targetAlias,
        result: 'passed', reason: 'Vote passed.',
      });

      activeVotes.delete(roomId);
      console.log(`Vote-kick passed for ${session.targetAlias} in room ${roomId}`);
    }
  });

  // ==================== DISCONNECT ====================
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    socketAliases.delete(socket.id);
    socketWarnings.delete(socket.id);
    roomParticipants.forEach((participants, roomId) => {
      const idx = participants.findIndex(p => p.socketId === socket.id);
      if (idx !== -1) {
        participants.splice(idx, 1);
        socket.to(roomId).emit('user-left', { socketId: socket.id });

        // Cancel active vote if target disconnected
        _cleanupVote(roomId, socket.id);

        if (participants.length === 0) {
          roomParticipants.delete(roomId);
          roomBannedIPs.delete(roomId);
          _cleanupVote(roomId);
          Room.findByIdAndUpdate(roomId, { isActive: false }).catch(() => {});
        }
      }
    });
  });
});

// --- Helper functions ---

function _leaveRoom(socket, roomId) {
  socket.leave(roomId);
  const participants = roomParticipants.get(roomId);
  if (participants) {
    const idx = participants.findIndex(p => p.socketId === socket.id);
    if (idx !== -1) participants.splice(idx, 1);

    _cleanupVote(roomId, socket.id);

    if (participants.length === 0) {
      roomParticipants.delete(roomId);
      roomBannedIPs.delete(roomId);
      _cleanupVote(roomId);
      Room.findByIdAndUpdate(roomId, { isActive: false }).catch(() => {});
      console.log(`Room ${roomId} closed — no participants remain`);
    }
  }
  socket.to(roomId).emit('user-left', { socketId: socket.id });
}

function _cleanupVote(roomId, disconnectedSocketId) {
  const vote = activeVotes.get(roomId);
  if (!vote) return;

  // If vote target left, cancel vote
  if (disconnectedSocketId && vote.targetSocketId === disconnectedSocketId) {
    clearTimeout(vote.timeout);
    io.to(roomId).emit('vote-kick-ended', {
      targetSocketId: vote.targetSocketId, targetAlias: vote.targetAlias,
      result: 'cancelled', reason: 'Target left the room.',
    });
    activeVotes.delete(roomId);
  }

  // If room is empty, just delete
  if (!disconnectedSocketId) {
    clearTimeout(vote.timeout);
    activeVotes.delete(roomId);
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
