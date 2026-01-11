/**
 * ======================== AUTOMATION ROUTES ========================
 * API endpoints for job automation control with database integration
 */

import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    startAutomation,
    stopAutomation,
    getLogs,
    clearLogs,
    isAutomationRunning,
    resetAutomationState,
} from '../autoApply.js';
import { authenticateToken } from '../middleware/auth.js';
import JobSettings from '../models/JobSettings.js';
import User from '../models/User.js';
import Skill from '../models/Skill.js';
import UserFilter from '../models/UserFilter.js';
import { setUserData, initializeSkillsFromDB } from '../aiAnswer.js';
import { getCredentials } from '../utils/credentialsManager.js';
import sequelize from '../db/config.js';
import { scheduleJobForUser, cancelScheduledJob } from '../services/schedulerService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Fetch final_url from user_filters table for given userId
async function fetchFinalUrlFromDB(userId) {
    try {
        const [rows] = await sequelize.query(
            `SELECT final_url 
             FROM user_filters 
             WHERE user_id = :userId
             LIMIT 1`,
            { replacements: { userId } }
        );

        if (!rows || rows.length === 0) {
            console.log("No filter data for user:", userId);
            return null;
        }

        const url = rows.final_url || rows[0].final_url;

        if (!url || url.trim() === "") {
            console.log("Empty final_url for user:", userId);
            return null;
        }

        return url.trim();

    } catch (err) {
        console.error("DB fetch error:", err);
        return null;
    }
}

/**
 * POST /api/automation/run-bot
 * Start job automation bot with full data loading from database
 * Loads: User settings, resume, credentials, job preferences
 * Runs Puppeteer with visible browser window
 * Requires: JWT authentication token
 */
router.post('/run-bot', authenticateToken, async (req, res) => {
    try {
        if (isAutomationRunning()) {
            return res.status(400).json({ error: 'Automation is already running. Please wait for it to complete.' });
        }

        // 1. Get user from database
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 2. Get job settings from database
        const jobSettings = await JobSettings.findOne({
            where: { userId: req.userId },
        });

        if (!jobSettings) {
            return res.status(404).json({ error: 'Job settings not configured. Please complete your profile first.' });
        }

        // 3. Get credentials (from system keychain or .env)
        let naukriEmail = jobSettings.naukriEmail;
        let naukriPassword = jobSettings.naukriPassword;

        // If credentials not in DB, try keychain
        if (!naukriEmail || !naukriPassword) {
            try {
                const creds = await getCredentials();
                naukriEmail = creds.email;
                naukriPassword = creds.password;
            } catch (err) {
                return res.status(400).json({
                    error: 'Naukri credentials not found. Please add your Naukri.com email and password in the Job Profile settings to continue.'
                });
            }
        }

        // 4. Load user skills from database
        const skills = await Skill.findAll({
            where: { userId: req.userId },
        });

        // Format skills for use in automation
        const skillsData = skills.map(skill => ({
            name: skill.displayName || skill.skillName,
            rating: skill.rating,
            experience: skill.experience
        }));

        // 5. Validate required fields
        if (!naukriEmail || !naukriPassword) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // 6. Load user data into AI answer module
        setUserData({
            name: user.firstName || 'User',
            currentCTC: jobSettings.currentCTC || '',
            expectedCTC: jobSettings.expectedCTC || '',
            noticePeriod: jobSettings.noticePeriod || '',
            location: jobSettings.location || '',
            targetRole: jobSettings.targetRole || 'Software Engineer',
            yearsOfExperience: jobSettings.yearsOfExperience || '0',
            naukriEmail: naukriEmail,
            availability: jobSettings.availability || '',
            skills: skillsData,
        });

        // Load skills from database for intelligent answering
        await initializeSkillsFromDB(req.userId, {
            host: process.env.DB_HOST || 'database-1.c72i2s6muax7.ap-south-1.rds.amazonaws.com',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'admin',
            password: process.env.DB_PASSWORD || 'YsjlUaX5yFJGtZqjmrSj',
            database: process.env.DB_NAME || 'jobautomate',
        });

        // 7. Get request parameters
        const {
            jobUrl,
            searchKeywords
        } = req.body;

        // 6A. Fetch final_url from DB
        const finalUrlFromDb = await fetchFinalUrlFromDB(req.userId);
        console.log('Final URL from DB:', finalUrlFromDb);

        // Get maxPages from job settings (user-configured value)
        const maxPages = jobSettings.maxPages || 5;

        // 7. Start automation with all data loaded
        const result = await startAutomation({
            userId: req.userId,  // Pass userId for direct DB lookup
            jobUrl: finalUrlFromDb || 'https://www.naukri.com/mnjuser/homepage/https://www.naukri.com/mnjuser/homepage',
            maxPages: Math.min(maxPages, 50), // Cap at 50 pages (same as UI max)
            searchKeywords: searchKeywords || jobSettings.searchKeywords,
            resumeText: jobSettings.resumeText || 'No resume provided',
            naukriEmail: naukriEmail,
            naukriPassword: naukriPassword,
        });

        // Return success response with logs
        res.json({
            success: result.success,
            message: result.success
                ? `Bot completed! Applied to ${result.jobsApplied} jobs`
                : `Bot encountered error: ${result.error}`,
            jobsApplied: result.jobsApplied || 0,
            logs: result.logs,
            error: result.error || null,
        });

    } catch (error) {
        console.error('Run bot error:', error);
        res.status(500).json({
            error: error.message || 'Failed to start bot',
            logs: getLogs(),
        });
    }
});

