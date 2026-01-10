/**
 * ======================== PROFILE UPDATE ROUTES ========================
 * API endpoints for Naukri profile auto-update feature
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { queueSafeUpdateResume, forceResetUpdateLock } from '../services/naukriProfileUpdate.js';
import sequelize from '../db/config.js';
import {
    scheduleProfileUpdateForUser,
    cancelProfileUpdateForUser
} from '../services/schedulerService.js';

const router = express.Router();

/**
 * POST /api/profile-update/reset-lock
 * Force reset the profile update lock (for recovery from stuck states)
 * Requires authentication
 */
router.post('/reset-lock', authenticateToken, async (req, res) => {
    try {
        const result = forceResetUpdateLock();
        console.log(`[Profile Update] Lock reset by userId: ${req.userId}`);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('[Profile Update] Reset lock error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Store async update results in memory (per user)
const asyncUpdateResults = new Map();

/**
 * POST /api/profile-update/naukri/update-resume
 * Update Naukri resume headline (append space to keep profile fresh)
 * Now runs asynchronously to avoid gateway timeouts
 * Requires authentication
 */
router.post('/naukri/update-resume', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { async: runAsync = true } = req.body; // Default to async mode

        console.log(`[Profile Update] Request received for userId: ${userId} (async: ${runAsync})`);

        // ========== STEP 1: FETCH CREDENTIALS FROM DATABASE ==========
        const [jobSettings] = await sequelize.query(
            'SELECT naukri_email, naukri_password FROM job_settings WHERE user_id = ? LIMIT 1',
            { replacements: [userId] }
        );

        if (!jobSettings || jobSettings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job settings not found. Please complete your Job Profile first.',
                status: 'failed'
            });
        }

        const { naukri_email, naukri_password } = jobSettings[0];

        if (!naukri_email || !naukri_password) {
            return res.status(400).json({
                success: false,
                error: 'Naukri credentials not configured. Please add your Naukri email and password in Job Profile settings.',
                status: 'failed'
            });
        }

        console.log(`[Profile Update] Credentials found for: ${naukri_email}`);

        // ========== ASYNC MODE: Return immediately, process in background ==========
        if (runAsync) {
            // Store initial status
            asyncUpdateResults.set(userId, {
                status: 'running',
                message: 'Profile update in progress...',
                startedAt: new Date().toISOString(),
                logs: ['Update started']
            });

            // Return immediately
            res.json({
                success: true,
                status: 'running',
                message: 'Profile update started. Check /api/profile-update/result for status.',
                startedAt: new Date().toISOString()
            });

            // Run update in background (don't await)
            (async () => {
                try {
                    console.log(`[Profile Update] Starting background update for: ${naukri_email}`);
                    const result = await queueSafeUpdateResume(naukri_email, naukri_password);

                    console.log(`[Profile Update] Background result: ${result.status}`);

                    // Save timestamp on success
                    if (result.status === 'success') {
                        try {
                            await sequelize.query(
                                `UPDATE job_settings SET last_profile_update = NOW() WHERE user_id = ?`,
                                { replacements: [userId] }
                            );
                        } catch (dbError) {
                            console.error(`[Profile Update] Failed to save timestamp:`, dbError.message);
                        }
                    }

                    // Store result
                    asyncUpdateResults.set(userId, {
                        ...result,
                        completedAt: new Date().toISOString()
                    });

                    // Auto-cleanup after 10 minutes
                    setTimeout(() => asyncUpdateResults.delete(userId), 10 * 60 * 1000);

                } catch (error) {
                    console.error(`[Profile Update] Background error:`, error);
                    asyncUpdateResults.set(userId, {
                        status: 'failed',
                        message: error.message,
                        completedAt: new Date().toISOString(),
                        logs: [`Error: ${error.message}`]
                    });
                }
            })();

            return; // Response already sent
        }

        // ========== SYNC MODE: Wait for result (may timeout) ==========
        console.log(`[Profile Update] Starting sync update...`);

        const result = await queueSafeUpdateResume(naukri_email, naukri_password);

        console.log(`[Profile Update] Result: ${result.status}`);

        if (result.status === 'success') {
            try {
                await sequelize.query(
                    `UPDATE job_settings SET last_profile_update = NOW() WHERE user_id = ?`,
                    { replacements: [userId] }
                );
                console.log(`[Profile Update] Timestamp saved to database`);
            } catch (dbError) {
                console.error(`[Profile Update] Failed to save timestamp:`, dbError.message);
            }
        }

        return res.json({
            success: result.status === 'success',
            status: result.status,
            message: result.message,
            executedAt: result.executedAt,
            logs: result.logs,
            ...(result.status === 'failed' && result.screenshot && {
                screenshot: result.screenshot
            })
        });

    } catch (error) {
        console.error('[Profile Update] API Error:', error);
        return res.status(500).json({
            success: false,
            status: 'failed',
            error: error.message,
            message: 'Profile update failed due to server error'
        });
    }
});

/**
 * GET /api/profile-update/result
 * Get the result of an async profile update
 * Returns current status if update is still running
 */
