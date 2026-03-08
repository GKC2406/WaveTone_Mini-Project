import express from 'express';
import { getRoomById, joinRoom } from '../controllers/roomDetailsController.js';

const router = express.Router();

// GET /api/rooms/:id
router.get('/:id', getRoomById);

// POST /api/rooms/:id/join
router.post('/:id/join', joinRoom);

export default router;
