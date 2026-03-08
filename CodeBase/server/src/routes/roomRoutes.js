import express from 'express';
import { getRooms, createRoom } from '../controllers/roomController.js';

const router = express.Router();

// GET /api/rooms
router.get('/', getRooms);

// POST /api/rooms
router.post('/', createRoom);

export default router;