router.get('/result', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        const result = asyncUpdateResults.get(userId);

        if (!result) {
            return res.json({
                success: true,
                status: 'idle',
                message: 'No recent profile update. Start one using POST /api/profile-update/naukri/update-resume'
            });
        }

        return res.json({
            success: result.status === 'success',
            ...result
        });

    } catch (error) {
        console.error('[Profile Update Result] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/profile-update/status
 * Get last profile update status and timestamp
 */
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        const [result] = await sequelize.query(
            `SELECT last_profile_update
             FROM job_settings
             WHERE user_id = ?
             LIMIT 1`,
            { replacements: [userId] }
        );

        if (!result || result.length === 0) {
            return res.json({
                success: true,
                lastUpdate: null,
                message: 'No profile updates yet'
            });
        }

        const lastUpdate = result[0].last_profile_update;

        return res.json({
            success: true,
            lastUpdate: lastUpdate,
            message: lastUpdate ? 'Last update found' : 'No updates yet'
        });

    } catch (error) {
        console.error('[Profile Update Status] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/profile-update/scheduler/configure
 * Enable/configure automatic profile update scheduling
 * Body: { enabled: boolean, frequency: number }
 */
router.post('/scheduler/configure', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { enabled, frequency, scheduleTime } = req.body;

        console.log(`[Profile Update Scheduler] Configure request: enabled=${enabled}, frequency=${frequency}, scheduleTime=${scheduleTime}, userId=${userId}`);

        // ========== VALIDATION ==========
        if (enabled && (!frequency || frequency < 1 || frequency > 30)) {
            return res.status(400).json({
                success: false,
                error: 'Frequency must be between 1 and 30 days'
            });
        }

        // Validate scheduleTime format (HH:MM)
        if (enabled && scheduleTime) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(scheduleTime)) {
                return res.status(400).json({
                    success: false,
                    error: 'Schedule time must be in HH:MM format (e.g., 09:00, 14:30)'
                });
            }
        }

        // ========== FETCH JOB SETTINGS ==========
        const [jobSettings] = await sequelize.query(
            'SELECT naukri_email, naukri_password FROM job_settings WHERE user_id = ? LIMIT 1',
            { replacements: [userId] }
        );

        if (!jobSettings || jobSettings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job settings not found'
            });
        }

        const { naukri_email, naukri_password } = jobSettings[0];

        // ========== CHECK CREDENTIALS ==========
        if (enabled && (!naukri_email || !naukri_password)) {
            return res.status(400).json({
                success: false,
                error: 'Please add Naukri credentials in Job Profile before enabling auto-update'
            });
        }

        // ========== CALCULATE NEXT RUN TIME ==========
        let nextRun = null;
        const timeToUse = scheduleTime || '09:00';

        if (enabled) {
            nextRun = new Date();

            // Set the time based on scheduleTime
            const [hours, minutes] = timeToUse.split(':').map(Number);
            nextRun.setHours(hours, minutes, 0, 0);

            // If the scheduled time has already passed today, schedule for next occurrence
            const now = new Date();
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + frequency);
            }
        }

        // ========== UPDATE DATABASE ==========
        await sequelize.query(
            `UPDATE job_settings
             SET profile_update_enabled = ?,
                 profile_update_frequency = ?,
                 profile_update_schedule_time = ?,
                 profile_update_next_run = ?,
                 profile_update_last_status = ?
             WHERE user_id = ?`,
            {
                replacements: [
                    enabled,
                    frequency || 1,
                    timeToUse + ':00', // Convert HH:MM to HH:MM:SS for TIME column
                    nextRun,
                    enabled ? 'scheduled' : 'idle',
                    userId
                ]
            }
        );

        // ========== SCHEDULE OR CANCEL JOB ==========
        if (enabled) {
            console.log(`[Profile Update Scheduler] Scheduling job for user ${userId}`);
            console.log(`[Profile Update Scheduler] Frequency: Every ${frequency} day(s)`);
            console.log(`[Profile Update Scheduler] Time: ${timeToUse}`);
            console.log(`[Profile Update Scheduler] Next run: ${nextRun.toLocaleString()}`);
            scheduleProfileUpdateForUser(userId, nextRun);
        } else {
            cancelProfileUpdateForUser(userId);
            console.log(`[Profile Update Scheduler] Disabled for user ${userId}`);
        }

        return res.json({
            success: true,
            message: enabled ? 'Auto-update enabled successfully' : 'Auto-update disabled',
            nextRun: nextRun ? nextRun.toISOString() : null,
            frequency
        });

    } catch (error) {
        console.error('[Profile Update Scheduler Configure] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to configure auto-update'
        });
    }
});

/**
 * GET /api/profile-update/scheduler/status
 * Get auto-update scheduler status
 */
router.get('/scheduler/status', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        const [result] = await sequelize.query(
            `SELECT profile_update_enabled,
                    profile_update_frequency,
                    profile_update_schedule_time,
                    profile_update_next_run,
                    profile_update_last_status,
                    last_profile_update
             FROM job_settings
             WHERE user_id = ?
             LIMIT 1`,
            { replacements: [userId] }
        );

        if (!result || result.length === 0) {
            return res.json({
                success: true,
                enabled: false,
                frequency: 1,
                scheduleTime: '09:00',
                nextRun: null,
                lastStatus: 'idle',
                lastUpdate: null
            });
        }

        const settings = result[0];

        // Convert TIME to HH:MM format (remove seconds)
        let scheduleTime = '09:00';
        if (settings.profile_update_schedule_time) {
            scheduleTime = settings.profile_update_schedule_time.substring(0, 5);
        }

        return res.json({
            success: true,
            enabled: settings.profile_update_enabled || false,
            frequency: settings.profile_update_frequency || 1,
            scheduleTime: scheduleTime,
            nextRun: settings.profile_update_next_run,
            lastStatus: settings.profile_update_last_status || 'idle',
            lastUpdate: settings.last_profile_update
        });

    } catch (error) {
        console.error('[Profile Update Scheduler Status] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch scheduler status'
        });
    }
});

export default router;
