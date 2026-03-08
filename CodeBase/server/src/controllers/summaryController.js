import Room from '../models/Room.js';

// Get post-room summary (stub)
export const getSessionSummary = async (req, res) => {
  try {
    // For now, just return room info as a stub
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    // Example: return duration, participant count, etc.
    res.json({
      roomId: room._id,
      topic: room.topic,
      duration: room.duration,
      participantCount: room.participants.length,
      createdAt: room.createdAt,
      isActive: room.isActive
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session summary' });
  }
};
