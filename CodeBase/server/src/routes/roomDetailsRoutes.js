import express from 'express';
import { getRoomById, joinRoom, leaveRoom } from '../controllers/roomDetailsController.js';

const router = express.Router();

router.get('/:id', getRoomById);
router.post('/:id/join', joinRoom);
router.post('/:id/leave', leaveRoom);

export default router;
