import Room from '../models/Room.js';
import { containsProfanity } from '../utils/profanityFilter.js';

export const getRooms = async (req, res) => {
  try {
    // Clean up stale rooms: if all participants have left, mark as inactive
    await Room.updateMany(
      {
        isActive: true,
        'participants.0': { $exists: true },
        participants: { $not: { $elemMatch: { leftAt: { $exists: false } } } }
      },
      { $set: { isActive: false } }
    );

    const rooms = await Room.find({ isActive: true, isPrivate: { $ne: true } })
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { topic, category, maxUsers, isPrivate } = req.body;
    if (containsProfanity(topic) || containsProfanity(category)) {
      return res.status(400).json({ error: 'Room topic or category contains inappropriate language.' });
    }
    const room = new Room({ topic, category, maxUsers, isPrivate });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create room' });
  }
};
