/**
 * ======================== CREDENTIALS ROUTES ========================
 * API endpoints for credential management
 */

import express from 'express';
import { saveCredentials, hasCredentials, clearCredentials } from '../utils/credentialsManager.js';

const router = express.Router();

/**
 * POST /api/credentials/set
 * Save Naukri credentials securely
 * Body: {
 *   email: string,
 *   password: string
 * }
 */
router.post('/set', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        await saveCredentials(email, password);

        res.json({
            success: true,
            message: 'Credentials saved securely',
        });
    } catch (error) {
        console.error('Save credentials error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/credentials/check
 * Check if credentials are saved
 */
router.get('/check', async (req, res) => {
    try {
        const hasCredsaved = await hasCredentials();
        res.json({
            hasCredentials: hasCredsaved,
            message: hasCredsaved
                ? 'Credentials are configured'
                : 'No credentials found',
        });
    } catch (error) {
        console.error('Check credentials error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/credentials/clear
 * Clear saved credentials
 */
router.delete('/clear', async (req, res) => {
    try {
        await clearCredentials();
        res.json({
            success: true,
            message: 'Credentials cleared',
        });
    } catch (error) {
        console.error('Clear credentials error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
