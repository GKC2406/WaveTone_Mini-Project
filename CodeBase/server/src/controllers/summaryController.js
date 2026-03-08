import Room from '../models/Room.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export const getSessionSummary = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({
      roomId: room._id,
      topic: room.topic,
      category: room.category,
      duration: room.duration,
      participantCount: room.participants.length,
      createdAt: room.createdAt,
      isActive: room.isActive,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session summary' });
  }
};

export const generateAISummary = async (req, res) => {
  try {
    const { transcripts, topic, category, duration, participantCount } = req.body;

    if (!transcripts || transcripts.length === 0) {
      return res.json({ summary: null, reason: 'No transcript data available.' });
    }

    if (!genAI) {
      return res.json({ summary: null, reason: 'AI summary not configured (GEMINI_API_KEY missing).' });
    }

    // Limit transcript size to prevent abuse (max ~2000 words)
    const trimmedTranscripts = transcripts.slice(0, 100).join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are summarizing an anonymous voice room conversation from WaveTone.

Room topic: "${topic || 'General'}"
Category: ${category || 'General'}
Duration: ${duration || '?'} minutes
Participants: ${participantCount || '?'}

Below are speech-to-text transcripts captured during the session. They may be incomplete or contain recognition errors.

Transcripts:
${trimmedTranscripts}

Generate a concise 2-4 sentence summary of what was discussed. Focus on key topics and takeaways. Do NOT include any personal identifiers. Keep it neutral and informative. If the transcripts are too fragmented to summarize, say so briefly.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({ summary });
  } catch (err) {
    console.error('AI summary error:', err.message);
    res.json({ summary: null, reason: 'AI summary generation failed.' });
  }
};
