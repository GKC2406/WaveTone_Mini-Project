import express from 'express';
import { getSessionSummary, generateAISummary } from '../controllers/summaryController.js';

const router = express.Router();

router.get('/:id/summary', getSessionSummary);
router.post('/:id/ai-summary', generateAISummary);

// Debug route to test AI providers without affecting production flow
router.post('/:id/ai-debug', async (req, res) => {
	// This route will call the same controller logic but return provider details and raw responses
	try {
		// Lazy-import controller helpers to avoid circular deps
		const ctrl = await import('../controllers/summaryController.js');
		const { normalizeTranscripts, buildFallbackSummary, generateWithGroq } = ctrl;
		const { transcripts = [], topic, category, duration, participantCount } = req.body;

		const cleaned = normalizeTranscripts(transcripts);
		const fallback = buildFallbackSummary({ transcripts: cleaned, topic, category, duration, participantCount });

		const trimmed = cleaned.join('\n');
		const prompt = `You are summarizing an anonymous voice room conversation from WaveTone.\n\nRoom topic: \"${topic || 'General'}\"\nCategory: ${category || 'General'}\nDuration: ${duration || '?'} minutes\nParticipants: ${participantCount || '?'}\n\nTranscripts:\n${trimmed}\n\nProvide a concise summary.`;

		const result = { fallback };

		// Try Groq if available
		try {
			const gro = await generateWithGroq(prompt);
			result.groq = gro;
		} catch (e) {
			result.groq = { error: e.message };
		}

		return res.json(result);
	} catch (err) {
		return res.status(500).json({ error: 'Debug endpoint failed', details: err.message });
	}
});

export default router;
