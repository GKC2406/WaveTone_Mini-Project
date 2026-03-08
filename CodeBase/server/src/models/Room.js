import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  category: { type: String, required: true },
  maxUsers: { type: Number, default: 8 },
  duration: { type: Number, default: 30 }, // in minutes
  profanityFilter: { type: Boolean, default: true },
  rejoinAllowed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  participants: [
    {
      userId: String,
      alias: String,
      joinedAt: Date,
      leftAt: Date
    }
  ]
});

export default mongoose.model('Room', RoomSchema);