/**
 * POST /api/automation/start
 * Start the job application automation (with database integration)
 * Body: {
 *   jobUrl: string (optional),
 *   maxPages: number (optional)
 * }
 * Requires: JWT authentication token
 */
router.post('/start', authenticateToken, async (req, res) => {
    try {
        if (isAutomationRunning()) {
            return res.status(400).json({ error: 'Automation is already running' });
        }

        // Get user's job settings from database
        const jobSettings = await JobSettings.findOne({
            where: { userId: req.userId },
        });

        if (!jobSettings) {
            return res.status(404).json({ error: 'Job settings not configured. Please save your profile first.' });
        }

        // Load user data into aiAnswer module for dynamic answers
        setUserData({
            name: jobSettings.firstName || 'User',
            currentCTC: jobSettings.currentCTC,
            expectedCTC: jobSettings.expectedCTC,
            noticePeriod: jobSettings.noticePeriod,
            location: jobSettings.location,
            yearsOfExperience: jobSettings.yearsOfExperience,
            naukriEmail: jobSettings.naukriEmail,
        });

        // Load skills from database for intelligent answering
        await initializeSkillsFromDB(req.userId, {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'jobautomate',
        });

        const { jobUrl, maxPages } = req.body;

        const result = await startAutomation({
            jobUrl: jobUrl || 'https://www.naukri.com/jobs-by-skill-software-engineer',
            maxPages: maxPages || 10,
            resumeText: jobSettings.resumeText,
            naukriEmail: jobSettings.naukriEmail,
            naukriPassword: jobSettings.naukriPassword,
        });

        res.json(result);
    } catch (error) {
        console.error('Start automation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/automation/stop
 * Stop the currently running automation
 */
router.post('/stop', authenticateToken, async (req, res) => {
    try {
        if (!isAutomationRunning()) {
            return res.status(400).json({ error: 'No automation running' });
        }

        await stopAutomation();
        res.json({
            success: true,
            message: 'Automation stopped',
            logs: getLogs(),
        });
    } catch (error) {
        console.error('Stop automation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/automation/schedule
 * Schedule automation for a specific time
 */

router.post('/schedule', authenticateToken, async (req, res) => {
    try {
        const { scheduledTime } = req.body;

        if (!scheduledTime) {
            return res.status(400).json({ error: 'Scheduled time is required' });
        }

        const date = new Date(scheduledTime);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        if (date < new Date()) {
            return res.status(400).json({ error: 'Scheduled time must be in the future' });
        }

        // Save to DB
        await JobSettings.update(
            {
                scheduledTime: date,
                scheduleStatus: 'pending'
            },
            { where: { userId: req.userId } }
        );

        // Schedule in memory
        scheduleJobForUser(req.userId, date);

        res.json({
            success: true,
            message: `Automation scheduled for ${date.toLocaleString()}`,
            scheduledTime: date
        });

    } catch (error) {
        console.error('Schedule error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/automation/cancel-schedule
 * Cancel scheduled automation
 */
router.post('/cancel-schedule', authenticateToken, async (req, res) => {
    try {
        // Update DB
        await JobSettings.update(
            { scheduleStatus: 'cancelled', scheduledTime: null },
            { where: { userId: req.userId } }
        );

        // Cancel in memory
        cancelScheduledJob(req.userId);

        res.json({
            success: true,
            message: 'Scheduled automation cancelled'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/automation/schedule-status
 * Get current schedule status
 */
router.get('/schedule-status', authenticateToken, async (req, res) => {
    try {
        const jobSettings = await JobSettings.findOne({
            where: { userId: req.userId }
        });

        if (!jobSettings) {
            return res.json({
                success: true,
                hasSchedule: false,
                scheduledTime: null,
                status: null
            });
        }

        res.json({
            success: true,
            hasSchedule: jobSettings.scheduledTime ? true : false,
            scheduledTime: jobSettings.scheduledTime,
            status: jobSettings.scheduleStatus
        });
    } catch (error) {
        console.error('Get schedule status error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/automation/logs
 * Get current automation logs (auth required)
 */
router.get('/logs', authenticateToken, (req, res) => {
    try {
        const logs = getLogs();
        res.json({
            logs,
            isRunning: isAutomationRunning(),
            logCount: logs.length,
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/automation/status
 * Get automation status (auth required)
 */
router.get('/status', authenticateToken, (req, res) => {
    try {
        res.json({
            isRunning: isAutomationRunning(),
            logCount: getLogs().length,
            lastLog: getLogs()[getLogs().length - 1] || null,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/automation/clear-logs
 * Clear all logs (auth required)
 */
router.post('/clear-logs', authenticateToken, (req, res) => {
    try {
        clearLogs();
        res.json({
            success: true,
            message: 'Logs cleared',
        });
    } catch (error) {
        console.error('Clear logs error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/automation/reset
 * Force reset automation state (for stuck/error recovery)
 */
router.post('/reset', authenticateToken, (req, res) => {
    try {
        resetAutomationState();
        res.json({
            success: true,
            message: 'Automation state reset successfully',
        });
    } catch (error) {
        console.error('Reset automation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/automation/status
 * Get automation status
 */
router.get('/status', (_req, res) => {
    try {
        const running = isAutomationRunning();
        const logs = getLogs();

        res.json({
            isRunning: running,
            logCount: logs.length,
            lastLog: logs.length > 0 ? logs[logs.length - 1] : null,
        });
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Track running filter process
let filterProcess = null;
let filterLogs = [];
let filterFinalUrl = null;
let filterUserId = null;

/**
 * POST /api/automation/run-filter
 * Run autoFilter.js with user's saved filters
 * Launches Puppeteer to apply job search filters on Naukri
 */
router.post('/run-filter', authenticateToken, async (req, res) => {
    try {
        if (filterProcess) {
            return res.status(400).json({ error: 'Filter automation is already running' });
        }

        const userId = req.userId;
        const { filters = {} } = req.body;
        filterLogs = [];
        filterFinalUrl = null;
        filterUserId = userId;

        // Path to autoFilter.js
        const scriptPath = path.join(__dirname, '..', 'autoFilter.js');

        // Build environment variables with filters (comma-separated values)
        const filterEnv = {
            ...process.env,
            USER_ID: userId,
            FILTER_FRESHNESS: filters.freshness || '',
            FILTER_SALARY_RANGE: filters.salaryRange || '',
            FILTER_WFH_TYPE: filters.wfhType || '',
            FILTER_CITIES: filters.citiesGid || '',
            FILTER_FUNCTIONAL_AREA: filters.functionalAreaGid || '',
            FILTER_INDUSTRY: filters.industryTypeGid || '',
            FILTER_UG_COURSE: filters.ugCourseGid || '',
            FILTER_PG_COURSE: filters.pgCourseGid || '',
            FILTER_BUSINESS_SIZE: filters.business_size || '',
            FILTER_EMPLOYMENT: filters.employement || '',
            FILTER_ROLE_CAT: filters.glbl_RoleCat || '',
            FILTER_TOP_GROUP: filters.topGroupId || '',
            FILTER_FEATURED: filters.featuredCompanies || '',
        };

        // Spawn the process with userId as argument and filters as env vars
        filterProcess = spawn('node', [scriptPath, userId], {
            cwd: path.join(__dirname, '..'),
            env: filterEnv
        });

        // Collect stdout logs
        filterProcess.stdout.on('data', async (data) => {
            const lines = data.toString().split('\n').filter(line => line.trim());
            for (const line of lines) {
                filterLogs.push({
                    timestamp: new Date().toLocaleTimeString(),
                    message: line,
                    type: line.includes('❌') ? 'error' : line.includes('✅') ? 'success' : 'info'
                });

                // Detect final URL and save to database
                if (line.includes('🔗 Final URL:')) {
                    const urlMatch = line.match(/🔗 Final URL:\s*(.+)/);
                    if (urlMatch && urlMatch[1]) {
                        filterFinalUrl = urlMatch[1].trim();
                        console.log('[autoFilter] Final URL detected:', filterFinalUrl);

                        // Save to database
                        try {
                            await UserFilter.update(
                                { finalUrl: filterFinalUrl },
                                { where: { userId: filterUserId } }
                            );
                            console.log('[autoFilter] Final URL saved to database');
                            filterLogs.push({
                                timestamp: new Date().toLocaleTimeString(),
                                message: '💾 Final URL saved to database',
                                type: 'success'
                            });

                            // Kill the process after saving URL - job is done
                            if (filterProcess) {
                                console.log('[autoFilter] Stopping process after final URL saved');
                                filterLogs.push({
                                    timestamp: new Date().toLocaleTimeString(),
                                    message: '✅ Filter automation completed successfully',
                                    type: 'success'
                                });
                                filterProcess.kill('SIGTERM');
                                filterProcess = null;
                            }
                        } catch (dbErr) {
                            console.error('[autoFilter] Failed to save URL:', dbErr);
                        }
                    }
                }
            }
            console.log('[autoFilter]', data.toString());
        });

        // Collect stderr logs
        filterProcess.stderr.on('data', (data) => {
            filterLogs.push({
                timestamp: new Date().toLocaleTimeString(),
                message: data.toString(),
                type: 'error'
            });
            console.error('[autoFilter error]', data.toString());
        });

        // Handle process exit
        filterProcess.on('close', (code) => {
            console.log(`[autoFilter] Process exited with code ${code}`);
            filterLogs.push({
                timestamp: new Date().toLocaleTimeString(),
                message: code === 0 ? '✅ Filter automation completed' : `❌ Process exited with code ${code}`,
                type: code === 0 ? 'success' : 'error'
            });
            filterProcess = null;
        });

        filterProcess.on('error', (err) => {
            console.error('[autoFilter] Failed to start:', err);
            filterLogs.push({
                timestamp: new Date().toLocaleTimeString(),
                message: `❌ Failed to start: ${err.message}`,
                type: 'error'
            });
            filterProcess = null;
        });

        res.json({
            success: true,
            message: 'Filter automation started. Browser will open shortly.',
            logs: filterLogs
        });

    } catch (error) {
        console.error('Run filter error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/automation/filter-logs
 * Get current filter automation logs
 */
router.get('/filter-logs', authenticateToken, (_req, res) => {
    try {
        res.json({
            logs: filterLogs,
            isRunning: filterProcess !== null,
            logCount: filterLogs.length,
            finalUrl: filterFinalUrl,
            completed: filterFinalUrl !== null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/automation/stop-filter
 * Stop the running filter automation
 */
router.post('/stop-filter', authenticateToken, (_req, res) => {
    try {
        if (!filterProcess) {
            return res.status(400).json({ error: 'No filter automation running' });
        }

        filterProcess.kill('SIGTERM');
        filterProcess = null;
        filterLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            message: '⚠️ Filter automation stopped by user',
            type: 'warning'
        });

        res.json({
            success: true,
            message: 'Filter automation stopped',
            logs: filterLogs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
