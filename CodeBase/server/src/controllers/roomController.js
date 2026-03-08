import Room from '../models/Room.js';

export const getRooms = async (req, res) => {
  try {
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
    const room = new Room({ topic, category, maxUsers, isPrivate });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create room' });
  }
};
