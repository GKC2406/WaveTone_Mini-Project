import Room from '../models/Room.js';

// Get room details by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room details' });
  }
};

// Join a room session (stub)
export const joinRoom = async (req, res) => {
  try {
    // Add participant logic here (stub)
    res.json({ message: 'Joined room (stub)' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join room' });
  }
};
