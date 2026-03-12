/**
 * ======================== AI JOB ASSISTANT ROUTES ========================
 * Chat endpoint for the AI Job Assistant feature
 */

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/ai/chat
 * Body: { message: string, systemPrompt: string, history: [{role, content}] }
 */
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message, systemPrompt, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return res.status(503).json({
                error: 'AI service not configured. Please add ANTHROPIC_API_KEY to server environment.'
            });
        }

        const client = new Anthropic({ apiKey });

        // Build messages from history + new user message
        const messages = [
            ...history.map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message.trim() },
        ];

        const response = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: systemPrompt ||
                'You are an expert AI job search assistant helping Indian job seekers land their dream job. ' +
                'Give practical, concise, and actionable advice.',
            messages,
        });

        const reply = response.content[0]?.text || 'Sorry, I could not generate a response.';
        res.json({ reply });

    } catch (error) {
        console.error('[AI Chat] Error:', error.message);
        res.status(500).json({ error: error.message || 'AI service error' });
    }
});

export default router;
