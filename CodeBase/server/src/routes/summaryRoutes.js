import express from 'express';
import { getSessionSummary, generateAISummary } from '../controllers/summaryController.js';

const router = express.Router();

router.get('/:id/summary', getSessionSummary);
router.post('/:id/ai-summary', generateAISummary);

export default router;
