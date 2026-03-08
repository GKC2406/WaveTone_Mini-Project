import express from 'express';
import { getSessionSummary } from '../controllers/summaryController.js';

const router = express.Router();

// GET /api/sessions/:id/summary
router.get('/:id/summary', getSessionSummary);

export default router;
